import prisma from "../prismaClient.js";

// ==============================
// 1️⃣ Create Offer (NUTRITION only)
// ==============================
export const createOffer = async (req, res) => {
  try {
    const nutritionId = req.user.id;
    const {
      name,
      description,
      type,
      price,
      durationDays,
      hasFreeTrial,
      // PACKAGE fields
      sessionsCount,
      chatDays,
    } = req.body;

    if (!name || !type || price === undefined || !durationDays)
      return res.status(400).json({ message: "name, type, price and durationDays are required" });

    if (!["PLAN", "AI_CALORIES", "PACKAGE"].includes(type))
      return res.status(400).json({ message: "Invalid offer type. Must be PLAN, AI_CALORIES or PACKAGE" });

    // PACKAGE requires Stripe to be connected (payments go to nutritionist)
    if (type === "PACKAGE") {
      const stripeAccount = await prisma.stripe.findUnique({ where: { userId: nutritionId } });
      if (!stripeAccount)
        return res.status(400).json({ message: "You must connect Stripe before creating a PACKAGE offer" });

      if (!sessionsCount || sessionsCount < 1)
        return res.status(400).json({ message: "sessionsCount must be at least 1 for PACKAGE offers" });
    }

    // PLAN also requires Stripe (nutritionist gets paid)
    if (type === "PLAN" && Number(price) > 0) {
      const stripeAccount = await prisma.stripe.findUnique({ where: { userId: nutritionId } });
      if (!stripeAccount)
        return res.status(400).json({ message: "You must connect Stripe before creating a paid PLAN offer" });
    }

    const offer = await prisma.offer.create({
      data: {
        nutritionId,
        name,
        description:  description ?? null,
        type,
        price:        Number(price),
        durationDays: Number(durationDays),
        hasFreeTrial: hasFreeTrial ?? false,
        // PACKAGE-specific — ignored for PLAN and AI_CALORIES
        sessionsCount: type === "PACKAGE" ? Number(sessionsCount) : 0,
        chatDays:      type === "PACKAGE" ? Number(chatDays ?? 0)  : 0,
        isActive:      true,
      },
    });

    await prisma.resume.update({
      where: { userId: nutritionId },
      data:  { offersTypes: { push: type } },
    });

    res.status(201).json({ offer });
  } catch (err) {
    console.error("Create Offer Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 2️⃣ Get all active offers
// ==============================
export const getAllOffers = async (req, res) => {
  try {
    const { type } = req.query;

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
      },
      include: {
        plan: {
          include: {
            nutrition: {
              select: { id: true, firstName: true, lastName: true, image: true, resume: true },
            },
          },
        },
        nutrition: {
          select: { id: true, firstName: true, lastName: true, image: true, resume: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 3️⃣ Get all PACKAGE offers
// ==============================
export const getPackageOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { type: "PACKAGE", isActive: true },
      include: {
        nutrition: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            resume: {
              select: {
                bio: true,
                experienceYears: true,
                specializations: true,
                ratingAverage: true,
                education: true,
                workplace: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 4️⃣ Get all PLAN offers
// ==============================
export const getPlanOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { type: "PLAN", isActive: true },
      include: {
        plan: true,
        nutrition: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            resume: {
              select: {
                bio: true,
                experienceYears: true,
                specializations: true,
                ratingAverage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 5️⃣ Get single offer by ID
// ==============================
export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        plan: true,
        nutrition: {
          select: { id: true, firstName: true, lastName: true, image: true, resume: true },
        },
      },
    });

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ offer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 6️⃣ Get my offers (NUTRITION)
// ==============================
export const getMyOffers = async (req, res) => {
  try {
    const nutritionId = req.user.id;

    const offers = await prisma.offer.findMany({
      where:   { nutritionId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 7️⃣ Update Offer
// ==============================
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      durationDays,
      hasFreeTrial,
      isActive,
      sessionsCount,
      chatDays,
    } = req.body;

    const offer = await prisma.offer.findUnique({
      where:   { id },
      include: { plan: true },
    });
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const ownerId = offer.nutritionId ?? offer.plan?.nutritionId;
    if (req.user.role !== "ADMIN" && ownerId !== req.user.id)
      return res.status(403).json({ message: "Access forbidden" });

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        ...(name          !== undefined && { name }),
        ...(description   !== undefined && { description }),
        ...(price         !== undefined && { price: Number(price) }),
        ...(durationDays  !== undefined && { durationDays: Number(durationDays) }),
        ...(hasFreeTrial  !== undefined && { hasFreeTrial }),
        ...(isActive      !== undefined && { isActive }),
        ...(sessionsCount !== undefined && { sessionsCount: Number(sessionsCount) }),
        ...(chatDays      !== undefined && { chatDays: Number(chatDays) }),
      },
    });

    res.json({ offer: updatedOffer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 8️⃣ Delete Offer
// ==============================
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findUnique({
      where:   { id },
      include: { plan: true },
    });
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const ownerId = offer.nutritionId ?? offer.plan?.nutritionId;
    if (req.user.role !== "ADMIN" && ownerId !== req.user.id)
      return res.status(403).json({ message: "Access forbidden" });

    const activeSubscriptions = await prisma.subscription.findFirst({
      where: { offerId: id, status: { in: ["ACTIVE", "PENDING"] } },
    });
    if (activeSubscriptions)
      return res.status(400).json({
        message: "Cannot delete an offer with active or pending subscriptions",
      });

    await prisma.offer.delete({ where: { id } });

    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};