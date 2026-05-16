import prisma from "../prismaClient.js";
import Stripe from "stripe";
import { createZoomMeeting } from "../utils/zoom.js";
import { io, connectedUsers } from "../socket.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res) => {
  try {
    const { subscriptionId, paymentMethodId, sessionDate } = req.body;
    const userId = req.user.id;

    if (!subscriptionId || !paymentMethodId)
      return res.status(400).json({ message: "subscriptionId and paymentMethodId are required" });

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        offer:     true,
        patient:   true,
        nutrition: { include: { stripe: true } },
      },
    });

    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    if (subscription.patientId !== userId)
      return res.status(403).json({ message: "You cannot pay for this subscription" });

    const { offer, patient, nutrition } = subscription;

    if (!offer)
      return res.status(400).json({ message: "Offer not found" });

    if (Number(offer.price) === 0)
      return res.status(400).json({ message: "This offer is free — no payment needed" });

    const existingPayment = await prisma.payment.findFirst({
      where: { subscriptionId, status: "SUCCESS" },
    });
    if (existingPayment)
      return res.status(400).json({ message: "Subscription already paid" });

    if (subscription.status === "CANCELLED")
      return res.status(400).json({ message: "Subscription is cancelled" });

    const amount = Math.round(Number(offer.price) * 100);
    if (amount < 50)
      return res.status(400).json({ message: "Amount too small — minimum is $0.50" });

    // ── Build Stripe payment intent ──
    const paymentIntentData = {
      amount,
      currency:       "usd",
      payment_method: paymentMethodId,
      confirm:        true,
      return_url:     `${process.env.CLIENT_URL}/payment-return`,
      metadata: { subscriptionId, userId, offerType: offer.type },
    };

    // ✅ TEST MODE — only add transfer_data if nutritionist has Stripe connected
    // In test mode nutritionists may not have real Stripe accounts — skip gracefully
    if (["PACKAGE", "PLAN"].includes(offer.type)) {
      const stripeAccountId = nutrition?.stripe?.stripeAccountId;
      if (stripeAccountId) {
        paymentIntentData.transfer_data = { destination: stripeAccountId };
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentData,
      { idempotencyKey: `payment_${subscriptionId}_${Date.now()}` }
    );

    if (paymentIntent.status === "requires_action") {
      return res.json({
        requiresAction: true,
        clientSecret:   paymentIntent.client_secret,
      });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment not completed",
        status:  paymentIntent.status,
      });
    }

    // ── Pre-transaction: prepare PACKAGE first session ──
    let packageFirstSessionDate = null;
    let packageFirstSessionZoom = null;

    if (offer.type === "PACKAGE") {
      if (!sessionDate)
        return res.status(400).json({ message: "sessionDate is required for your first session" });

      packageFirstSessionDate = new Date(sessionDate);

      if (packageFirstSessionDate <= new Date())
        return res.status(400).json({ message: "Session date must be in the future" });

      const conflict = await prisma.session.findFirst({
        where: {
          nutritionId: subscription.nutritionId,
          status:      { notIn: ["CANCELLED", "PENDING_SCHEDULE"] },
          sessionDate: packageFirstSessionDate,
        },
      });
      if (conflict)
        return res.status(409).json({ message: "This time slot is already booked" });
       console.log("🔍 ABOUT TO CALL ZOOM:");
      console.log("  Nutritionist:", JSON.stringify(nutrition, null, 2));
      console.log("  Patient:", JSON.stringify(patient, null, 2));

      try {
        packageFirstSessionZoom = await createZoomMeeting(
  nutrition?.email || "",
  patient?.email   || "",
  `${offer.name} - Session 1`,
  packageFirstSessionDate  // ← pass actual session date
);
 } catch (zoomErr) {
  console.warn("Zoom failed:", zoomErr.response?.data ?? zoomErr.message);
  packageFirstSessionZoom = null;
}
    }

    // ── DB Transaction ──
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Record payment
      const payment = await tx.payment.create({
        data: {
          subscriptionId,
          amount:        offer.price,
          status:        "SUCCESS",
          paymentMethod: "stripe",
          transactionId: paymentIntent.id,
        },
      });

      // 2️⃣ Activate subscription
      await tx.subscription.update({
        where: { id: subscriptionId },
        data:  { status: "ACTIVE", startDate: new Date() },
      });

      let sessions   = [];
      let planPdfUrl = null;

      // 3️⃣ PLAN — activate UserPlan + notify
      if (offer.type === "PLAN") {
        const plan = await tx.plan.findUnique({ where: { offerId: subscription.offerId } });
        if (!plan) throw new Error("Plan not found");

        await tx.userPlan.create({
          data: {
            userId:         subscription.patientId,
            planId:         plan.id,
            subscriptionId: subscription.id,
            startDate:      new Date(),
          },
        });

        planPdfUrl = plan.pdfUrl ?? null;

        await tx.notification.create({
          data: {
            userId:  subscription.patientId,
            title:   "Your plan is ready! 🎉",
            message: planPdfUrl
              ? `Your plan "${offer.name}" is now active! Download your PDF below.`
              : `Your plan "${offer.name}" is now active!`,
            url:    planPdfUrl ?? null,
            isRead: false,
          },
        });
      }

      // 4️⃣ AI_CALORIES — notify
      if (offer.type === "AI_CALORIES") {
        await tx.notification.create({
          data: {
            userId:  subscription.patientId,
            title:   "AI Calories Plan Activated! 🤖",
            message: `Your "${offer.name}" plan is now active. Start tracking your calories!`,
            isRead:  false,
          },
        });
      }

      // 5️⃣ PACKAGE — sessions + plan + chat
      if (offer.type === "PACKAGE") {
        const totalSessions = offer.sessionsCount || 1;

        // Session 1 — scheduled at purchase
        const firstSession = await tx.session.create({
          data: {
            subscriptionId,
            patientId:     subscription.patientId,
            nutritionId:   subscription.nutritionId,
            sessionDate:   packageFirstSessionDate,
            zoomLink:      packageFirstSessionZoom,
            sessionNumber: 1,
            status:        "SCHEDULED",
          },
        });
        sessions.push(firstSession);

        // Sessions 2..N — pending schedule
        for (let i = 2; i <= totalSessions; i++) {
          const pending = await tx.session.create({
            data: {
              subscriptionId,
              patientId:     subscription.patientId,
              nutritionId:   subscription.nutritionId,
              sessionDate:   null,
              zoomLink:      null,
              sessionNumber: i,
              status:        "PENDING_SCHEDULE",
            },
          });
          sessions.push(pending);
        }

        // Activate plan if linked
        const plan = await tx.plan.findUnique({ where: { offerId: subscription.offerId } });
        if (plan) {
          await tx.userPlan.create({
            data: {
              userId:         subscription.patientId,
              planId:         plan.id,
              subscriptionId: subscription.id,
              startDate:      new Date(),
            },
          });
          planPdfUrl = plan.pdfUrl ?? null;
        }

        // Open chat with expiry
        const chatExpiresAt = new Date();
        chatExpiresAt.setDate(chatExpiresAt.getDate() + (offer.chatDays || 0));

        await tx.conversation.upsert({
          where: {
            patientId_nutritionId: {
              patientId:   subscription.patientId,
              nutritionId: subscription.nutritionId,
            },
          },
          update: { expiresAt: chatExpiresAt },
          create: {
            patientId:   subscription.patientId,
            nutritionId: subscription.nutritionId,
            expiresAt:   chatExpiresAt,
          },
        });

        // Notify patient
       // Notify patient with zoom link
await tx.notification.create({
  data: {
    userId:  subscription.patientId,
    title:   "Package Activated! 🎉",
    message: `Your package "${offer.name}" is active. Session 1 is scheduled.${
      totalSessions > 1
        ? ` Book your remaining ${totalSessions - 1} session(s) anytime.`
        : ""
    }${packageFirstSessionZoom ? " Click to join your first Zoom session." : ""}`,
    url:    packageFirstSessionZoom ?? null,
    isRead: false,
  },
});

// Notify nutritionist
await tx.notification.create({
  data: {
    userId:  subscription.nutritionId,
    title:   "New Package Booked! 📅",
    message: `${patient.firstName} ${patient.lastName} booked "${offer.name}". Session 1 is scheduled.${
      packageFirstSessionZoom ? " Click to join the Zoom session." : ""
    }`,
    url:    packageFirstSessionZoom ?? null,
    isRead: false,
  },
});
      }

      return { payment, sessions, planPdfUrl };
    });

    // ── Real-time notifications ──
    if (offer.type === "PLAN") {
      const patientSocketId = connectedUsers.get(subscription.patientId);
      if (patientSocketId) {
        io.to(patientSocketId).emit("planActivated", {
          message:   result.planPdfUrl
            ? `🎉 Your plan "${offer.name}" is now active! Download: ${result.planPdfUrl}`
            : `🎉 Your plan "${offer.name}" is now active!`,
          pdfUrl:    result.planPdfUrl,
          offerName: offer.name,
        });
      }
    }

    if (offer.type === "AI_CALORIES") {
      const patientSocketId = connectedUsers.get(subscription.patientId);
      if (patientSocketId) {
        io.to(patientSocketId).emit("aiPlanActivated", {
          message:   `🤖 Your "${offer.name}" AI plan is now active!`,
          offerName: offer.name,
        });
      }
    }

    if (offer.type === "PACKAGE" && result.sessions.length > 0) {
      const patientSocketId   = connectedUsers.get(subscription.patientId);
      const nutritionSocketId = connectedUsers.get(subscription.nutritionId);
      const pendingCount      = result.sessions.length - 1;

      if (patientSocketId)
        io.to(patientSocketId).emit("packageActivated", {
          sessions:  result.sessions,
          offerName: offer.name,
          message:   `Your package is active! Session 1 is scheduled.${
            pendingCount > 0 ? ` Book your remaining ${pendingCount} session(s) when ready.` : ""
          }`,
        });

      if (nutritionSocketId)
        io.to(nutritionSocketId).emit("newPackageSubscriber", {
          firstSession:  result.sessions[0],
          totalSessions: result.sessions.length,
          patientName:   `${patient.firstName} ${patient.lastName}`,
          offerName:     offer.name,
        });
    }

    return res.json({
      message:
        offer.type === "PACKAGE"     ? "Payment successful, package activated"  :
        offer.type === "PLAN"        ? "Payment successful, plan activated"      :
        offer.type === "AI_CALORIES" ? "Payment successful, AI plan activated"   :
                                       "Payment successful",
      payment:  result.payment,
      sessions: result.sessions,
    });

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where:   { subscription: { patientId: userId } },
      include: {
        subscription: {
          include: {
            offer:     true,
            nutrition: {
              select: { id: true, firstName: true, lastName: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;

    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: {
        subscription: {
          include: {
            offer:    true,
            patient:  true,
            nutrition: true,
            sessions: { orderBy: { sessionNumber: "asc" } },
          },
        },
      },
    });

    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    if (req.user.role !== "ADMIN" && payment.subscription.patientId !== userId)
      return res.status(403).json({ message: "Access forbidden" });

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};