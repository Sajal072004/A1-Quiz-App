import express from "express";
import { createQuestion, getQuestions } from "../controllers/quizController.js";

const router = express.Router();

router.post("/", createQuestion);  // Add a question
router.get("/", getQuestions);      // Get all questions

export default router;
