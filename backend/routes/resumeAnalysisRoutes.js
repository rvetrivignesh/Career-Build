import express from "express";
import protect from "../middleware/auth.js";
import checkProfileCompletion from "../middleware/checkProfileCompletion.js";
import { uploadResumeMiddleware } from "../middleware/uploadResume.js";
import { validateResumeAnalysisRequest } from "../validators/resumeAnalysisValidator.js";
import {
  analyzeResume,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis,
} from "../controllers/resumeAnalysisController.js";

const router = express.Router();

// Enforce auth protection and profile completion checks on all endpoints
router.use(protect);
router.use(checkProfileCompletion);

// Endpoints
router.post("/analyze", uploadResumeMiddleware, validateResumeAnalysisRequest, analyzeResume);
router.get("/history", getAnalysisHistory);
router.get("/:analysisId", getAnalysisById);
router.delete("/:analysisId", deleteAnalysis);

export default router;
