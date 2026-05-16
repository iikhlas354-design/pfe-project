import prisma from "../prismaClient.js";
import { createZoomMeeting } from "../utils/zoom.js";
import { io, connectedUsers } from "../socket.js";

const userSelect = {
  select: { id: true, firstName: true, lastName: true, email: true, image: true },
};

// =====================
// 1️⃣ Get all sessions (ADMIN)
// =====================
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        subscription: { select: { offer: true } },
        patient:   userSelect,
        nutrition: userSelect,
      },
      orderBy: { sessionDate: "asc" },
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 2️⃣ Get my sessions (CLIENT or NUTRITION)
// =====================
export const getMySessions = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const whereCondition =
      role === "CLIENT" ? { patientId: userId } : { nutritionId: userId };

    const sessions = await prisma.session.findMany({
      where: whereCondition,
      include: {
        subscription: { select: { offer: true } },
        patient:   userSelect,
        nutrition: userSelect,
      },
      orderBy: [{ status: "asc" }, { sessionDate: "asc" }],
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 3️⃣ Get session by ID
// =====================
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        subscription: { select: { offer: true } },
        patient:   userSelect,
        nutrition: userSelect,
        reviews:   true,
      },
    });

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (role !== "ADMIN" && session.patientId !== userId && session.nutritionId !== userId)
      return res.status(403).json({ message: "Access forbidden" });

    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 4️⃣ Update session status (NUTRITION or ADMIN)
// =====================
export const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { id: userId, role } = req.user;

    if (!["SCHEDULED", "COMPLETED", "CANCELLED"].includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (role !== "ADMIN" && session.nutritionId !== userId)
      return res.status(403).json({ message: "Access forbidden" });

    const updated = await prisma.session.update({
      where: { id },
      data:  { status },
    });
    res.json({ session: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 5️⃣ Get occupied slots for a nutritionist
// GET /api/sessions/occupied/:nutritionId?date=2026-04-09
// =====================
export const getOccupiedSlots = async (req, res) => {
  try {
    const { nutritionId } = req.params;
    const { date }        = req.query;

    if (!date)
      return res.status(400).json({ message: "date query param is required (YYYY-MM-DD)" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (isNaN(startOfDay.getTime()))
      return res.status(400).json({ message: "Invalid date format, use YYYY-MM-DD" });

    const sessions = await prisma.session.findMany({
      where: {
        nutritionId,
        status:      { notIn: ["CANCELLED", "PENDING_SCHEDULE"] },
        sessionDate: { gte: startOfDay, lte: endOfDay },
      },
      select: { sessionDate: true },
    });

    res.json({ nutritionId, date, occupiedSlots: sessions.map((s) => s.sessionDate) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 6️⃣ Get pending sessions (CLIENT — PACKAGE sessions with no date yet)
// GET /api/sessions/pending
// =====================
export const getPendingSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.session.findMany({
      where: {
        patientId: userId,
        status:    "PENDING_SCHEDULE",
      },
      include: {
        subscription: { include: { offer: true } },
        nutrition:    userSelect,
      },
      orderBy: { sessionNumber: "asc" },
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 7️⃣ Schedule a pending session (CLIENT)
// PATCH /api/sessions/:id/schedule
// Body: { sessionDate: "2025-09-15T10:00:00Z" }
// =====================
export const scheduleSession = async (req, res) => {
  try {
    const { id }          = req.params;
    const { sessionDate } = req.body;
    const userId          = req.user.id;

    if (!sessionDate)
      return res.status(400).json({ message: "sessionDate is required" });

    const chosenDate = new Date(sessionDate);

    if (isNaN(chosenDate.getTime()))
      return res.status(400).json({ message: "Invalid date format" });

    if (chosenDate <= new Date())
      return res.status(400).json({ message: "Session date must be in the future" });

    const session = await prisma.session.findUnique({
      where:   { id },
      include: {
        subscription: {
          include: { offer: true, nutrition: true, patient: true },
        },
      },
    });

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.patientId !== userId)
      return res.status(403).json({ message: "Access forbidden" });

    if (session.status !== "PENDING_SCHEDULE")
      return res.status(400).json({
        message: `Session is already ${session.status.toLowerCase().replace("_", " ")}`,
      });

    const conflict = await prisma.session.findFirst({
      where: {
        nutritionId: session.nutritionId,
        id:          { not: id },
        status:      { notIn: ["CANCELLED", "PENDING_SCHEDULE"] },
        sessionDate: chosenDate,
      },
    });
    if (conflict)
      return res.status(409).json({ message: "This time slot is already booked" });

    const { subscription }              = session;
    const { nutrition, patient, offer } = subscription;

const zoomLink = await createZoomMeeting(
  nutrition.email || "",
  patient.email   || "",
  `${offer.name} - Session ${session.sessionNumber}`,
  chosenDate  // ← pass actual session date
);
    const updatedSession = await prisma.session.update({
      where: { id },
      data:  { sessionDate: chosenDate, zoomLink, status: "SCHEDULED" },
    });

    // Notify patient with zoom link
    await prisma.notification.create({
      data: {
        userId:  userId,
        title:   `Session ${session.sessionNumber} Scheduled! 📅`,
        message: `Session ${session.sessionNumber} of "${offer.name}" is now booked. Click to join your Zoom session.`,
        url:     zoomLink,
        isRead:  false,
      },
    });

    // Notify nutritionist with zoom link
    await prisma.notification.create({
      data: {
        userId:  session.nutritionId,
        title:   "New Session Booked 📅",
        message: `${patient.firstName} ${patient.lastName} booked Session ${session.sessionNumber} of "${offer.name}". Click to join your Zoom session.`,
        url:     zoomLink,
        isRead:  false,
      },
    });

    const patientSocketId   = connectedUsers.get(userId);
    const nutritionSocketId = connectedUsers.get(session.nutritionId);

    if (patientSocketId)
      io.to(patientSocketId).emit("sessionScheduled", {
        session: updatedSession,
        message: `Session ${session.sessionNumber} has been scheduled`,
        zoomLink,
      });

    if (nutritionSocketId)
      io.to(nutritionSocketId).emit("sessionScheduled", {
        session:     updatedSession,
        patientName: `${patient.firstName} ${patient.lastName}`,
        offerName:   offer.name,
        zoomLink,
      });

    return res.json({
      message: `Session ${session.sessionNumber} successfully scheduled`,
      session: updatedSession,
    });
  } catch (err) {
    console.error("SCHEDULE SESSION ERROR:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};