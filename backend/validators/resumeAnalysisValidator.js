export const validateResumeAnalysisRequest = (req, res, next) => {
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
