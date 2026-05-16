import prisma from "../prismaClient.js";
import { io, connectedUsers } from "../socket.js";

// =====================
// 1️⃣ Get all my notifications
// =====================
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 2️⃣ Mark a single notification as read
// =====================
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    if (notification.userId !== req.user.id)
      return res.status(403).json({ message: "Access forbidden" });
    const updated = await prisma.notification.update({
      where: { id },
      data:  { isRead: true },
    });
    res.json({ notification: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 3️⃣ Mark all notifications as read
// =====================
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 4️⃣ Delete a notification
// =====================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    if (notification.userId !== req.user.id)
      return res.status(403).json({ message: "Access forbidden" });
    await prisma.notification.delete({ where: { id } });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// 5️⃣ Get unread notifications count
// =====================
export const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
// 6️⃣ SESSION REMINDER JOB
//
//  Finds all SCHEDULED sessions in the next 24 hours where reminderSent
//  is false, sends a DB notification + socket event to both the patient
//  and nutritionist, then flips reminderSent = true so it never fires twice.
//
//  HOW TO START IT — add these lines to your server entry file (index.js):
//
//    import { sendSessionReminders } from "./controllers/notificationController.js";
//    sendSessionReminders();                          // run once on boot
//    setInterval(sendSessionReminders, 15 * 60 * 1000); // then every 15 min
//
// =====================================================================
export const sendSessionReminders = async () => {
  try {
    const now       = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const sessions = await prisma.session.findMany({
      where: {
        status:       "SCHEDULED",
        reminderSent: false,
        sessionDate: { gte: now, lte: in24Hours },
      },
      include: {
        patient:   { select: { id: true, firstName: true, lastName: true } },
        nutrition: { select: { id: true, firstName: true, lastName: true } },
        subscription: { include: { offer: true } },
      },
    });

    if (sessions.length === 0) return;

    console.log(`[REMINDERS] Sending ${sessions.length} reminder(s)...`);

    for (const session of sessions) {
      const { patient, nutrition, subscription, sessionDate, sessionNumber, zoomLink } = session;
      const offerName    = subscription?.offer?.name || "your session";
      const sessionLabel = sessionNumber > 1 ? `Session ${sessionNumber}` : "your session";
      const dateStr      = new Date(sessionDate).toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

      // Notify patient
      await prisma.notification.create({
        data: {
          userId:  patient.id,
          title:   "Session Reminder ⏰",
          message: `Reminder: ${sessionLabel} for "${offerName}" is tomorrow at ${dateStr}.${zoomLink ? " Your Zoom link is ready." : ""}`,
          url:     zoomLink || null,
          isRead:  false,
        },
      });

      // Notify nutritionist
      await prisma.notification.create({
        data: {
          userId:  nutrition.id,
          title:   "Upcoming Session ⏰",
          message: `Reminder: You have ${sessionLabel} with ${patient.firstName} ${patient.lastName} for "${offerName}" tomorrow at ${dateStr}.`,
          url:     zoomLink || null,
          isRead:  false,
        },
      });

      // Real-time socket events
      const patientSocketId   = connectedUsers.get(patient.id);
      const nutritionSocketId = connectedUsers.get(nutrition.id);

      if (patientSocketId)
        io.to(patientSocketId).emit("sessionReminder", {
          sessionId:   session.id,
          sessionDate: sessionDate,
          offerName,
          zoomLink:    zoomLink || null,
          message:     `Your session is tomorrow at ${dateStr}`,
        });

      if (nutritionSocketId)
        io.to(nutritionSocketId).emit("sessionReminder", {
          sessionId:   session.id,
          sessionDate: sessionDate,
          offerName,
          patientName: `${patient.firstName} ${patient.lastName}`,
          zoomLink:    zoomLink || null,
          message:     `You have a session with ${patient.firstName} ${patient.lastName} tomorrow at ${dateStr}`,
        });

      // Mark reminded — prevents duplicate reminders
      await prisma.session.update({
        where: { id: session.id },
        data:  { reminderSent: true },
      });
    }

    console.log(`[REMINDERS] Done.`);
  } catch (err) {
    console.error("[REMINDERS] Error:", err);
  }
};