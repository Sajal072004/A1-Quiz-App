import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import cron from "node-cron";
import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import referralRoutes from './routes/referralRoutes.js';

dotenv.config();

const app = express();

// ✅ Configure CORS properly
app.use(cors({
  origin: "*",  // Allow frontend origin
  methods: "GET,POST,PUT,DELETE",
  credentials: true  // Allow cookies if needed
}));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/referrals", referralRoutes);

app.use("/", (req, res) => {
  res.send("Server is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ⏳ Schedule cron job to run every 20 minutes
cron.schedule("*/20 * * * *", async () => {
  console.log("⏳ Running cron job: Fetching data from database...");
  try {
    const response = await axios.get("https://backend-906o.onrender.com"); // Change URL accordingly
    console.log("✅ Cron Job Success:", response.data);
  } catch (error) {
    console.error("❌ Cron Job Error:", error.message);
  }
});
