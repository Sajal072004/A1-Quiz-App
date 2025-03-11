import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const calculateResult = async (req, res) => {
  try {
    const { userId, answers } = req.body; // answers should be an array of selected types

    // Count frequency of each learning type
    const typeCount = {};
    answers.forEach((type) => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Determine dominant learning type
    const dominantType = Object.keys(typeCount).reduce((a, b) =>
      typeCount[a] > typeCount[b] ? a : b
    );

    // Badge image mapping
    const badgeUrls = {
      Visual: "/badges/visual.png",
      Auditory: "/badges/auditory.png",
      "Reading/Writing": "/badges/reading.png",
      Kinesthetic: "/badges/kinesthetic.png",
    };

    const result = await prisma.result.create({
      data: { userId, type: dominantType, badgeUrl: badgeUrls[dominantType] },
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error calculating result" });
  }
};
