import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: { options: true },
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching questions" });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { text, options } = req.body; // options should be an array of { text, type }

    const question = await prisma.question.create({
      data: {
        text,
        options: {
          create: options,
        },
      },
      include: { options: true },
    });

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: "Error adding question" });
  }
};
