import express from "express";
import protect from "../middleware/auth.js";
import { validateProfile } from "../validators/profileValidator.js";
import {
  getProfileMe,
  createProfile,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// Apply auth protection middleware to all profile routes
router.use(protect);

router.route("/")
  .post(validateProfile, createProfile)
  .put(validateProfile, updateProfile);

router.get("/me", getProfileMe);

export default router;
