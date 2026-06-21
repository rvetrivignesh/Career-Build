import mammoth from "mammoth";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import JobRoleProfile from "../models/JobRoleProfile.js";
import AssessmentProgress from "../models/AssessmentProgress.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { staticRoles, normalizeTargetRole } from "../utils/staticRoles.js";
import { getOrCreateRoleIntelligence } from "./resumeService.js";
import { analyzeResumeWithGemini } from "./geminiService.js";

/**
 * Maps a database document to the uniform V5 API response format.
 * Provides fallback matching for older V4 documents to ensure backward compatibility in the UI.
 */
export const mapToV5Format = (doc) => {
  if (!doc) return null;

  const data = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const rawV5 = data.resumeExtractionDiagnostics?.v5Data || data.resumeExtractionDiagnostics || {};
  const isNativeV5 = rawV5.overallScore !== undefined;

  if (isNativeV5) {
    return {
      _id: data._id,
      user: data.user,
      targetRole: data.targetRole,
      originalFileName: data.originalFileName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      analysisVersion: data.analysisVersion,

      overallScore: rawV5.overallScore,
      atsScore: rawV5.atsScore,
      technicalScore: rawV5.technicalScore,
      projectScore: rawV5.projectScore,
      experienceScore: rawV5.experienceScore,
      educationScore: rawV5.educationScore,
      industryReadiness: rawV5.industryReadiness,
      communicationScore: rawV5.communicationScore,

      candidate: rawV5.candidate || {
        name: rawV5.name || "",
        email: rawV5.email || "",
        phone: rawV5.phone || "",
        location: rawV5.location || ""
      },

      skills: rawV5.skills || [],
      frameworks: rawV5.frameworks || [],
      databases: rawV5.databases || [],
      tools: rawV5.tools || [],

      projects: rawV5.projects || [],
      experience: rawV5.experience || [],
      education: rawV5.education || [],

      strengths: rawV5.strengths || data.strengths || [],
      weaknesses: rawV5.weaknesses || data.weaknesses || [],
      missingSkills: rawV5.missingSkills || data.missingSkills || [],
      recommendations: rawV5.recommendations || data.improvementSuggestions || [],

      careerPreparedness: rawV5.careerPreparedness || {
        technicalSkills: rawV5.technicalScore || 0,
        projects: rawV5.projectScore || 0,
        experience: rawV5.experienceScore || 0,
        resumeQuality: rawV5.communicationScore || 0,
        industryReadiness: rawV5.industryReadiness || 0
      }
    };
  }

  // Fallback mapping for older V4 records
  return {
    _id: data._id,
    user: data.user,
    targetRole: data.targetRole,
    originalFileName: data.originalFileName,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    analysisVersion: data.analysisVersion,

    overallScore: data.atsScore,
    atsScore: data.atsScore,
    technicalScore: data.skillScore,
    projectScore: data.projectQualityScore || data.contentScore || 0,
    experienceScore: data.experienceQualityScore || 0,
    educationScore: 70, // old documents have no education score, fallback to standard average
    industryReadiness: data.resumeOptimizationScore || 0,
    communicationScore: data.formatScore,

    candidate: {
      name: data.resumeExtractionDiagnostics?.name || "",
      email: data.resumeExtractionDiagnostics?.email || "",
      phone: data.resumeExtractionDiagnostics?.phone || "",
      location: ""
    },

    skills: data.resumeExtractionDiagnostics?.skills || data.skills || [],
    frameworks: data.resumeExtractionDiagnostics?.frameworks || [],
    databases: data.resumeExtractionDiagnostics?.databases || [],
    tools: data.resumeExtractionDiagnostics?.tools || [],

    projects: data.resumeExtractionDiagnostics?.projects || [],
    experience: data.resumeExtractionDiagnostics?.experience || [],
    education: data.resumeExtractionDiagnostics?.education || [],

    strengths: data.strengths || [],
    weaknesses: data.weaknesses || [],
    missingSkills: data.missingSkills || [],
    recommendations: data.improvementSuggestions || [],

    careerPreparedness: {
      technicalSkills: data.skillScore,
      projects: data.projectQualityScore || data.contentScore || 0,
      experience: data.experienceQualityScore || 0,
      resumeQuality: data.resumeStructureScore || data.formatScore || 0,
      industryReadiness: data.resumeOptimizationScore || 0
    }
  };
};

/**
 * Core business service for ATS Resume Analysis V5
 */
export const analyzeResume = async (userId, targetRole, fileBuffer, originalFileName, runAdvanced = false) => {
  const isDocx = originalFileName.toLowerCase().endsWith(".docx");
  let resumeText = "";

  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      resumeText = result.value;
    } catch (error) {
      console.error("DOCX Parsing error:", error);
      const parseError = new Error(`Unable to parse resume: Failed to extract text from DOCX.`);
      parseError.statusCode = 400;
      throw parseError;
    }
  }

  const normalizedRole = normalizeTargetRole(targetRole);

  // 1. Fetch or generate target JobRoleProfile
  let roleProfile = await JobRoleProfile.findOne({
    targetRole: { $regex: new RegExp(`^${normalizedRole}$`, "i") },
  });

  if (!roleProfile) {
    if (staticRoles[normalizedRole]) {
      const staticData = staticRoles[normalizedRole];
      roleProfile = new JobRoleProfile({
        targetRole: normalizedRole,
        coreSkills: staticData.coreSkills,
        secondarySkills: staticData.secondarySkills,
        tools: staticData.tools,
        technicalKeywords: staticData.technicalKeywords,
        atsKeywords: staticData.atsKeywords,
        professionalSummary: staticData.professionalSummary,
        careerObjective: staticData.careerObjective,
      });
      await roleProfile.save();
    } else {
      roleProfile = await getOrCreateRoleIntelligence(normalizedRole);
    }
  }

  // 2. Fetch user's assessment and roadmap details
  const [roadmapProgress, quizAttempts] = await Promise.all([
    AssessmentProgress.findOne({ user: userId, targetRole: normalizedRole }),
    QuizAttempt.find({ user: userId, targetRole: normalizedRole }),
  ]);

  // 3. Compile user progress data for Gemini
  const userProgress = {
    completedSkills: roadmapProgress?.completedSkills || [],
    quizScores: {}
  };
  if (quizAttempts && quizAttempts.length > 0) {
    quizAttempts.forEach(qa => {
      const skillName = qa.skill.toLowerCase();
      const currentHighest = userProgress.quizScores[skillName] || 0;
      if (qa.percentage > currentHighest) {
        userProgress.quizScores[skillName] = qa.percentage;
      }
    });
  }

  // 4. Call Gemini semantic parser (Multimodal / Native Files mode)
  let geminiResult;
  try {
    const fileMimeType = isDocx ? null : "application/pdf";
    geminiResult = await analyzeResumeWithGemini(fileBuffer, fileMimeType, resumeText, normalizedRole, roleProfile, userProgress);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    const parseError = new Error(`Failed to analyze resume with Gemini: ${error.message}`);
    parseError.statusCode = 500;
    throw parseError;
  }

  // 5. Verification Check
  const extractedItems = 
    (geminiResult.skills?.length || 0) +
    (geminiResult.projects?.length || 0) +
    (geminiResult.experience?.length || 0) +
    (geminiResult.education?.length || 0);

  if (extractedItems < 2) {
    const error = new Error("Resume analysis failed: Extraction was incomplete.");
    error.statusCode = 400;
    throw error;
  }

  // 6. Get next analysis version
  const latestRoleAnalysis = await ResumeAnalysis.findOne({
    user: userId,
    targetRole: normalizedRole,
  }).sort({ createdAt: -1 });

  const nextVersion = latestRoleAnalysis ? latestRoleAnalysis.analysisVersion + 1 : 1;

  // 7. Save analysis document to MongoDB
  const analysis = new ResumeAnalysis({
    user: userId,
    targetRole: normalizedRole,
    originalFileName,
    resumeText: resumeText || originalFileName,
    atsScore: Math.min(Math.max(Math.round(geminiResult.atsScore || 50), 0), 100),
    keywordScore: Math.min(Math.max(Math.round(geminiResult.technicalScore || 50), 0), 100),
    skillScore: Math.min(Math.max(Math.round(geminiResult.technicalScore || 50), 0), 100),
    contentScore: Math.min(Math.max(Math.round(geminiResult.projectScore || 50), 0), 100),
    formatScore: Math.min(Math.max(Math.round(geminiResult.communicationScore || 50), 0), 100),
    missingKeywords: geminiResult.missingKeywords || [],
    missingSkills: geminiResult.missingSkills || [],
    strengths: geminiResult.strengths || [],
    weaknesses: geminiResult.weaknesses || [],
    improvementSuggestions: geminiResult.recommendations || [],
    recommendedProjects: (geminiResult.recommendedProjects || []).map(p => ({ title: p.title || p.name || "", reason: p.reason || "" })),
    recommendedCertifications: (geminiResult.recommendedCertifications || []).map(c => ({ name: c.name || c.title || "", reason: c.reason || "" })),
    roleMatchScore: Math.min(Math.max(Math.round(geminiResult.technicalScore || 50), 0), 100),
    roadmapAlignmentScore: Math.min(Math.max(Math.round(geminiResult.industryReadiness || 50), 0), 100),
    projectQualityScore: Math.min(Math.max(Math.round(geminiResult.projectScore || 50), 0), 100),
    experienceQualityScore: Math.min(Math.max(Math.round(geminiResult.experienceScore || 50), 0), 100),
    resumeStructureScore: Math.min(Math.max(Math.round(geminiResult.communicationScore || 50), 0), 100),
    resumeOptimizationScore: Math.min(Math.max(Math.round(geminiResult.industryReadiness || 50), 0), 100),
    parsingConfidence: 100,
    resumeExtractionDiagnostics: {
      v5Data: geminiResult
    },
    skillsToLearn: geminiResult.missingSkills || [],
    keywordsToAdd: [],
    nextActions: geminiResult.recommendations || [],
    skillConfidence: [],
    analysisVersion: nextVersion,
  });

  await analysis.save();

  // Return formatted plain object representing the unified V5 response
  return mapToV5Format(analysis);
};

export const getAnalysisHistory = async (userId) => {
  const history = await ResumeAnalysis.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return history.map(mapToV5Format);
};

export const getAnalysisById = async (userId, analysisId) => {
  const analysis = await ResumeAnalysis.findOne({ _id: analysisId, user: userId })
    .lean();
  return analysis ? mapToV5Format(analysis) : null;
};

export const deleteAnalysis = async (userId, analysisId) => {
  return await ResumeAnalysis.findOneAndDelete({ _id: analysisId, user: userId });
};
