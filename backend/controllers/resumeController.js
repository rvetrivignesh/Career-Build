import * as resumeService from "../services/resumeService.js";

// POST /role-intelligence
export const generateRoleIntelligence = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    const roleProfile = await resumeService.getOrCreateRoleIntelligence(targetRole);
    res.status(200).json({
      success: true,
      message: "Role intelligence retrieved successfully",
      data: roleProfile,
    });
  } catch (error) {
    next(error);
  }
};

// POST /generate
export const generateResume = async (req, res, next) => {
  try {
    const { targetRole, templateId } = req.body;
    const resume = await resumeService.generateResume(req.user._id, targetRole, templateId);
    res.status(201).json({
      success: true,
      message: "Resume generated successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// GET /latest
export const getLatestResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getLatestResume(req.user._id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
        errors: ["No resume has been generated for this user yet"],
      });
    }
    res.status(200).json({
      success: true,
      message: "Latest resume retrieved successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /save
export const saveResume = async (req, res, next) => {
  try {
    const { resumeId, updateData } = req.body;
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "resumeId is required",
      });
    }
    const resume = await resumeService.saveResume(req.user._id, resumeId, updateData);
    res.status(200).json({
      success: true,
      message: "Resume saved successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};
