import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/referrals - Save a friend's details
router.post("/", async (req, res) => {
  const { name, phone } = req.body;

  // Validate input
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  try {
    // Save referral to database
    const referral = await prisma.referral.create({
      data: { name, phone },
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error("Error saving referral:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "This phone number is already referred." });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
