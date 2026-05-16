import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
const JWT_SECRET = process.env.JWT_SECRET;

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

// ------------------- SIGNUP -------------------
export const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      weight,
      height,
      goal,
      activityLevel,
      medicalConditions,
      allergies,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ CREATE USER
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // 2️⃣ CREATE PROFILE
await prisma.profile.create({
  data: {
    userId: user.id,

    // 🔥 REQUIRED FIELDS (must exist)
    dateOfBirth: new Date(dateOfBirth),
    gender: gender,
    weight: parseFloat(weight),
    height: parseFloat(height),
    goal: goal,
    activityLevel: activityLevel,

    // ✅ ARRAYS SAFE
    medicalConditions:
      typeof medicalConditions === "string" && medicalConditions.trim() !== ""
        ? medicalConditions.split(",").map((i) => i.trim())
        : [],

    allergies:
      typeof allergies === "string" && allergies.trim() !== ""
        ? allergies.split(",").map((i) => i.trim())
        : [],
  },
});


    // 3️⃣ TOKEN
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({
        user: {
          id: user.id,
          email: user.email,
          firstName,
          lastName,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- LOGIN -------------------
// ------------------- LOGIN -------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
 
    const user = await prisma.user.findUnique({ where: { email } });
 
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
 
    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
 
    // ✅ Check resume AND stripe via their own tables
    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
    });
 
    const stripe = await prisma.stripe.findUnique({
      where: { userId: user.id },
    });
 
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
 
    res.cookie("token", token, cookieOptions);
 
    return res.status(200).json({
      user: {
        id:              user.id,
        email:           user.email,
        role:            user.role,
        firstName:       user.firstName,
        lastName:        user.lastName,
        image:           user.image,
        stripeAccountId: stripe?.stripeAccountId ?? null,  // ✅ from Stripe table
        hasResume:       !!resume,                          // ✅ from Resume table
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
 
// ------------------- CHANGE PASSWORD -------------------
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Current and new password are required" });

    if (newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters" });

    if (currentPassword === newPassword)
      return res.status(400).json({ message: "New password must be different from current password" });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user.password)
      return res.status(400).json({ message: "This account uses Google login, no password to change" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- FORGOT PASSWORD -------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(200).json({ message: "If this email exists a reset link has been sent" });

    if (!user.password)
      return res.status(400).json({ message: "This account uses Google login, please sign in with Google" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await sendResetPasswordEmail({
      to: email,
      firstName: user.firstName,
      resetToken,
    });

    res.status(200).json({ message: "If this email exists a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- LOGOUT -------------------
export const logout = (req, res) => {
  res
    .clearCookie("token", cookieOptions)
    .status(200)
    .json({ message: "Logged out successfully" });
};

// ------------------- GOOGLE CALLBACK -------------------
export const googleCallback = async (req, res) => {
  const profile = req.user;

  try {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error("No email from Google profile");

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId: profile.id,
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          image: profile.photos?.[0]?.value || null,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);
    res.redirect(`${process.env.CLIENT_URL}/profile`);
  } catch (err) {
    console.error("Google auth error:", err);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
  }
};

// ------------------- GET ME -------------------
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
 
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:        true,
        email:     true,
        firstName: true,
        lastName:  true,
        image:     true,
        role:      true,
        profile:   true,
        resume:    true,
        stripe:    true,  // ✅ relation (not stripeAccountId field)
      },
    });
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    res.json({
      ...user,
      hasResume:       !!user.resume,                        // ✅
      stripeAccountId: user.stripe?.stripeAccountId ?? null, // ✅
    });
 
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
 