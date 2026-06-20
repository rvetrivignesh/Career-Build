import Resume from "../models/Resume.js";
import UserProfile from "../models/UserProfile.js";
import JobRoleProfile from "../models/JobRoleProfile.js";
import * as geminiService from "./geminiService.js";

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

// Expose role intelligence generation & caching
export const getOrCreateRoleIntelligence = async (targetRole) => {
  if (!targetRole) {
    throw new Error("targetRole is required");
  }

  const role = targetRole.trim();
  let roleProfile = await JobRoleProfile.findOne({
    targetRole: { $regex: new RegExp(`^${role}$`, "i") },
  });

  if (!roleProfile) {
    // Call Gemini
    const intelligence = await geminiService.generateJobRoleIntelligence(role);
    roleProfile = new JobRoleProfile({
      targetRole: role,
      coreSkills: intelligence.coreSkills || [],
      secondarySkills: intelligence.secondarySkills || [],
      technicalKeywords: intelligence.technicalKeywords || [],
      tools: intelligence.tools || [],
      industryKeywords: intelligence.industryKeywords || [],
      atsKeywords: intelligence.atsKeywords || [],
      professionalSummary: intelligence.professionalSummary || "",
      careerObjective: intelligence.careerObjective || "",
      generatedAt: new Date(),
    });
    await roleProfile.save();
  }

  return roleProfile;
};

// Generate a resume
export const generateResume = async (userId, targetRole, templateId) => {
  const profile = await checkProfileStatus(userId);

  // 1. Get or create role intelligence
  const roleProfile = await getOrCreateRoleIntelligence(targetRole);

  // 2. Generate customized summary and objective via Gemini
  const customSummaryAndObjective = await geminiService.generateSummaryAndObjective(
    profile,
    roleProfile
  );

  // 3. Merge user skills and relevant role skills
  const userSkills = profile.skills || [];
  const roleSkills = roleProfile.coreSkills || [];
  // Deduplicate case-insensitively
  const mergedSkillsSet = new Set();
  const lowercaseSkillsSet = new Set();

  userSkills.forEach((s) => {
    const clean = s.trim();
    if (clean && !lowercaseSkillsSet.has(clean.toLowerCase())) {
      mergedSkillsSet.add(clean);
      lowercaseSkillsSet.add(clean.toLowerCase());
    }
  });

  roleSkills.forEach((s) => {
    const clean = s.trim();
    if (clean && !lowercaseSkillsSet.has(clean.toLowerCase())) {
      mergedSkillsSet.add(clean);
      lowercaseSkillsSet.add(clean.toLowerCase());
    }
  });

  const mergedSkills = Array.from(mergedSkillsSet);

  // 4. Save the new resume document
  const resume = new Resume({
    user: userId,
    targetRole,
    templateId,
    summary: customSummaryAndObjective.summary || roleProfile.professionalSummary,
    objective: customSummaryAndObjective.objective || roleProfile.careerObjective,
    skills: mergedSkills,
    education: profile.education || [],
    experience: profile.experience || [],
    projects: profile.projects || [],
    certifications: profile.certifications || [],
    achievements: profile.achievements || [],
    languages: profile.languages || [],
    interests: profile.interests || [],
    customSection: { heading: "", content: "" },
    jobRoleProfile: roleProfile._id,
    visibilitySettings: {
      showEducation: true,
      showExperience: true,
      showProjects: true,
      showCertifications: true,
      showAchievements: true,
      showLanguages: true,
      showInterests: true,
      showCustomSection: true,
    },
    generatedAt: new Date(),
  });

  await resume.save();
  return resume;
};

// Retrieve the latest generated resume
export const getLatestResume = async (userId) => {
  const latestResume = await Resume.findOne({ user: userId })
    .populate("jobRoleProfile")
    .sort({ createdAt: -1 });
  return latestResume;
};

// Save edits to a resume
export const saveResume = async (userId, resumeId, updateData) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    const error = new Error("Resume not found");
    error.statusCode = 404;
    throw error;
  }

  // Update allowed fields
  if (updateData.summary !== undefined) resume.summary = updateData.summary;
  if (updateData.objective !== undefined) resume.objective = updateData.objective;
  if (updateData.skills !== undefined) resume.skills = updateData.skills;
  if (updateData.education !== undefined) resume.education = updateData.education;
  if (updateData.experience !== undefined) resume.experience = updateData.experience;
  if (updateData.projects !== undefined) resume.projects = updateData.projects;
  if (updateData.certifications !== undefined) resume.certifications = updateData.certifications;
  if (updateData.achievements !== undefined) resume.achievements = updateData.achievements;
  if (updateData.languages !== undefined) resume.languages = updateData.languages;
  if (updateData.interests !== undefined) resume.interests = updateData.interests;
  if (updateData.customSection !== undefined) resume.customSection = updateData.customSection;
  if (updateData.visibilitySettings !== undefined) resume.visibilitySettings = updateData.visibilitySettings;
  if (updateData.templateId !== undefined) resume.templateId = updateData.templateId;

  await resume.save();
  return getLatestResume(userId);
};
