import Resume from "../models/Resume.js";
import UserProfile from "../models/UserProfile.js";
import * as geminiService from "./geminiService.js";
import { validateResumeJSON } from "../validators/resumeValidation.js";

// Helper to check profile completion status
const checkProfileStatus = async (userId) => {
  const profile = await UserProfile.findOne({ user: userId });
  if (!profile) {
    const error = new Error("User profile not found. Please create your profile first.");
    error.statusCode = 404;
    throw error;
  }
  if (!profile.profileCompleted) {
    const error = new Error("Profile completion required");
    error.statusCode = 403;
    throw error;
  }
  return profile;
};

// Generate a resume (with cost optimization check)
export const generateResume = async (userId, templateType) => {
  const profile = await checkProfileStatus(userId);

  // Fetch the latest generated resume
  const latestResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });

  if (latestResume) {
    const profileUpdatedTime = new Date(profile.updatedAt).getTime();
    const resumeCreatedTime = new Date(latestResume.createdAt).getTime();

    // Database Optimization: If profile hasn't changed since last generation, return existing
    if (profileUpdatedTime <= resumeCreatedTime) {
      if (latestResume.templateType !== templateType) {
        latestResume.templateType = templateType;
        await latestResume.save();
      }
      return latestResume;
    }
  }

  // Profile has updated or no resume exists: call Gemini
  const resumeJSON = await geminiService.generateResumeFromProfile(profile);

  // Validate the output schema
  validateResumeJSON(resumeJSON);

  // Save the new resume document
  const resume = new Resume({
    user: userId,
    templateType,
    resumeData: resumeJSON,
    generationVersion: 1, // Reset version on profile change / first generation
  });

  await resume.save();
  return resume;
};

// Retrieve the latest generated resume
export const getLatestResume = async (userId) => {
  const latestResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
  return latestResume;
};

// Force regenerate a new resume version (e.g. after profile updates)
export const regenerateResume = async (userId, templateType) => {
  const profile = await checkProfileStatus(userId);

  // Fetch latest resume to determine the next version number
  const latestResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
  const nextVersion = latestResume ? latestResume.generationVersion + 1 : 1;

  // Call Gemini to get fresh resume content
  const resumeJSON = await geminiService.generateResumeFromProfile(profile);

  // Validate output schema
  validateResumeJSON(resumeJSON);

  // Save the new version resume document
  const resume = new Resume({
    user: userId,
    templateType,
    resumeData: resumeJSON,
    generationVersion: nextVersion,
  });

  await resume.save();
  return resume;
};
