import express from "express";
import { sendEmail, getCertificatePDF } from "../controllers/emailController.js";

const router = express.Router();

router.post("/", sendEmail);
router.get("/", getCertificatePDF);


export default router;
