import express from "express";
import passport from "../passport.js";
import { authenticateToken } from "../middleware/checkauth.js";
import { authorizeRoles } from "../middleware/checkroles.js";
import axios from "axios";
import upload from "../middleware/upload.js";
import prisma from "../prismaClient.js";

/* =========================
   CONTROLLERS IMPORTS
========================= */

// Auth
import { logout, signup, login, googleCallback, changePassword, forgotPassword, getMe } from "../controllers/authController.js";

// Users
import { getAllNutritionists, getAllClients, getUserById, createNutritionist, updateUser, deleteUser, getNutritionistsByOfferType } from "../controllers/userController.js";

// Profile
import { createProfile, getProfile, updateProfile } from "../controllers/profileController.js";

// Stripe
import { createConnectedAccount, generateOnboardingLink, getStripeAccountStatus } from "../controllers/stripeController.js";

// Resume
import { getMyResume, createResume, updateResume } from "../controllers/resumeController.js";

// Offers
import {
  createOffer, getAllOffers, getOfferById,
  getPlanOffers,    // ← was getConsultationOffers
  getPackageOffers,
  getMyOffers,      // ← add this
  updateOffer, deleteOffer
} from "../controllers/offerController.js";
// Plans
import { createPlan, getMyPlans, getPlanById, updatePlan, deletePlan, getAllPlans, getRecommendedPlans,  assignPlanToPatient,  
  getPatientPlans } from "../controllers/planController.js";

// Subscriptions
import { createSubscription, getMySubscriptions, getSubscriptionById, getNutritionSubscriptions, cancelSubscription } from "../controllers/SubscriptionController.js";

// Payments
import { createPayment, getMyPayments, getPaymentById } from "../controllers/PaymentController.js";

// Sessions
import {
  getAllSessions,
  getMySessions,
  getSessionById,
  updateSessionStatus,
  getOccupiedSlots,
  getPendingSessions,   // NEW — PACKAGE pending sessions
  scheduleSession,      // NEW — book a date for pending session
} from "../controllers/SessionController.js";
import {
  createReview,             
  createNutritionistReview,   
  getNutritionReviews,
  getPublicNutritionReviews,
  getClientReviews,
} from "../controllers/reviewController.js";
// Inquiry
import { createInquiry, getAllInquiries, resolveInquiry } from "../controllers/inquiryController.js";

// Blog
import { createBlogPost, updateBlogPost, updateBlogStatus, getAllApprovedPosts, getPostById, deleteBlogPost } from "../controllers/blogController.js";

// Notifications
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from "../controllers/notificationController.js";

// Messages
import { getOrCreateConversation, getMyConversations, getMessages, sendMessage ,deleteMessage,        // ← new
  deleteConversation,   
 } from "../controllers/messageController.js";

// User Plans
import { getMyCurrentPlanDay, getMyUserPlans, createOrUpdateDailyTracking, getDailyTracking, getDailyTrackingByDate, getUserPlanById } from "../controllers/userPlanController.js";

const router = express.Router();

/* =========================
   AUTH ROUTES
========================= */

router.post("/signup", signup);
router.post("/login", login);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);
router.get("/me", getMe);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/change-password", authenticateToken, changePassword);

/* =========================
   USER ROUTES
========================= */

router.get("/nutritionists/public", getNutritionistsByOfferType);
router.get("/nutritionists", authenticateToken, authorizeRoles("ADMIN"), getAllNutritionists);
router.post("/nutritionists", authenticateToken, authorizeRoles("ADMIN"), createNutritionist);
router.get("/clients", authenticateToken, authorizeRoles("ADMIN"), getAllClients);
router.get("/nutritionists/by-type", authenticateToken, authorizeRoles("CLIENT", "ADMIN"), getNutritionistsByOfferType);

router.get("/users/:id", authenticateToken, (req, res, next) => {
  if (req.user.role === "ADMIN" || req.user.id === req.params.id) return next();
  return res.status(403).json({ message: "Access forbidden" });
}, getUserById);

router.patch("/users/:id", authenticateToken, (req, res, next) => {
  if (req.user.role === "ADMIN" || req.user.id === req.params.id) return next();
  return res.status(403).json({ message: "Access forbidden" });
}, updateUser);

router.delete("/users/:id", authenticateToken, authorizeRoles("ADMIN"), deleteUser);

/* =========================
   PROFILE ROUTES
========================= */

router.post("/profile", authenticateToken, authorizeRoles("CLIENT"), createProfile);
router.get("/profile", authenticateToken, authorizeRoles("CLIENT"), getProfile);
router.patch("/profile", authenticateToken, authorizeRoles("CLIENT"), updateProfile);

/* =========================
   STRIPE ROUTES
========================= */

router.post("/stripe/create-account", authenticateToken, authorizeRoles("NUTRITION"), createConnectedAccount);
router.post(
  "/stripe/onboarding",
  authenticateToken,
  authorizeRoles("NUTRITION"),
  generateOnboardingLink
);
router.get("/stripe/status", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), getStripeAccountStatus);
router.get("/stripe/success", (req, res) => res.send("Stripe onboarding completed successfully!"));

/* =========================
   RESUME ROUTES
========================= */

router.get("/resume", authenticateToken, authorizeRoles("NUTRITION"), getMyResume);
router.post("/resume", authenticateToken, authorizeRoles("NUTRITION"), createResume);
router.patch("/resume", authenticateToken, authorizeRoles("NUTRITION"), updateResume);

/* =========================
   OFFER ROUTES
========================= */
router.get("/offers", authenticateToken, getAllOffers);
router.get("/offers/packages", authenticateToken, getPackageOffers);
router.get("/offers/plans", authenticateToken, getPlanOffers);
router.get("/offers/mine", authenticateToken, authorizeRoles("NUTRITION"), getMyOffers);
router.get("/offers/:id", authenticateToken, getOfferById);
router.post("/offers", authenticateToken, authorizeRoles("NUTRITION"), createOffer);
router.patch("/offers/:id", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), updateOffer);
router.delete("/offers/:id", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), deleteOffer);
/* =========================
   PLAN ROUTES
========================= */

router.get("/plans/mine", authenticateToken, authorizeRoles("NUTRITION"), getMyPlans);
router.get("/plans/recommended", authenticateToken, authorizeRoles("CLIENT"), getRecommendedPlans);
router.get("/plans", getAllPlans);
router.get("/plans/:id", authenticateToken, getPlanById);
router.post("/plans", authenticateToken, authorizeRoles("NUTRITION"), upload.single("pdfFile"), createPlan);
router.patch("/plans/:id", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), updatePlan);
router.delete("/plans/:id", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), deletePlan);
router.post("/plans/assign", authenticateToken, authorizeRoles("NUTRITION"), assignPlanToPatient);
router.get("/plans/patient/:patientId", authenticateToken, authorizeRoles("NUTRITION"), getPatientPlans);

/* =========================
   SUBSCRIPTION ROUTES
========================= */

router.post("/subscriptions", authenticateToken, authorizeRoles("CLIENT"), createSubscription);
router.get("/subscriptions/mine", authenticateToken, authorizeRoles("CLIENT"), getMySubscriptions);
router.get("/subscriptions/nutrition", authenticateToken, authorizeRoles("NUTRITION"), getNutritionSubscriptions);
router.get("/subscriptions/:id", authenticateToken, getSubscriptionById);
router.patch("/subscriptions/:id/cancel", authenticateToken, authorizeRoles("CLIENT"), cancelSubscription);

/* =========================
   PAYMENT ROUTES
========================= */

router.post("/payments", authenticateToken, authorizeRoles("CLIENT"), createPayment);
router.get("/payments/mine", authenticateToken, authorizeRoles("CLIENT"), getMyPayments);
router.get("/payments/:id", authenticateToken, getPaymentById);

/* =========================
   SESSION ROUTES
========================= */

// ⚠️ Specific routes MUST come before /:id routes to avoid route conflicts
router.get("/sessions/mine", authenticateToken, authorizeRoles("CLIENT", "NUTRITION"), getMySessions);
router.get("/sessions/pending", authenticateToken, authorizeRoles("CLIENT"), getPendingSessions);           // NEW
router.get("/sessions/occupied/:nutritionId", authenticateToken, authorizeRoles("CLIENT"), getOccupiedSlots);
router.get("/sessions", authenticateToken, authorizeRoles("ADMIN"), getAllSessions);
router.get("/sessions/:id", authenticateToken, getSessionById);
router.patch("/sessions/:id/schedule", authenticateToken, authorizeRoles("CLIENT"), scheduleSession);       // NEW
router.patch("/sessions/:id/status", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), updateSessionStatus);

/* =========================
   REVIEW ROUTES
========================= */
router.post(
  "/nutritionists/:nutritionistId/review",
  authenticateToken,
  authorizeRoles("CLIENT"),
  createNutritionistReview
);
router.post("/sessions/:sessionId/review", authenticateToken, authorizeRoles("CLIENT"), createReview);
router.get("/reviews", authenticateToken, authorizeRoles("NUTRITION"), getNutritionReviews);
router.get("/reviews/client", authenticateToken, authorizeRoles("CLIENT"), getClientReviews);
router.get("/nutrition/:id/reviews", getPublicNutritionReviews);

/* =========================
   INQUIRY ROUTES
========================= */

router.post("/inquiries", createInquiry);
router.get("/inquiries", authenticateToken, authorizeRoles("ADMIN"), getAllInquiries);
router.patch("/inquiries/:id/resolve", authenticateToken, authorizeRoles("ADMIN"), resolveInquiry);

/* =========================
   BLOG ROUTES
========================= */

router.get("/blog", getAllApprovedPosts);
router.get("/blog/:id", getPostById);
router.post("/blog", authenticateToken, authorizeRoles("NUTRITION"), createBlogPost);
router.patch("/blog/:id", authenticateToken, authorizeRoles("NUTRITION"), updateBlogPost);
router.delete("/blog/:id", authenticateToken, authorizeRoles("NUTRITION", "ADMIN"), deleteBlogPost);
router.patch("/blog/:id/status", authenticateToken, authorizeRoles("ADMIN"), updateBlogStatus);

/* =========================
   NOTIFICATION ROUTES
========================= */

router.get("/notifications/unread-count", authenticateToken, getUnreadCount);
router.get("/notifications", authenticateToken, getMyNotifications);
router.patch("/notifications/read-all", authenticateToken, markAllAsRead);
router.patch("/notifications/:id/read", authenticateToken, markAsRead);
router.delete("/notifications/:id", authenticateToken, deleteNotification);

/* =========================
   CONVERSATION & MESSAGE ROUTES
========================= */

router.post("/conversations", authenticateToken, authorizeRoles("CLIENT", "NUTRITION"), getOrCreateConversation);
router.get("/conversations", authenticateToken, authorizeRoles("CLIENT", "NUTRITION"), getMyConversations);
router.get("/conversations/:conversationId/messages", authenticateToken, getMessages);
router.post("/conversations/:conversationId/messages", authenticateToken, sendMessage);
router.delete("/conversations/:conversationId/messages/:messageId", authenticateToken, deleteMessage);
router.delete("/conversations/:conversationId", authenticateToken, deleteConversation);

/* =========================
   USER PLAN ROUTES
========================= */

router.get("/user-plans/mine", authenticateToken, authorizeRoles("CLIENT"), getMyUserPlans);
router.get("/user-plans/current-day", authenticateToken, authorizeRoles("CLIENT"), getMyCurrentPlanDay);
router.get("/user-plans/:id", authenticateToken, authorizeRoles("CLIENT"), getUserPlanById);
router.post("/user-plans/:userPlanId/tracking", authenticateToken, authorizeRoles("CLIENT"), createOrUpdateDailyTracking);
router.get("/user-plans/:userPlanId/tracking", authenticateToken, authorizeRoles("CLIENT"), getDailyTracking);
router.get("/user-plans/:userPlanId/tracking/:date", authenticateToken, authorizeRoles("CLIENT"), getDailyTrackingByDate);

/* =========================
   CHAT ROUTE
========================= */

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  let retries = 2;

  while (retries > 0) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are Chrysalis, a friendly nutrition assistant.
Rules:
- ALWAYS respond in English only
- Be warm, friendly and encouraging
- Keep answers short and practical
- Only talk about nutrition, food, and health topics
- If asked something unrelated, politely redirect
- Never be robotic`,
            },
            { role: "user", content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      return res.json({ reply });
    } catch (error) {
      retries--;
      if (retries === 0)
        return res.status(500).json({ error: "Chatbot failed. Try again later." });
    }
  }
});

export default router;