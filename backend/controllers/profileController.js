import * as profileService from "../services/profileService.js";

// GET user profile
export const getProfileMe = async (req, res, next) => {
  try {
    const profile = await profileService.getProfileByUserId(req.user._id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
        errors: ["No profile exists for the authenticated user"],
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE profile (initial)
export const createProfile = async (req, res, next) => {
  try {
    const profile = await profileService.createProfile(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: "Profile completed successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE profile
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user._id, req.body);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
        errors: ["Profile must be created before updating"],
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// GET recommended roles based on skills
export const getRecommendedRoles = async (req, res, next) => {
  try {
    const recommendations = await profileService.getRecommendedRoles(req.user._id);
    res.status(200).json({
      success: true,
      message: "Recommended roles retrieved successfully",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};
