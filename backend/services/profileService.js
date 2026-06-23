import UserProfile from "../models/UserProfile.js";
import { callGroq } from "./geminiService.js";

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

// Helper to check if two skills arrays are identical (case-insensitive, ignoring order)
const checkSkillsEqual = (skillsA, skillsB) => {
  const arrA = (skillsA || []).map(s => s.toLowerCase().trim()).sort();
  const arrB = (skillsB || []).map(s => s.toLowerCase().trim()).sort();
  
  if (arrA.length !== arrB.length) return false;
  return arrA.every((val, index) => val === arrB[index]);
};

// Helper to generate recommended roles from Groq AI with a fallback
const generateRecommendationsFromAI = async (skills) => {
  const fallback = [
    {
      roleName: "Frontend Developer",
      matchExplanation: "Build responsive user interfaces using HTML, CSS, and modern framework libraries.",
      typicalSkills: ["JavaScript", "React", "CSS Grid", "HTML5"]
    },
    {
      roleName: "Backend Developer",
      matchExplanation: "Design server-side logic, write database queries, and implement backend architecture APIs.",
      typicalSkills: ["Node.js", "Express.js", "MongoDB", "SQL"]
    },
    {
      roleName: "Full Stack Developer",
      matchExplanation: "Work across both clientside frontend and backend logic to deploy complete products.",
      typicalSkills: ["JavaScript", "React", "Node.js", "MongoDB"]
    }
  ];

  if (!skills || skills.length === 0) {
    return fallback;
  }

  const prompt = `
You are an expert career advisor.
Given a candidate's list of skills: ${JSON.stringify(skills)}
Recommend exactly 3 job roles that would be a great fit for these skills.
Return the result in strict JSON format matching the schema below.
Do not include markdown code block formatting (such as \`\`\`json), backticks, or any conversational text.

Expected Output JSON Schema:
{
  "recommendations": [
    {
      "roleName": "Software Engineer",
      "matchExplanation": "Since you have skills in JavaScript and Node.js, you can build backend services.",
      "typicalSkills": ["JavaScript", "Node.js", "Express.js"]
    }
  ]
}
`;

  try {
    const data = await callGroq(prompt);
    if (data && Array.isArray(data.recommendations)) {
      return data.recommendations;
    }
    console.warn("Invalid format returned from Groq, using fallback.");
    return fallback;
  } catch (error) {
    console.error("Failed to fetch recommended roles via Groq, using fallback:", error);
    return fallback;
  }
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

  // Eagerly generate recommended roles on creation
  const recommendations = await generateRecommendationsFromAI(data.skills);

  const profile = new UserProfile({
    user: userId,
    ...data,
    recommendedRoles: recommendations,
    recommendedRolesSkills: data.skills || [],
    profileCompleted: true,
  });

  await profile.save();
  return getProfileByUserId(userId);
};

// Update an existing profile
export const updateProfile = async (userId, data) => {
  const profile = await UserProfile.findOne({ user: userId });
  if (!profile) return null;

  // Check if skills have changed to regenerate recommendations cache
  const skillsChanged = !checkSkillsEqual(profile.skills, data.skills);
  if (skillsChanged) {
    const recommendations = await generateRecommendationsFromAI(data.skills);
    profile.recommendedRoles = recommendations;
    profile.recommendedRolesSkills = data.skills || [];
  }

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

export const getRecommendedRoles = async (userId) => {
  const profile = await UserProfile.findOne({ user: userId });
  if (!profile) {
    return [
      {
        roleName: "Frontend Developer",
        matchExplanation: "Build responsive user interfaces using HTML, CSS, and modern framework libraries.",
        typicalSkills: ["JavaScript", "React", "CSS Grid", "HTML5"]
      },
      {
        roleName: "Backend Developer",
        matchExplanation: "Design server-side logic, write database queries, and implement backend architecture APIs.",
        typicalSkills: ["Node.js", "Express.js", "MongoDB", "SQL"]
      },
      {
        roleName: "Full Stack Developer",
        matchExplanation: "Work across both clientside frontend and backend logic to deploy complete products.",
        typicalSkills: ["JavaScript", "React", "Node.js", "MongoDB"]
      }
    ];
  }

  // Check if cache exists and is valid (matches current skills)
  if (
    profile.recommendedRoles &&
    profile.recommendedRoles.length > 0 &&
    checkSkillsEqual(profile.skills, profile.recommendedRolesSkills)
  ) {
    return profile.recommendedRoles;
  }

  // Cache is missing or invalid, generate new recommendations
  const recommendations = await generateRecommendationsFromAI(profile.skills);
  
  // Save recommendations and current skills to profile cache
  profile.recommendedRoles = recommendations;
  profile.recommendedRolesSkills = profile.skills || [];
  await profile.save();

  return recommendations;
};
