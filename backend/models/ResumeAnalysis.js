import mongoose from "mongoose";

const projectRecommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const certificationRecommendationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    keywordScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    skillScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    contentScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    formatScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    missingKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    strengths: [
      {
        type: String,
        trim: true,
      },
    ],
    weaknesses: [
      {
        type: String,
        trim: true,
      },
    ],
    improvementSuggestions: [
      {
        type: String,
        trim: true,
      },
    ],
    recommendedProjects: [projectRecommendationSchema],
    recommendedCertifications: [certificationRecommendationSchema],
    roleMatchScore: {
      type: Number,
      default: 0,
    },
    roadmapAlignmentScore: {
      type: Number,
      default: 0,
    },
    projectQualityScore: {
      type: Number,
      default: 0,
    },
    experienceQualityScore: {
      type: Number,
      default: 0,
    },
    skillsToLearn: [
      {
        type: String,
        trim: true,
      },
    ],
    keywordsToAdd: [
      {
        type: String,
        trim: true,
      },
    ],
    nextActions: [
      {
        type: String,
        trim: true,
      },
    ],
    skillConfidence: [
      {
        skill: { type: String, required: true },
        confidence: { type: String, required: true }, // 'High', 'Medium', 'Low'
        onResume: { type: Boolean, default: false },
        roadmapCompleted: { type: Boolean, default: false },
        quizScore: { type: Number, default: 0 },
      }
    ],
    parsingConfidence: {
      type: Number,
      default: 100,
    },
    resumeExtractionDiagnostics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    resumeStructureScore: {
      type: Number,
      default: 0,
    },
    resumeOptimizationScore: {
      type: Number,
      default: 0,
    },
    analysisVersion: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

export default ResumeAnalysis;
