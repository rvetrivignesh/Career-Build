import mongoose from "mongoose";
import {
  educationSchema,
  projectSchema,
  certificationSchema,
  experienceSchema
} from "./UserProfile.js";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    templateId: {
      type: String,
      required: true,
      default: "classic",
    },
    summary: {
      type: String,
      trim: true,
    },
    objective: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    achievements: [{
      type: String,
      trim: true,
    }],
    languages: [{
      type: String,
      trim: true,
    }],
    interests: [{
      type: String,
      trim: true,
    }],
    customSection: {
      heading: { type: String, default: "" },
      content: { type: String, default: "" },
    },
    visibilitySettings: {
      showEducation: { type: Boolean, default: true },
      showExperience: { type: Boolean, default: true },
      showProjects: { type: Boolean, default: true },
      showCertifications: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
      showLanguages: { type: Boolean, default: true },
      showInterests: { type: Boolean, default: true },
      showCustomSection: { type: Boolean, default: true },
    },
    jobRoleProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRoleProfile",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
