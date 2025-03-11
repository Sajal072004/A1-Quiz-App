import express from "express";
import { calculateResult } from "../controllers/resultController.js";

const router = express.Router();
router.post("/", calculateResult);
export default router;
