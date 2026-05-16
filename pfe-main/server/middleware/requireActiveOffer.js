import prisma from "../prismaClient.js";

/**
 * Checks if user has an ACTIVE subscription
 */
export const requireActiveOffer = async (req, res, next) => {
  try {
    console.log("🔥 requireActiveOffer triggered");

    // 👇 IMPORTANT DEBUG
    console.log("👤 req.user:", req.user);

    const userId = req.user?.id || req.user?._id;

    console.log("🆔 Extracted userId:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "User not found in request (auth issue)",
      });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        patientId: userId,
        status: "ACTIVE",
      },
      include: {
        offer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 👇 DEBUG RESULT
    console.log("📦 Subscription found:", subscription);

    if (!subscription) {
      return res.status(403).json({
        message: "Access denied - No active subscription",
      });
    }

    req.subscription = subscription;

    console.log("✅ Access granted");

    next();
  } catch (err) {
    console.error("❌ Middleware error:", err);
    return res.status(500).json({
      message: "Server error in subscription check",
    });
  }
};