import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import resumeAnalysisRoutes from "./routes/resumeAnalysisRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analyzer", resumeAnalysisRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/chat", chatRoutes);


// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
