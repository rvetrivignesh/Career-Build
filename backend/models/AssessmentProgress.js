import mongoose from "mongoose";

const skillProgressScoreSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    l1Passed: {
      type: Boolean,
      default: false,
    },
    l2Passed: {
      type: Boolean,
      default: false,
    },
    l3Passed: {
      type: Boolean,
      default: false,
    },
    l1Score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    l2Score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    l3Score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const assessmentProgressSchema = new mongoose.Schema(
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
      index: true,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    remainingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    skillScores: [skillProgressScoreSchema],
  },
  {
    timestamps: { createdAt: false, updatedAt: "lastUpdated" },
  }
);

// Prevent duplicate assessment progress records for a user and role
assessmentProgressSchema.index({ user: 1, targetRole: 1 }, { unique: true });

const AssessmentProgress = mongoose.model("AssessmentProgress", assessmentProgressSchema);

export default AssessmentProgress;
