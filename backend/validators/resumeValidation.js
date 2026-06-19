export const validateResumeRequest = (req, res, next) => {
  const { templateType } = req.body;
  const validTemplates = ["professional", "modern", "minimal", "graduate"];

  if (!templateType) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["templateType is required"],
    });
  }

  if (!validTemplates.includes(templateType)) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: [`templateType must be one of: ${validTemplates.join(", ")}`],
    });
  }

  next();
};

export const validateResumeJSON = (resumeData) => {
  if (!resumeData || typeof resumeData !== "object") {
    throw new Error("Resume data must be a valid JSON object");
  }

  const requiredSections = [
    "header",
    "professionalSummary",
    "skills",
    "experience",
    "projects",
    "education",
  ];

  const missing = [];
  requiredSections.forEach((section) => {
    if (resumeData[section] === undefined || resumeData[section] === null) {
      missing.push(section);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Generated resume is missing mandatory sections: ${missing.join(", ")}`);
  }

  // Basic structure validations
  if (typeof resumeData.header !== "object" || resumeData.header === null) {
    throw new Error("Resume header must be an object");
  }

  if (typeof resumeData.professionalSummary !== "string" || resumeData.professionalSummary.trim().length === 0) {
    throw new Error("Resume professionalSummary must be a non-empty string");
  }

  if (!Array.isArray(resumeData.skills) || resumeData.skills.length === 0) {
    throw new Error("Resume skills must be a non-empty array");
  }

  if (!Array.isArray(resumeData.experience)) {
    throw new Error("Resume experience must be an array");
  }

  if (!Array.isArray(resumeData.projects)) {
    throw new Error("Resume projects must be an array");
  }

  if (!Array.isArray(resumeData.education) || resumeData.education.length === 0) {
    throw new Error("Resume education must be a non-empty array");
  }

  return true;
};
