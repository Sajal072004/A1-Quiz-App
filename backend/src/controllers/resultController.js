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

    // Speciality and suggestions mapping
    const learningDetails = {
      Visual: {
        speciality: "You learn best through images, charts, and spatial understanding.",
        suggestions: {
          "1": "Use diagrams, color coding, and videos to study.",
          "2": "Organize information using mind maps and visual notes.",
          "3": "Use flashcards with images to reinforce concepts.",
        },
      },
      Auditory: {
        speciality: "You grasp concepts better through listening and verbal explanations.",
        suggestions: {
          "1": "Listen to lectures, audiobooks, or recordings to retain information.",
          "2": "Discuss topics with others or teach them to improve understanding.",
          "3": "Use rhymes or songs to memorize key concepts.",
        },
      },
      "Reading/Writing": {
        speciality: "You prefer learning through written words, reading, and note-taking.",
        suggestions: {
          "1": "Read textbooks, write summaries, and take detailed notes.",
          "2": "Use lists, headings, and bullet points to structure your study material.",
          "3": "Rewrite key information multiple times for better retention.",
        },
      },
      Kinesthetic: {
        speciality: "You learn best through hands-on experiences and movement.",
        suggestions: {
          "1": "Engage in experiments, role-playing, or physical activities while studying.",
          "2": "Use real-life examples and practical applications to understand concepts.",
          "3": "Take short breaks and move around while studying to maintain focus.",
        },
      },
    };

    const result = await prisma.result.create({
      data: {
        userId,
        type: dominantType,
        badgeUrl: badgeUrls[dominantType],
      },
    });

    res.json({
      ...result,
      speciality: learningDetails[dominantType].speciality,
      suggestions: learningDetails[dominantType].suggestions,
    });
  } catch (error) {
    res.status(500).json({ error: "Error calculating result" });
  }
};
