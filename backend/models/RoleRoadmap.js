import mongoose from "mongoose";

const skillRoadmapItemSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    importance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const roleRoadmapSchema = new mongoose.Schema(
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
    skills: [skillRoadmapItemSchema],
    generatedByAI: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate roadmaps for the same user and target role
roleRoadmapSchema.index({ user: 1, targetRole: 1 }, { unique: true });

const RoleRoadmap = mongoose.model("RoleRoadmap", roleRoadmapSchema);

export default RoleRoadmap;
