import mongoose from "mongoose";

// Validate POST /roadmap
export const validateRoadmapRequest = (req, res, next) => {
  let { targetRole } = req.body;

  if (targetRole === undefined || targetRole === null) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["targetRole is required"],
    });
  }

  if (typeof targetRole !== "string") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["targetRole must be a string"],
    });
  }

  targetRole = targetRole.trim();
  if (targetRole.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["targetRole cannot be empty"],
    });
  }

  req.body.targetRole = targetRole;
  next();
};

// Validate POST /quiz and POST /retake
export const validateQuizRequest = (req, res, next) => {
  let { skill, level, targetRole } = req.body;

  const errors = [];

  // Validate skill
  if (skill === undefined || skill === null) {
    errors.push("skill is required");
  } else if (typeof skill !== "string") {
    errors.push("skill must be a string");
  } else {
    skill = skill.trim();
    if (skill.length === 0) {
      errors.push("skill cannot be empty");
    }
  }

  // Validate level
  if (level === undefined || level === null) {
    errors.push("level is required");
  } else {
    const lvlNum = Number(level);
    if (!Number.isInteger(lvlNum) || ![1, 2, 3].includes(lvlNum)) {
      errors.push("level must be one of: 1, 2, 3");
    } else {
      level = lvlNum;
    }
  }

  // Validate targetRole if present
  if (targetRole !== undefined && targetRole !== null) {
    if (typeof targetRole !== "string") {
      errors.push("targetRole must be a string");
    } else {
      targetRole = targetRole.trim();
      if (targetRole.length === 0) {
        errors.push("targetRole cannot be empty");
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body.skill = skill;
  req.body.level = level;
  if (targetRole) {
    req.body.targetRole = targetRole;
  }
  next();
};

// Validate POST /submit
export const validateSubmitRequest = (req, res, next) => {
  const { quizId, answers } = req.body;

  const errors = [];

  if (!quizId) {
    errors.push("quizId is required");
  } else if (!mongoose.Types.ObjectId.isValid(quizId)) {
    errors.push("quizId is not a valid ObjectId");
  }

  if (answers === undefined || answers === null) {
    errors.push("answers is required");
  } else if (!Array.isArray(answers)) {
    errors.push("answers must be an array");
  } else if (answers.length !== 10) {
    errors.push("answers must have exactly 10 items matching the quiz questions size");
  } else {
    answers.forEach((ans, idx) => {
      if (typeof ans !== "string") {
        errors.push(`Answer at index ${idx} must be a string`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

// Validate Gemini Roadmap Output
export const validateRoadmapJSON = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Roadmap data must be a valid JSON object");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    const error = new Error("Roadmap skills must be a non-empty array");
    error.statusCode = 400;
    throw error;
  }

  data.skills.forEach((item, idx) => {
    if (!item || typeof item !== "object") {
      const error = new Error(`Roadmap skill item at index ${idx} is invalid`);
      error.statusCode = 400;
      throw error;
    }
    if (!item.skill || typeof item.skill !== "string" || item.skill.trim().length === 0) {
      const error = new Error(`Roadmap skill item at index ${idx}: skill name is required`);
      error.statusCode = 400;
      throw error;
    }
    const imp = Number(item.importance);
    if (isNaN(imp) || imp < 0 || imp > 100) {
      const error = new Error(`Roadmap skill item at index ${idx}: importance must be a number between 0 and 100`);
      error.statusCode = 400;
      throw error;
    }
    if (!item.description || typeof item.description !== "string" || item.description.trim().length === 0) {
      const error = new Error(`Roadmap skill item at index ${idx}: description is required`);
      error.statusCode = 400;
      throw error;
    }
    item.skill = item.skill.trim();
    item.importance = imp;
    item.description = item.description.trim();
  });

  return true;
};

// Validate Gemini Quiz Output
export const validateQuizJSON = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Quiz data must be a valid JSON object");
    error.statusCode = 400;
    throw error;
  }

  // Handle wraps where Gemini returns { questions: [...] } or direct array
  let list = data.questions;
  if (!list && Array.isArray(data)) {
    list = data;
  }

  if (!Array.isArray(list) || list.length !== 10) {
    const error = new Error("Quiz must contain exactly 10 questions");
    error.statusCode = 400;
    throw error;
  }

  list.forEach((q, idx) => {
    if (!q || typeof q !== "object") {
      const error = new Error(`Question at index ${idx} is invalid`);
      error.statusCode = 400;
      throw error;
    }
    if (!q.question || typeof q.question !== "string" || q.question.trim().length === 0) {
      const error = new Error(`Question at index ${idx}: question text is required`);
      error.statusCode = 400;
      throw error;
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      const error = new Error(`Question at index ${idx}: options must be an array of exactly 4 choices`);
      error.statusCode = 400;
      throw error;
    }
    q.options.forEach((opt, oIdx) => {
      if (typeof opt !== "string" || opt.trim().length === 0) {
        const error = new Error(`Question at index ${idx}: option at index ${oIdx} must be a non-empty string`);
        error.statusCode = 400;
        throw error;
      }
    });
    if (!q.correctAnswer || typeof q.correctAnswer !== "string" || q.correctAnswer.trim().length === 0) {
      const error = new Error(`Question at index ${idx}: correctAnswer is required`);
      error.statusCode = 400;
      throw error;
    }
    // Verify that correctAnswer matches one of the options
    const match = q.options.find(opt => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
    if (!match) {
      const error = new Error(`Question at index ${idx}: correctAnswer '${q.correctAnswer}' does not match any of the provided options`);
      error.statusCode = 400;
      throw error;
    }
    if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
      const error = new Error(`Question at index ${idx}: explanation is required`);
      error.statusCode = 400;
      throw error;
    }
    
    // Normalize fields
    q.question = q.question.trim();
    q.options = q.options.map(opt => opt.trim());
    q.correctAnswer = match.trim(); // use normalized matching option string
    q.explanation = q.explanation.trim();
  });

  return { questions: list };
};

// Validate Gemini Recommendation Output
export const validateRecommendationsJSON = (data) => {
  if (!data || typeof data !== "object") {
    const error = new Error("Recommendation data must be a valid JSON object");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data.focusAreas) || data.focusAreas.length === 0) {
    const error = new Error("focusAreas must be a non-empty array of strings");
    error.statusCode = 400;
    throw error;
  }

  data.focusAreas.forEach((item, idx) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      const error = new Error(`Focus area at index ${idx} must be a non-empty string`);
      error.statusCode = 400;
      throw error;
    }
  });

  data.focusAreas = data.focusAreas.map(item => item.trim());
  return true;
};
