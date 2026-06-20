import mongoose from "mongoose";

const jobRoleProfileSchema = new mongoose.Schema(
  {
    targetRole: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    coreSkills: [{
      type: String,
      trim: true,
    }],
    secondarySkills: [{
      type: String,
      trim: true,
    }],
    technicalKeywords: [{
      type: String,
      trim: true,
    }],
    tools: [{
      type: String,
      trim: true,
    }],
    industryKeywords: [{
      type: String,
      trim: true,
    }],
    atsKeywords: [{
      type: String,
      trim: true,
    }],
    professionalSummary: {
      type: String,
      trim: true,
    },
    careerObjective: {
      type: String,
      trim: true,
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

const JobRoleProfile = mongoose.model("JobRoleProfile", jobRoleProfileSchema);

export default JobRoleProfile;
