import express from "express";
import protect from "../middleware/auth.js";
import checkProfileCompletion from "../middleware/checkProfileCompletion.js";
import {
  validateRoleIntelligenceRequest,
  validateResumeRequest,
} from "../validators/resumeValidation.js";
import {
  generateRoleIntelligence,
  generateResume,
  getLatestResume,
  saveResume,
} from "../controllers/resumeController.js";

const router = express.Router();

router.use(protect);
router.use(checkProfileCompletion);

router.post("/role-intelligence", validateRoleIntelligenceRequest, generateRoleIntelligence);
router.post("/generate", validateResumeRequest, generateResume);
router.get("/latest", getLatestResume);
router.put("/save", saveResume);

export default router;
