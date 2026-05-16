import prisma from "../prismaClient.js";

/* =========================
   GET MY RESUME
========================= */
export const getMyResume = async (req, res) => {
  try {
    const resume = await prisma.resume.findUnique({
      where: { userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CREATE RESUME
========================= */
export const createResume = async (req, res) => {
  try {
    const existing = await prisma.resume.findUnique({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res.status(400).json({ message: "Resume already exists" });
    }

    // ✅ all fields destructured
    const {
      bio,
      experienceYears,
      specializations,
      certifications,
      offersTypes,
      education,
      workplace,
    } = req.body;

const resume = await prisma.resume.create({
  data: {
    userId:          req.user.id,
    bio,
    experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,

    // ✅ force arrays — handle string, array, or undefined
    specializations: Array.isArray(specializations) ? specializations : [],
    certifications:  Array.isArray(certifications)  ? certifications  : [],
    offersTypes:     Array.isArray(offersTypes)      ? offersTypes     : [],

    education:  education  ?? null,
    workplace:  workplace  ?? null,
  },
});

    res.status(201).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE RESUME
========================= */
export const updateResume = async (req, res) => {
  try {
    const {
      bio,
      experienceYears,
      specializations,
      certifications,
      offersTypes,
      education,
      workplace,
    } = req.body;

    const resume = await prisma.resume.update({
      where: { userId: req.user.id },
      data: {
        ...(bio             !== undefined && { bio }),
        ...(experienceYears !== undefined && { experienceYears: parseInt(experienceYears, 10) }),
        ...(specializations !== undefined && { specializations }),
        ...(certifications  !== undefined && { certifications }),
        ...(offersTypes     !== undefined && { offersTypes }),
        ...(education       !== undefined && { education }),
        ...(workplace       !== undefined && { workplace }),
      },
    });

    res.json(resume);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};