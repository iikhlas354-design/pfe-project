import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./passport.js";
import Routes from "./routes/index.js";
import { createServer } from "http";
import { initSocket } from "./socket.js";
import { resolve } from "path";

dotenv.config();

const app = express();

/* ========================
   CORS (FRONTEND ONLY)
======================== */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ========================
   CORE MIDDLEWARE
======================== */
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

/* ========================
   STATIC FILES
======================== */
app.use("/uploads", express.static("uploads"));

/* ========================
   ROUTES
======================== */
app.use("/", Routes);

/* ========================
   TEST ROUTES
======================== */
app.get("/stripe-test", (req, res) => {
  res.sendFile(resolve("../test.html"));
});

app.get("/success", (req, res) =>
  res.send("Stripe onboarding completed successfully!")
);

app.get("/reauth", (req, res) =>
  res.send("Please try the onboarding link again.")
);

app.get("/health", (req, res) =>
  res.send("Chrysalise API is running")
);

/* ========================
   ERROR HANDLER (MUST BE LAST)
======================== */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

/* ========================
   SOCKET
======================== */
const httpServer = createServer(app);
initSocket(httpServer);

/* ========================
   START SERVER
======================== */
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});