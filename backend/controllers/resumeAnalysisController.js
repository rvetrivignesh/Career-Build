import * as resumeAnalysisService from "../services/resumeAnalysisService.js";

// POST /analyze
export const analyzeResume = async (req, res, next) => {
  try {
    const { targetRole, runAdvanced } = req.body;
    const { buffer, originalname } = req.file;

    const result = await resumeAnalysisService.analyzeResume(
      req.user._id,
      targetRole,
      buffer,
      originalname,
      runAdvanced === "true" || runAdvanced === true
    );

    if (result && result.fallbackTriggered) {
      return res.status(200).json({
        success: true,
        fallbackTriggered: true,
        message: result.message,
        diagnostics: result.diagnostics,
      });
    }

    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis: result,
      data: result,
    });
  } catch (error) {
    if (error.needsReprocessing) {
      return res.status(400).json({
        success: false,
        error: error.message,
        needsReprocessing: true,
      });
    }
    next(error);
  }
};

// GET /history
export const getAnalysisHistory = async (req, res, next) => {
  try {
    const history = await resumeAnalysisService.getAnalysisHistory(req.user._id);
    res.status(200).json({
      success: true,
      message: "Analysis history retrieved successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// GET /:analysisId
export const getAnalysisById = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const analysis = await resumeAnalysisService.getAnalysisById(req.user._id, analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
        errors: ["The requested analysis does not exist or you do not have permission to view it"],
      });
    }

    res.status(200).json({
      success: true,
      message: "Analysis retrieved successfully",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /:analysisId
export const deleteAnalysis = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const deleted = await resumeAnalysisService.deleteAnalysis(req.user._id, analysisId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
        errors: ["The requested analysis does not exist or you do not have permission to delete it"],
      });
    }

    res.status(200).json({
      success: true,
      message: "Analysis deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
