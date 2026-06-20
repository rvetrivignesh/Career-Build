export const validateRoleIntelligenceRequest = (req, res, next) => {
  const { targetRole } = req.body;
  if (!targetRole || typeof targetRole !== "string" || targetRole.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["targetRole is required and must be a non-empty string"],
    });
  }
  req.body.targetRole = targetRole.trim();
  next();
};

export const validateResumeRequest = (req, res, next) => {
  const { targetRole, templateId } = req.body;
  const errors = [];

  if (!targetRole || typeof targetRole !== "string" || targetRole.trim().length === 0) {
    errors.push("targetRole is required");
  }

  if (!templateId || typeof templateId !== "string" || templateId.trim().length === 0) {
    errors.push("templateId is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body.targetRole = targetRole.trim();
  req.body.templateId = templateId.trim();
  next();
};
