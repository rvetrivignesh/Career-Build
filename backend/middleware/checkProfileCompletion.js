import UserProfile from "../models/UserProfile.js";

const checkProfileCompletion = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // Query optimization: select only profileCompleted, use lean
    const profile = await UserProfile.findOne({ user: req.user._id })
      .select("profileCompleted")
      .lean();

    if (!profile || !profile.profileCompleted) {
      return res.status(403).json({
        success: false,
        profileCompleted: false,
        message: "Profile completion required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error during profile check: ${error.message}`,
    });
  }
};

export default checkProfileCompletion;
