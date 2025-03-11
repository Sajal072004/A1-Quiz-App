import express from "express";
import { getQuestions, addQuestion } from "../controllers/quizController.js";

const router = express.Router();
router.get("/", getQuestions);
router.post("/", addQuestion); // To add new questions
export default router;
