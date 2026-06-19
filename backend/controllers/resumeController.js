import * as resumeService from "../services/resumeService.js";

// POST /generate
export const generateResume = async (req, res, next) => {
  try {
    const { templateType } = req.body;
    const resume = await resumeService.generateResume(req.user._id, templateType);
    res.status(201).json({
      success: true,
      resume,
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
      });
    }
    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// POST /regenerate
export const regenerateResume = async (req, res, next) => {
  try {
    const { templateType } = req.body;
    const resume = await resumeService.regenerateResume(req.user._id, templateType);
    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};
