import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
  try {
    const { name, email, class: studentClass } = req.body;
    
    const user = await prisma.user.create({
      data: { name, email, class: studentClass },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};
