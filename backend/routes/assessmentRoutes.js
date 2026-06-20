import express from "express";
import protect from "../middleware/auth.js";
import checkProfileCompletion from "../middleware/checkProfileCompletion.js";
import {
  validateRoadmapRequest,
  validateQuizRequest,
  validateSubmitRequest,
} from "../validators/assessmentValidator.js";
import {
  generateRoadmap,
  getQuiz,
  retakeQuiz,
  submitQuiz,
  getProgress,
  getAttempts,
} from "../controllers/assessmentController.js";

const router = express.Router();

// Enforce auth protection and profile completion checks on all endpoints
router.use(protect);
router.use(checkProfileCompletion);

// Endpoints
router.post("/roadmap", validateRoadmapRequest, generateRoadmap);
router.post("/quiz", validateQuizRequest, getQuiz);
router.post("/retake", validateQuizRequest, retakeQuiz);
router.post("/submit", validateSubmitRequest, submitQuiz);
router.get("/progress", getProgress);
router.get("/attempts", getAttempts);

export default router;
