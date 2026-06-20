import mongoose from "mongoose";

const questionItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 4;
        },
        message: "A question must have exactly 4 options.",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
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
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    questions: [questionItemSchema],
    questionVersion: {
      type: Number,
      required: true,
      default: 1,
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

// Indexing for faster history lookups
quizSchema.index({ user: 1, skill: 1, level: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
