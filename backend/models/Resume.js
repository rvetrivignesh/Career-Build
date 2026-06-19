import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateType: {
      type: String,
      enum: ["professional", "modern", "minimal", "graduate"],
      required: true,
    },
    resumeData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    generationVersion: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
