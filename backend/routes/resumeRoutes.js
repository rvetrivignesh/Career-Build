import express from "express";
import protect from "../middleware/auth.js";
import checkProfileCompletion from "../middleware/checkProfileCompletion.js";
import { validateResumeRequest } from "../validators/resumeValidation.js";
import {
  generateResume,
  getLatestResume,
  regenerateResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// Enforce authentication and profile completion check on all resume endpoints
router.use(protect);
router.use(checkProfileCompletion);

router.post("/generate", validateResumeRequest, generateResume);
router.get("/latest", getLatestResume);
router.post("/regenerate", validateResumeRequest, regenerateResume);

export default router;
