import prisma from "../prismaClient.js";

export const createNutritionistReview = async (req, res) => {
  const clientId       = req.user.id;
  const nutritionistId = req.params.nutritionistId;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    // 1. Verify PACKAGE subscription — try both patientId and clientId field names
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { patientId: clientId,  nutritionistId, offer: { type: "PACKAGE" } },
          { clientId:  clientId,  nutritionistId, offer: { type: "PACKAGE" } },
        ],
      },
    });

    if (!subscription) {
      // fallback: maybe nutritionistId is stored as nutritionId
      const subscription2 = await prisma.subscription.findFirst({
        where: {
          OR: [
            { patientId: clientId, nutritionId: nutritionistId, offer: { type: "PACKAGE" } },
            { clientId:  clientId, nutritionId: nutritionistId, offer: { type: "PACKAGE" } },
          ],
        },
      });
      if (!subscription2) {
        return res.status(403).json({
          message: "You can only review nutritionists from your package subscriptions.",
        });
      }
    }

    // 2. Prevent duplicate reviews — try both field names
    const existing = await prisma.review.findFirst({
      where: {
        OR: [
          { clientId:  clientId, nutritionistId },
          { patientId: clientId, nutritionistId },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this nutritionist." });
    }

    // 3. Create review — try with patientId first, fall back to clientId
    let review;
    try {
      review = await prisma.review.create({
        data: {
          patientId:      clientId,
          nutritionistId,
          subscriptionId: subscription?.id ?? null,
          rating:         parseInt(rating),
          comment:        comment?.trim() || null,
        },
      });
    } catch {
      // If patientId doesn't exist on Review model, use clientId
      review = await prisma.review.create({
        data: {
          clientId,
          nutritionistId,
          subscriptionId: subscription?.id ?? null,
          rating:         parseInt(rating),
          comment:        comment?.trim() || null,
        },
      });
    }

    // 4. Recalculate average rating
    const agg = await prisma.review.aggregate({
      where:  { nutritionistId },
      _avg:   { rating: true },
      _count: { rating: true },
    });

    await prisma.user.update({
      where: { id: nutritionistId },
      data: {
        averageRating: agg._avg.rating  ?? 0,
        reviewCount:   agg._count.rating ?? 0,
      },
    });

    return res.status(201).json({ message: "Review submitted successfully.", review });
  } catch (err) {
    console.error("createNutritionistReview error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const createReview = async (req, res) => {
  const clientId  = req.user.id;
  const sessionId = req.params.sessionId;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    const session = await prisma.session.findFirst({
      where: {
        id:     sessionId,
        OR: [
          { clientId,  status: "COMPLETED", subscription: { offer: { type: "PACKAGE" } } },
          { patientId: clientId, status: "COMPLETED", subscription: { offer: { type: "PACKAGE" } } },
        ],
      },
      include: { subscription: { include: { offer: true } } },
    });

    if (!session) {
      return res.status(404).json({ message: "Completed package session not found." });
    }

    const existing = await prisma.review.findFirst({ where: { sessionId } });
    if (existing) {
      return res.status(409).json({ message: "This session has already been reviewed." });
    }

    const nutritionistId = session.nutritionistId ?? session.nutritionId ?? session.subscription?.nutritionistId;

    let review;
    try {
      review = await prisma.review.create({
        data: {
          patientId:      clientId,
          nutritionistId,
          sessionId,
          subscriptionId: session.subscriptionId,
          rating:         parseInt(rating),
          comment:        comment?.trim() || null,
        },
      });
    } catch {
      review = await prisma.review.create({
        data: {
          clientId,
          nutritionistId,
          sessionId,
          subscriptionId: session.subscriptionId,
          rating:         parseInt(rating),
          comment:        comment?.trim() || null,
        },
      });
    }

    if (nutritionistId) {
      const agg = await prisma.review.aggregate({
        where:  { nutritionistId },
        _avg:   { rating: true },
        _count: { rating: true },
      });
      await prisma.user.update({
        where: { id: nutritionistId },
        data: {
          averageRating: agg._avg.rating  ?? 0,
          reviewCount:   agg._count.rating ?? 0,
        },
      });
    }

    return res.status(201).json({ message: "Review submitted successfully.", review });
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const getNutritionReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { nutritionistId: req.user.id },
      include: {
        client:  { select: { id:true, firstName:true, lastName:true, image:true } },
        patient: { select: { id:true, firstName:true, lastName:true, image:true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    console.error("getNutritionReviews error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const getPublicNutritionReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { nutritionistId: req.params.id },
      include: {
        client:  { select: { id:true, firstName:true, lastName:true, image:true } },
        patient: { select: { id:true, firstName:true, lastName:true, image:true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    console.error("getPublicNutritionReviews error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};

export const getClientReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { clientId:  req.user.id },
          { patientId: req.user.id },
        ],
      },
      include: {
        nutritionist: { select: { id:true, firstName:true, lastName:true, image:true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (err) {
    console.error("getClientReviews error:", err);
    return res.status(500).json({ message: err.message ?? "Server error." });
  }
};