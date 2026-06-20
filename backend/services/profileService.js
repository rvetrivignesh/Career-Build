import UserProfile from "../models/UserProfile.js";

// Helper to parse month names into numerical index
const getMonthValue = (m) => {
  if (!m) return 0;
  if (typeof m === "number") return m;
  const parsed = parseInt(m);
  if (!isNaN(parsed)) return parsed;
  
  const months = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };
  return months[m.toLowerCase().trim()] || 0;
};

// Date sorting helper (newest to oldest)
const compareDates = (a, b, isExp = false) => {
  const isCurrentA = isExp ? a.currentlyWorking : a.currentlyStudying;
  const isCurrentB = isExp ? b.currentlyWorking : b.currentlyStudying;

  if (isCurrentA && !isCurrentB) return -1;
  if (!isCurrentA && isCurrentB) return 1;

  if (!isCurrentA && !isCurrentB) {
    if (a.endYear !== b.endYear) {
      return (b.endYear || 0) - (a.endYear || 0);
    }
    const endMonA = getMonthValue(a.endMonth);
    const endMonB = getMonthValue(b.endMonth);
    if (endMonA !== endMonB) {
      return endMonB - endMonA;
    }
  }

  if (a.startYear !== b.startYear) {
    return (b.startYear || 0) - (a.startYear || 0);
  }
  const startMonA = getMonthValue(a.startMonth);
  const startMonB = getMonthValue(b.startMonth);
  return startMonB - startMonA;
};

// Get profile by user ID
export const getProfileByUserId = async (userId) => {
  const profile = await UserProfile.findOne({ user: userId }).populate("user", "username email").lean();
  if (!profile) return null;

  // Sort education and experience on the lean object
  if (profile.education) {
    profile.education.sort((a, b) => compareDates(a, b, false));
  }
  if (profile.experience) {
    profile.experience.sort((a, b) => compareDates(a, b, true));
  }

  return profile;
};

// Create a new profile
export const createProfile = async (userId, data) => {
  const existingProfile = await UserProfile.findOne({ user: userId }).select("_id").lean();
  if (existingProfile) {
    const error = new Error("Profile already exists");
    error.statusCode = 409;
    throw error;
  }

  const profile = new UserProfile({
    user: userId,
    ...data,
    profileCompleted: true,
  });

  await profile.save();
  return getProfileByUserId(userId);
};

// Update an existing profile
export const updateProfile = async (userId, data) => {
  const profile = await UserProfile.findOne({ user: userId });
  if (!profile) return null;

  profile.fullName = data.fullName;
  profile.age = data.age;
  profile.gender = data.gender;
  profile.phone = data.phone;
  profile.location = data.location;
  profile.education = data.education;
  profile.skills = data.skills;
  profile.projects = data.projects || [];
  profile.certifications = data.certifications || [];
  profile.experience = data.experience || [];
  profile.targetRoles = data.targetRoles;
  profile.careerObjective = data.careerObjective;
  profile.github = data.github || "";
  profile.linkedin = data.linkedin || "";
  profile.portfolio = data.portfolio || "";
  profile.currentStatus = data.currentStatus;
  profile.currentRole = data.currentRole || "";
  profile.achievements = data.achievements || [];
  profile.languages = data.languages || [];
  profile.interests = data.interests || [];
  profile.profileCompleted = true;

  await profile.save();
  return getProfileByUserId(userId);
};
