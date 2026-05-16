// controllers/planController.js
import prisma from "../prismaClient.js";

const nutritionSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    image: true,
    resume: true,
  },
};

// =====================
// 1️⃣ Get all plans (CLIENT + ADMIN)
// =====================
export const getAllPlans = async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  try {
    const plans = await prisma.plan.findMany({
      where: { isPrivate: false },
      include: {
        offer: true,
        nutrition: nutritionSelect,
      },
    });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 2️⃣ Get single plan by ID
// =====================
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        offer: true,
        nutrition: nutritionSelect,
      },
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Private plan — only nutritionist, patient or admin can see it
    if (
      plan.isPrivate &&
      plan.nutritionId !== userId &&
      plan.patientId !== userId &&
      req.user?.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    res.json({ plan });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 3️⃣ Get my plans (NUTRITION)
// =====================
export const getMyPlans = async (req, res) => {
  try {
    const nutritionId = req.user.id;

    const plans = await prisma.plan.findMany({
      where: { nutritionId },
      include: { offer: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 4️⃣ Create a PUBLIC plan (PDF based — no tracking)
/// =====================
export const createPlan = async (req, res) => {
  try {
    const nutritionId = req.user.id;

    const {
      offerName,
      offerDescription,
      offerPrice,
      offerDurationDays,
      hasFreeTrial,
      title,
      images,
      videos,
      goals,
      activityLevels,
      minWeight,
      maxWeight,
      minHeight,
      maxHeight,
      medicalConditions,
    } = req.body;

    if (!offerName || !offerPrice || !offerDurationDays || !title)
      return res.status(400).json({
        message: "offerName, offerPrice, offerDurationDays and title are required",
      });

    // Get the uploaded file path from multer instead of a URL string
    if (!req.file)
      return res.status(400).json({ message: "A PDF file is required for public plans" });

const pdfUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;

    const result = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          nutritionId,
          name: offerName,
          description: offerDescription ?? null,
          type: "PLAN",
          price: parseFloat(offerPrice),           // body fields from FormData are strings
          durationDays: parseInt(offerDurationDays),
          hasFreeTrial: hasFreeTrial === "true",
          includesSessions: false,
          isActive: true,
        },
      });

      const plan = await tx.plan.create({
        data: {
          offerId: offer.id,
          nutritionId,
          isPrivate: false,
          title,
          content: {},
          pdfUrl,
          images:            parseJsonField(images,            []),
          videos:            parseJsonField(videos,            []),
          goals:             parseJsonField(goals,             []),
          activityLevels:    parseJsonField(activityLevels,    []),
          medicalConditions: parseJsonField(medicalConditions, []),
          minWeight:  minWeight  ? parseFloat(minWeight)  : null,
          maxWeight:  maxWeight  ? parseFloat(maxWeight)  : null,
          minHeight:  minHeight  ? parseFloat(minHeight)  : null,
          maxHeight:  maxHeight  ? parseFloat(maxHeight)  : null,
        },
      });

      return { offer, plan };
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("createPlan error:", err);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
};

// Helper — FormData sends arrays/objects as JSON strings, guard against both
function parseJsonField(value, fallback) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); }
  catch { return fallback; }
}

// =====================
// 5️⃣ Update a plan (NUTRITION — own plans only, or ADMIN)
// =====================
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const nutritionId = req.user.id;

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Plan not found" });

    if (req.user.role !== "ADMIN" && existing.nutritionId !== nutritionId)
      return res.status(403).json({ message: "You can only update your own plans" });

    const {
      title,
      content,
      images,
      videos,
      pdfUrl,
      goals,
      activityLevels,
      minWeight,
      maxWeight,
      minHeight,
      maxHeight,
      medicalConditions,
      offerName,
      offerDescription,
      offerPrice,
      offerDurationDays,
      isActive,
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      if (
        offerName !== undefined ||
        offerDescription !== undefined ||
        offerPrice !== undefined ||
        offerDurationDays !== undefined ||
        isActive !== undefined
      ) {
        await tx.offer.update({
          where: { id: existing.offerId },
          data: {
            ...(offerName !== undefined && { name: offerName }),
            ...(offerDescription !== undefined && { description: offerDescription }),
            ...(offerPrice !== undefined && { price: offerPrice }),
            ...(offerDurationDays !== undefined && { durationDays: offerDurationDays }),
            ...(isActive !== undefined && { isActive }),
          },
        });
      }

      const plan = await tx.plan.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(images !== undefined && { images }),
          ...(videos !== undefined && { videos }),
          ...(pdfUrl !== undefined && { pdfUrl }),
          ...(goals !== undefined && { goals }),
          ...(activityLevels !== undefined && { activityLevels }),
          ...(minWeight !== undefined && { minWeight }),
          ...(maxWeight !== undefined && { maxWeight }),
          ...(minHeight !== undefined && { minHeight }),
          ...(maxHeight !== undefined && { maxHeight }),
          ...(medicalConditions !== undefined && { medicalConditions }),
        },
        include: { offer: true },
      });

      return plan;
    });

    res.json({ plan: result });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 6️⃣ Delete a plan (NUTRITION — own plans only, or ADMIN)
// =====================
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const nutritionId = req.user.id;

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Plan not found" });

    if (req.user.role !== "ADMIN" && existing.nutritionId !== nutritionId)
      return res.status(403).json({ message: "You can only delete your own plans" });

    const activeSubscriptions = await prisma.subscription.findFirst({
      where: { offerId: existing.offerId, status: { in: ["ACTIVE", "PENDING"] } },
    });
    if (activeSubscriptions)
      return res.status(400).json({
        message: "Cannot delete a plan with active or pending subscriptions",
      });

    await prisma.$transaction(async (tx) => {
      await tx.plan.delete({ where: { id } });
      await tx.offer.update({
        where: { id: existing.offerId },
        data: { isActive: false },
      });
    });

    res.json({ message: "Plan deleted and offer deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 7️⃣ Get recommended plans for logged-in client (PDF plans only)
// =====================
export const getRecommendedPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile)
      return res.status(404).json({
        message: "Profile not found. Please complete your profile first.",
      });

    const recommendedPlans = await prisma.plan.findMany({
      where: {
        isPrivate: false,
        offer: { isActive: true },
        AND: [
          { goals: { has: profile.goal } },
          { activityLevels: { has: profile.activityLevel } },
          { OR: [{ minWeight: null }, { minWeight: { lte: profile.weight } }] },
          { OR: [{ maxWeight: null }, { maxWeight: { gte: profile.weight } }] },
          { OR: [{ minHeight: null }, { minHeight: { lte: profile.height } }] },
          { OR: [{ maxHeight: null }, { maxHeight: { gte: profile.height } }] },
          { NOT: { medicalConditions: { hasSome: profile.medicalConditions } } },
        ],
      },
      include: {
        offer: true,
        nutrition: nutritionSelect,
      },
    });

    res.json({ recommendedPlans });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 8️⃣ Assign a PRIVATE plan to a patient (NUTRITION only)
// This is the plan with daily tracking — assigned after consultation
// =====================
export const assignPlanToPatient = async (req, res) => {
  try {
    const nutritionId = req.user.id;
    const {
      patientId,
      title,
      content,
      offerDurationDays,
      goals,
      activityLevels,
      medicalConditions,
      images,
      videos,
      pdfUrl,
    } = req.body;

    if (!patientId || !title || !content)
      return res.status(400).json({
        message: "patientId, title and content are required",
      });

    // Private plans MUST have content.days for daily tracking
    if (!content.days || !Array.isArray(content.days) || content.days.length === 0)
      return res.status(400).json({ message: "Content must have a non-empty days array" });

    // Check the patient has an active subscription with this nutritionist
    const subscription = await prisma.subscription.findFirst({
      where: {
        patientId,
        nutritionId,
        status: "ACTIVE",
      },
    });

    if (!subscription)
      return res.status(403).json({
        message: "Patient must have an active subscription with you",
      });

    const result = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          nutritionId,
          name: `Private Plan — ${title}`,
          type: "PLAN",
          price: 0,
          durationDays: offerDurationDays ?? 30,
          isActive: true,
        },
      });

      const plan = await tx.plan.create({
        data: {
          offerId: offer.id,
          nutritionId,
          patientId,
          isPrivate: true,
          title,
          content,           // ← has content.days for tracking
          goals: goals ?? [],
          activityLevels: activityLevels ?? [],
          medicalConditions: medicalConditions ?? [],
          images: images ?? [],
          videos: videos ?? [],
          pdfUrl: pdfUrl ?? null,
        },
      });

      // Auto-create UserPlan for daily tracking
      const userPlan = await tx.userPlan.create({
        data: {
          userId: patientId,
          planId: plan.id,
          subscriptionId: subscription.id,
          startDate: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: patientId,
          title: "New Plan Assigned",
          message: `Your nutritionist assigned you a new plan: ${title}`,
        },
      });

      return { plan, offer, userPlan };
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 9️⃣ Get plans assigned to a specific patient (NUTRITION)
// =====================
export const getPatientPlans = async (req, res) => {
  try {
    const nutritionId = req.user.id;
    const { patientId } = req.params;

    const plans = await prisma.plan.findMany({
      where: { nutritionId, patientId },
      include: {
        offer: true,
        userPlans: {
          where: { userId: patientId },
          include: { dailyTracking: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};