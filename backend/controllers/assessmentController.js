import * as roadmapService from "../services/roadmapService.js";
import * as quizService from "../services/quizService.js";
import * as readinessService from "../services/readinessService.js";
import RoleRoadmap from "../models/RoleRoadmap.js";
import QuizAttempt from "../models/QuizAttempt.js";

// POST /roadmap
export const generateRoadmap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    const roadmap = await roadmapService.getOrCreateRoadmap(req.user._id, targetRole);

    res.status(201).json({
      success: true,
      message: "Roadmap generated successfully",
      roadmap,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// Helper to find target role from user's active roadmap
const getActiveTargetRole = async (userId) => {
  const activeRoadmap = await RoleRoadmap.findOne({ user: userId })
    .sort({ updatedAt: -1 })
    .lean();
  
  if (!activeRoadmap) {
    const error = new Error("Roadmap not found. Please generate the skill roadmap first.");
    error.statusCode = 404;
    throw error;
  }
  return activeRoadmap.targetRole;
};

// POST /quiz
export const getQuiz = async (req, res, next) => {
  try {
    const { skill, level, targetRole } = req.body;
    const finalRole = targetRole ? targetRole.trim() : await getActiveTargetRole(req.user._id);

    const quiz = await quizService.generateQuiz(req.user._id, finalRole, skill, level, false);

    res.status(200).json({
      success: true,
      message: "Quiz retrieved successfully",
      quiz,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// POST /retake
export const retakeQuiz = async (req, res, next) => {
  try {
    const { skill, level, targetRole } = req.body;
    const finalRole = targetRole ? targetRole.trim() : await getActiveTargetRole(req.user._id);

    const quiz = await quizService.generateQuiz(req.user._id, finalRole, skill, level, true);

    res.status(200).json({
      success: true,
      message: "Fresh quiz generated successfully for retake",
      quiz,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// POST /submit
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;
    const result = await readinessService.submitQuizAttempt(req.user._id, quizId, answers);

    res.status(200).json({
      success: true,
      message: "Quiz attempt graded successfully",
      attempt: result.attempt,
      feedback: result.feedback,
      focusAreas: result.focusAreas,
      readinessScore: result.readinessScore,
      progress: result.progress,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /progress
export const getProgress = async (req, res, next) => {
  try {
    const { targetRole } = req.query;
    let finalRole;
    try {
      finalRole = targetRole ? targetRole.trim() : await getActiveTargetRole(req.user._id);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: err.message,
        errors: [err.message],
      });
    }

    const progress = await readinessService.getAssessmentProgress(req.user._id, finalRole);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No assessment progress found",
        errors: [`Please generate a skill roadmap first for ${finalRole}`],
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// GET /attempts
export const getAttempts = async (req, res, next) => {
  try {
    const { targetRole } = req.query;
    const query = { user: req.user._id };

    if (targetRole) {
      query.targetRole = targetRole.trim();
    } else {
      try {
        const activeRole = await getActiveTargetRole(req.user._id);
        query.targetRole = activeRole;
      } catch (err) {
        // Ignore fallback if active role also not found
      }
    }

    const attempts = await QuizAttempt.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Quiz attempts retrieved successfully",
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};
