import express from "express";
import { createUser, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/:userId", getUserById); // Route to fetch user by ID

export default router;
