import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new question with options
export const createQuestion = async (req, res) => {
  try {
    const { questionText, options } = req.body;

    if (!questionText || !options || options.length < 2) {
      return res.status(400).json({ error: "Invalid input: Provide question text and at least 2 options." });
    }

    const question = await prisma.question.create({
      data: {
        text: questionText,
        options: {
          create: options.map(option => ({
            text: option.text,
            type: option.type, // Hidden from frontend
          })),
        },
      },
      include: {
        options: true, // Fetch options with the question
      },
    });

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating question" });
  }
};


export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: {
          select: {
            id: true,
            text: true // Only returning text, not type
          },
        },
      },
    });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching questions" });
  }
};
