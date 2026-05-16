import prisma from "../prismaClient.js";

// Create a profile (after signup)
export const createProfile = async (req, res) => {
   console.log("Body received:", req.body);  // ← add this
  console.log("User:", req.user);    
  try {
    const userId = req.user.id;
    const { dateOfBirth, gender, weight, height, goal, activityLevel, medicalConditions, allergies } = req.body;

    if (!dateOfBirth || !gender || !weight || !height || !goal || !activityLevel) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await prisma.profile.create({
      data: {
        userId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        weight,
        height,
        goal,
        activityLevel,
        medicalConditions: medicalConditions ?? [],
        allergies: allergies ?? [],
      },
    });

    res.status(201).json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get the current user's profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update the profile

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName, lastName, dateOfBirth,
      gender, weight, height, goal, activityLevel,
      medicalConditions, allergies,
    } = req.body;
 
    // Update name on user
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName  && { lastName  }),
      },
    });
 
    // Upsert profile (create if doesn't exist, update if it does)
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        dateOfBirth:       dateOfBirth ? new Date(dateOfBirth) : new Date("2000-01-01"),
        gender:            gender            || "other",
        weight:            weight            || 0,
        height:            height            || 0,
        goal:              goal              || "Maintain Weight",
        activityLevel:     activityLevel     || "Moderate",
        medicalConditions: medicalConditions || [],
        allergies:         allergies         || [],
      },
      update: {
        ...(dateOfBirth    && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender         && { gender }),
        ...(weight != null && { weight: Number(weight) }),
        ...(height != null && { height: Number(height) }),
        ...(goal           && { goal }),
        ...(activityLevel  && { activityLevel }),
        medicalConditions: medicalConditions || [],
        allergies:         allergies         || [],
      },
    });
 
    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};