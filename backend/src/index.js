import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

dotenv.config();

const app = express();

// ✅ Configure CORS properly
app.use(cors({
  origin: "http://localhost:3000",  // Allow frontend origin
  methods: "GET,POST,PUT,DELETE",
  credentials: true  // Allow cookies if needed
}));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/results", resultRoutes);

app.use("/", (req, res) => {
  res.send("Server is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
