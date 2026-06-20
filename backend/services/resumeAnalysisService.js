import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import JobRoleProfile from "../models/JobRoleProfile.js";
import UserProfile from "../models/UserProfile.js";
import AssessmentProgress from "../models/AssessmentProgress.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Resume from "../models/Resume.js";
import { staticRoles, normalizeTargetRole } from "../utils/staticRoles.js";
import { getOrCreateRoleIntelligence } from "./resumeService.js";
import { extractResumeSections } from "../utils/resumeParser.js";
import { fallbackExtractResume } from "./geminiService.js";
import { checkSkillMatch } from "../utils/skillNormalizer.js";

/**
 * Core business service for ATS Resume Analysis V2
 */

export const analyzeResume = async (userId, targetRole, fileBuffer, originalFileName, runAdvanced = false) => {
  let rawText = "";
  const isDocx = originalFileName.toLowerCase().endsWith(".docx");

  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = result.value;
    } catch (error) {
      console.error("DOCX Parsing error:", error);
      const parseError = new Error(`Failed to extract text from DOCX: ${error.message}`);
      parseError.statusCode = 400;
      throw parseError;
    }
  } else {
    let parser = null;
    try {
      parser = new PDFParse({ data: fileBuffer });
      const result = await parser.getText();
      rawText = result.text;
    } catch (error) {
      console.error("PDF Parsing error:", error);
      const parseError = new Error(`Failed to extract text from PDF: ${error.message}`);
      parseError.statusCode = 400;
      throw parseError;
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch (err) {
          console.error("Error destroying PDFParse instance:", err);
        }
      }
    }
  }

  if (!rawText || rawText.trim().length === 0) {
    const error = new Error(`The uploaded ${isDocx ? "DOCX" : "PDF"} resume appears to be empty or unscannable.`);
    error.statusCode = 400;
    throw error;
  }

  const normalizedRole = normalizeTargetRole(targetRole);

  // Cost Optimization Check: Prevent duplicate calls
  const existingAnalysis = await ResumeAnalysis.findOne({
    user: userId,
    targetRole: normalizedRole,
    resumeText: rawText,
  }).sort({ createdAt: -1 });

  if (existingAnalysis) {
    return existingAnalysis;
  }

  // 1. Fetch or generate target JobRoleProfile
  let roleProfile = await JobRoleProfile.findOne({
    targetRole: { $regex: new RegExp(`^${normalizedRole}$`, "i") },
  });

  if (!roleProfile) {
    // If static role, create in DB locally
    if (staticRoles[normalizedRole]) {
      const staticData = staticRoles[normalizedRole];
      roleProfile = new JobRoleProfile({
        targetRole: normalizedRole,
        coreSkills: staticData.coreSkills,
        secondarySkills: staticData.secondarySkills,
        tools: staticData.tools,
        technicalKeywords: staticData.technicalKeywords,
        atsKeywords: staticData.atsKeywords,
        professionalSummary: staticData.professionalSummary,
        careerObjective: staticData.careerObjective,
      });
      await roleProfile.save();
    } else {
      // If unknown, trigger Gemini to build profile (reduces Gemini usage to 1 call per unknown role ever)
      roleProfile = await getOrCreateRoleIntelligence(normalizedRole);
    }
  }

  // 2. Fetch career-build data
  const [roadmapProgress, quizAttempts, latestResume, userProfile] = await Promise.all([
    AssessmentProgress.findOne({ user: userId, targetRole: normalizedRole }),
    QuizAttempt.find({ user: userId, targetRole: normalizedRole }),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
    UserProfile.findOne({ user: userId })
  ]);

  // 3. Parse resume sections locally or via Gemini Fallback
  let parsedResume = extractResumeSections(rawText);

  // Compile helper to build latestResume text representation for similarity comparison
  const compileResumeToText = (resume) => {
    if (!resume) return "";
    let txt = "";
    if (resume.summary) txt += resume.summary + "\n";
    if (resume.objective) txt += resume.objective + "\n";
    if (resume.skills) txt += resume.skills.join(" ") + "\n";
    if (resume.projects) {
      resume.projects.forEach(p => {
        txt += `${p.title} ${p.description} ${p.technologies?.join(" ")}\n`;
      });
    }
    if (resume.experience) {
      resume.experience.forEach(e => {
        txt += `${e.company} ${e.role} ${e.description}\n`;
      });
    }
    if (resume.education) {
      resume.education.forEach(ed => {
        txt += `${ed.institute} ${ed.degree}\n`;
      });
    }
    return txt.toLowerCase();
  };

  const getResumeSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;
    const words1 = new Set(text1.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const words2 = new Set(text2.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    if (words1.size === 0 || words2.size === 0) return 0;
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return (intersection.size / union.size) * 100;
  };

  // Run diagnostics check
  const rawTextLength = rawText ? rawText.length : 0;
  const skillsText = parsedResume.skills || "";
  const projectsText = parsedResume.projects || "";
  const experienceText = parsedResume.experience || "";
  const educationText = parsedResume.education || "";
  const certificationsText = parsedResume.certifications || "";

  const skillsFoundCount = skillsText.split(/[,;\n•]+/).map(s => s.trim()).filter(s => s.length > 1).length;
  const projectsFoundCount = projectsText.split("\n").filter(l => l.trim().length > 15).length;
  const experienceFoundCount = experienceText.split("\n").filter(l => l.trim().length > 15).length;
  const educationFoundCount = educationText.split("\n").filter(l => l.trim().length > 15).length;
  const certificationsFoundCount = certificationsText.split("\n").filter(l => l.trim().length > 10).length;

  let confidencePoints = 0;
  if (rawTextLength > 500) confidencePoints += 10;
  if (skillsText.length > 10) confidencePoints += 10;
  if (experienceText.length > 20) confidencePoints += 10;
  if (educationText.length > 20) confidencePoints += 10;
  if (projectsText.length > 20) confidencePoints += 10;
  if (parsedResume.hasContact) confidencePoints += 10;
  if (skillsFoundCount >= 5) confidencePoints += 10;
  if (experienceFoundCount >= 2) confidencePoints += 10;
  if (projectsFoundCount >= 1) confidencePoints += 10;
  if (certificationsFoundCount >= 1) confidencePoints += 10;

  let parsingConfidence = Math.min(confidencePoints, 100);

  // Resume similarity boost
  const similarityScore = getResumeSimilarity(rawText, compileResumeToText(latestResume));
  if (similarityScore >= 50) {
    parsingConfidence = Math.min(parsingConfidence + 15, 100);
  }

  // Check fallback conditions
  const isFallbackTriggered = 
    parsingConfidence < 60 ||
    skillsFoundCount === 0 ||
    educationFoundCount === 0 ||
    experienceFoundCount === 0 ||
    projectsFoundCount === 0 ||
    rawTextLength < 200;

  if (isFallbackTriggered && !runAdvanced) {
    return {
      fallbackTriggered: true,
      message: "Unable to fully analyze resume. Attempt advanced extraction?",
      diagnostics: {
        rawTextLength,
        skillsFoundCount,
        experienceFoundCount,
        educationFoundCount,
        projectsFoundCount,
        certificationsFoundCount,
        parsingConfidence
      }
    };
  }

  // If running advanced, call Gemini Fallback Extraction
  if (runAdvanced && isFallbackTriggered) {
    try {
      const geminiExtraction = await fallbackExtractResume(rawText);
      
      parsedResume = {
        hasContact: parsedResume.hasContact,
        hasEmails: parsedResume.hasEmails,
        hasPhones: parsedResume.hasPhones,
        hasLinks: parsedResume.hasLinks,
        summary: parsedResume.summary,
        skills: (geminiExtraction.skills || []).join(", "),
        projects: (geminiExtraction.projects || []).map(p => `${p.title}: ${p.description} (Tech: ${p.technologies?.join(", ")})`).join("\n"),
        experience: (geminiExtraction.experience || []).map(e => `${e.company} - ${e.role}: ${e.description} (${e.duration})`).join("\n"),
        education: (geminiExtraction.education || []).map(ed => `${ed.institute} - ${ed.degree} (${ed.location}, ${ed.duration})`).join("\n"),
        certifications: (geminiExtraction.certifications || []).map(c => `${c.title} by ${c.issuer || "unknown"}`).join("\n"),
        achievements: ""
      };
      
      parsingConfidence = 95;
    } catch (err) {
      console.error("Gemini Fallback parsing failed:", err);
    }
  }

  const resumeExtractionDiagnostics = {
    rawTextLength,
    skillsFoundCount,
    experienceFoundCount,
    educationFoundCount,
    projectsFoundCount,
    certificationsFoundCount,
    parsingConfidence
  };

  // 4. Calculate hybrid scores

  // A. Resume Structure (20 Points)
  let structurePoints = 0;
  if (parsedResume.hasContact) structurePoints += 4;
  if (parsedResume.summary.length > 20) structurePoints += 3;
  else if (parsedResume.summary.length > 0) structurePoints += 1;
  if (parsedResume.education.length > 20) structurePoints += 3;
  if (parsedResume.experience.length > 20) structurePoints += 4;
  if (parsedResume.projects.length > 20) structurePoints += 4;
  if (parsedResume.skills.length > 10) structurePoints += 2;

  if (userProfile?.profileCompleted) {
    structurePoints = Math.min(structurePoints + 2, 20);
  }

  // B. Role Alignment (25 Points)
  let coreMatches = 0;
  const missingCore = [];
  const matchedCore = [];
  roleProfile.coreSkills.forEach((s) => {
    if (checkSkillMatch(s, rawText)) {
      coreMatches++;
      matchedCore.push(s);
    } else {
      missingCore.push(s);
    }
  });
  const coreAlignmentScore = Math.min(coreMatches * 3.5, 15);

  let secondaryMatches = 0;
  const missingSecondary = [];
  roleProfile.secondarySkills.forEach((s) => {
    if (checkSkillMatch(s, rawText)) {
      secondaryMatches++;
    } else {
      missingSecondary.push(s);
    }
  });
  const secondaryAlignmentScore = Math.min(secondaryMatches * 2, 7);

  let toolsMatches = 0;
  const missingTools = [];
  roleProfile.tools.forEach((t) => {
    if (checkSkillMatch(t, rawText)) {
      toolsMatches++;
    } else {
      missingTools.push(t);
    }
  });
  const toolsAlignmentScore = Math.min(toolsMatches * 1, 3);
  const roleAlignmentPoints = coreAlignmentScore + secondaryAlignmentScore + toolsAlignmentScore;

  // C. Project Quality (20 Points)
  let projectPoints = 0;
  if (parsedResume.projects.length > 0) {
    if (parsedResume.projects.length > 100) projectPoints += 4;
    if (parsedResume.projects.length > 300) projectPoints += 4;
    if (parsedResume.projects.length > 500) projectPoints += 4;

    // Check project tech matches
    let projTechMatches = 0;
    const allSkills = [...roleProfile.coreSkills, ...roleProfile.secondarySkills];
    allSkills.forEach((s) => {
      if (checkSkillMatch(s, parsedResume.projects)) {
        projTechMatches++;
      }
    });
    projectPoints += Math.min(projTechMatches * 2, 8);
  }

  // D. Experience Quality (15 Points)
  let experiencePoints = 0;
  if (parsedResume.experience.length > 0) {
    if (parsedResume.experience.length > 100) experiencePoints += 4;
    if (parsedResume.experience.length > 400) experiencePoints += 4;

    // Check years range
    const years = parsedResume.experience.match(/\b(19|20)\d{2}\b/g) || [];
    if (years.length >= 2) {
      const numYears = years.map(Number);
      const range = Math.max(...numYears) - Math.min(...numYears);
      if (range >= 3) experiencePoints += 4;
      else if (range >= 1) experiencePoints += 2;
    } else {
      experiencePoints += 1;
    }

    // Role progression titles
    const careerProgKeywords = ["senior", "lead", "principal", "junior", "intern", "developer", "engineer", "analyst", "architect"];
    let progFound = false;
    for (const key of careerProgKeywords) {
      if (new RegExp(`\\b${key}\\b`, "i").test(parsedResume.experience)) {
        progFound = true;
        break;
      }
    }
    if (progFound) experiencePoints += 3;
  }

  // E. Career-Build Roadmap Progress (10 Points)
  let roadmapProgressPoints = 3; // Base points
  if (roadmapProgress) {
    const readiness = roadmapProgress.readinessScore || 0;
    roadmapProgressPoints = Math.min(Math.max(readiness * 0.1, 2), 10);
  }

  // Integrate targetRoles and profile skill alignment into roadmap progress
  if (userProfile) {
    if (userProfile.targetRoles?.some(r => normalizeTargetRole(r) === normalizedRole)) {
      roadmapProgressPoints = Math.min(roadmapProgressPoints + 2, 10);
    }
    const profileSkillMatches = userProfile.skills?.filter(s =>
      roleProfile.coreSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
    ).length || 0;
    if (profileSkillMatches > 0) {
      roadmapProgressPoints = Math.min(roadmapProgressPoints + Math.min(profileSkillMatches * 0.5, 3), 10);
    }
  }

  // F. Resume Optimization (10 Points)
  let optimizationPoints = 2;
  const actionVerbs = ["managed", "developed", "built", "designed", "optimized", "implemented", "engineered", "led", "created", "spearheaded"];
  let verbCount = 0;
  actionVerbs.forEach((v) => {
    if (new RegExp(`\\b${v}\\b`, "i").test(rawText)) {
      verbCount++;
    }
  });
  optimizationPoints += Math.min(verbCount * 0.8, 4);

  // Measurable stats check (numbers or metrics)
  const metricsMatches = rawText.match(/\b(\d+%\b|\d+\s*percent|\$\d+|\d+\+)/g) || [];
  optimizationPoints += Math.min(metricsMatches.length * 1.5, 4);

  // Compute subscores (0-100 scale)
  const keywordScore = Math.min(Math.round((roleAlignmentPoints / 25) * 100), 100);
  const skillScore = Math.min(Math.round((coreMatches / roleProfile.coreSkills.length) * 100), 100);
  const contentScore = Math.min(Math.round(((projectPoints + experiencePoints) / 35) * 100), 100);
  const formatScore = Math.min(Math.round(((structurePoints + optimizationPoints) / 30) * 100), 100);

  // Platform Consistency Check
  let isConsistentWithPlatform = false;
  
  // Try matching against latestResume if it's for the target role
  if (latestResume && normalizeTargetRole(latestResume.targetRole) === normalizedRole) {
    let matchCount = 0;
    let totalChecks = 0;
    
    if (latestResume.skills && latestResume.skills.length > 0) {
      latestResume.skills.forEach(s => {
        totalChecks++;
        const escaped = s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        if (new RegExp(`\\b${escaped}\\b`, "i").test(rawText)) {
          matchCount++;
        }
      });
    }
    
    if (latestResume.projects && latestResume.projects.length > 0) {
      latestResume.projects.forEach(p => {
        totalChecks++;
        if (p.title && new RegExp(p.title.split(/\s+/)[0], "i").test(rawText)) {
          matchCount++;
        }
      });
    }

    if (latestResume.experience && latestResume.experience.length > 0) {
      latestResume.experience.forEach(exp => {
        totalChecks++;
        if (exp.company && new RegExp(exp.company.split(/\s+/)[0], "i").test(rawText)) {
          matchCount++;
        }
      });
    }

    const overlapRatio = totalChecks > 0 ? (matchCount / totalChecks) : 0;
    if (overlapRatio >= 0.5) {
      isConsistentWithPlatform = true;
    }
  }

  // Fallback: Check against userProfile if latestResume was not found or not matched
  if (!isConsistentWithPlatform && userProfile) {
    let matchCount = 0;
    let totalChecks = 0;
    
    if (userProfile.skills && userProfile.skills.length > 0) {
      userProfile.skills.forEach(s => {
        totalChecks++;
        const escaped = s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        if (new RegExp(`\\b${escaped}\\b`, "i").test(rawText)) {
          matchCount++;
        }
      });
    }
    
    if (userProfile.projects && userProfile.projects.length > 0) {
      userProfile.projects.forEach(p => {
        totalChecks++;
        if (p.title && new RegExp(p.title.split(/\s+/)[0], "i").test(rawText)) {
          matchCount++;
        }
      });
    }

    if (userProfile.experience && userProfile.experience.length > 0) {
      userProfile.experience.forEach(exp => {
        totalChecks++;
        if (exp.company && new RegExp(exp.company.split(/\s+/)[0], "i").test(rawText)) {
          matchCount++;
        }
      });
    }

    const overlapRatio = totalChecks > 0 ? (matchCount / totalChecks) : 0;
    if (overlapRatio >= 0.5) {
      isConsistentWithPlatform = true;
    }
  }

  // Compute final ATS score (0-100 scale)
  let totalRaw = structurePoints + roleAlignmentPoints + projectPoints + experiencePoints + roadmapProgressPoints + optimizationPoints;
  
  // Apply a consistency boost if the resume is generated/derived from the platform's profile/builder
  if (isConsistentWithPlatform) {
    totalRaw += 12; // Boost to guarantee it lands in the 75-90+ range
  }
  
  // Apply visible maximum score cap of 95 (New Scoring Architecture)
  const atsScore = Math.min(Math.round(totalRaw), 95);

  // Compute Skill Confidence Levels
  const skillConfidence = [];
  const checkSkills = [...roleProfile.coreSkills, ...roleProfile.secondarySkills];
  checkSkills.forEach((s) => {
    const onResume = checkSkillMatch(s, rawText);
    const roadmapCompleted = roadmapProgress?.completedSkills?.some(cs => checkSkillMatch(s, cs)) || false;
    
    // Find highest quiz score for this skill
    const attempts = quizAttempts.filter(qa => checkSkillMatch(s, qa.skill));
    const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage || 0)) : 0;

    // Check presence in userProfile and latestResume
    const inProfile = userProfile?.skills?.some(ps => checkSkillMatch(s, ps)) || false;
    const inBuilder = latestResume?.skills?.some(rs => checkSkillMatch(s, rs)) || false;

    let confidence = "None";
    if (onResume && (roadmapCompleted || highestScore >= 70 || inProfile || inBuilder)) {
      confidence = "High";
    } else if (onResume) {
      confidence = "Medium";
    } else if (roadmapCompleted || highestScore > 0 || inProfile || inBuilder) {
      confidence = "Low";
    }

    if (confidence !== "None") {
      skillConfidence.push({
        skill: s,
        confidence,
        onResume,
        roadmapCompleted,
        quizScore: highestScore
      });
    }
  });

  // Categorize missing skills
  const missingKeywords = [];
  roleProfile.technicalKeywords.forEach((k) => {
    if (!new RegExp(`\\b${k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i").test(rawText)) {
      missingKeywords.push(k);
    }
  });

  const missingSkills = [...missingCore, ...missingSecondary];

  // Feedback sections
  const strengths = [];
  if (structurePoints >= 16) strengths.push("Comprehensive structure covering all key professional sections.");
  if (roleAlignmentPoints >= 18) strengths.push(`Strong technology stack alignment with primary target tools for ${normalizedRole}.`);
  if (projectPoints >= 12) strengths.push("Showcases relevant project developments highlighting technical application.");
  if (experiencePoints >= 10) strengths.push("Displays sound professional progression and employment longevity.");
  if (optimizationPoints >= 7) strengths.push("Incorporates strong descriptive action verbs and performance metrics.");
  if (strengths.length < 3) {
    strengths.push("Professional summary outline matches expectations for target role.");
    strengths.push("Readable font layouts and solid general layout flow.");
  }

  const weaknesses = [];
  if (missingCore.length > 0) {
    weaknesses.push(`Missing critical core skill domains required for role: ${missingCore.slice(0, 2).join(", ")}.`);
  }
  if (projectPoints < 12) {
    weaknesses.push("Projects section lacks technical depth and details on tools used.");
  }
  if (experiencePoints < 9) {
    weaknesses.push("Professional experience lacks clear career growth markers.");
  }
  if (!roadmapProgress || roadmapProgress.completedSkills?.length === 0) {
    weaknesses.push("Roadmap alignment is low due to incomplete skill assessments.");
  }
  if (optimizationPoints < 6) {
    weaknesses.push("Lacks quantifiable metrics to measure past project impact.");
  }
  if (weaknesses.length < 3) {
    weaknesses.push("ATS keyword density is sub-optimal for system scans.");
    weaknesses.push("Resume sections could show more specialized technologies.");
  }

  const improvementSuggestions = [];
  if (missingCore.length > 0) {
    improvementSuggestions.push(`Add your experience with ${missingCore[0]} to highlight core competency.`);
  }
  if (projectPoints < 12) {
    improvementSuggestions.push("Introduce another production-grade project showcasing modern architecture.");
  }
  if (metricsMatches.length < 3) {
    improvementSuggestions.push("Rewrite achievement bullets to include quantifiable business metrics (e.g. 15% improvement).");
  }
  if (verbCount < 4) {
    improvementSuggestions.push("Start experience bullet points with active verbs (e.g., 'Designed', 'Architected').");
  }
  if (missingKeywords.length > 0) {
    improvementSuggestions.push(`Incorporate essential ATS keywords: ${missingKeywords.slice(0, 3).join(", ")}.`);
  }

  const skillsToLearn = [...missingCore, ...missingSecondary].slice(0, 10);
  const keywordsToAdd = [...missingKeywords, ...missingTools].slice(0, 12);

  const nextActions = [];
  if (!roadmapProgress || roadmapProgress.completedSkills?.length < 3) {
    nextActions.push(`Go to Career Roadmaps and take assessments for ${roleProfile.coreSkills[0]}.`);
  }
  if (missingCore.length > 0) {
    nextActions.push("Update your skills in the Resume Builder and regenerate your resume.");
  }
  if (projectPoints < 15) {
    nextActions.push("Develop a full stack portfolio project to add to the resume.");
  }
  nextActions.push("Request interview prep guidance from the Career AI Coach.");

  // Recommended Projects & Certifications defaults
  const recommendedProjects = [];
  const recommendedCertifications = [];
  roleProfile.coreSkills.slice(0, 2).forEach((s) => {
    recommendedProjects.push({
      title: `${s} Application System`,
      reason: `To demonstrate proficiency in modern ${s} design principles and build confidence score.`
    });
  });
  roleProfile.secondarySkills.slice(0, 2).forEach((s) => {
    recommendedCertifications.push({
      name: `Certified ${s} Professional`,
      reason: `To validate specialized knowledge in ${s} toolsets to recruiters.`
    });
  });

  // Get next analysis version
  const latestRoleAnalysis = await ResumeAnalysis.findOne({
    user: userId,
    targetRole: normalizedRole,
  }).sort({ createdAt: -1 });

  const nextVersion = latestRoleAnalysis ? latestRoleAnalysis.analysisVersion + 1 : 1;

  // Create V2 analysis document
  const analysis = new ResumeAnalysis({
    user: userId,
    targetRole: normalizedRole,
    originalFileName,
    resumeText: rawText,
    atsScore,
    keywordScore,
    skillScore,
    contentScore,
    formatScore,
    missingKeywords,
    missingSkills,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    improvementSuggestions: improvementSuggestions.slice(0, 5),
    recommendedProjects,
    recommendedCertifications,
    roleMatchScore: Math.round(roleAlignmentPoints * 4), // Normalize to 100 scale
    roadmapAlignmentScore: Math.round(roadmapProgressPoints * 10),
    projectQualityScore: Math.round((projectPoints / 20) * 100),
    experienceQualityScore: Math.round((experiencePoints / 15) * 100),
    resumeStructureScore: Math.round((structurePoints / 20) * 100),
    resumeOptimizationScore: Math.round((optimizationPoints / 10) * 100),
    parsingConfidence,
    resumeExtractionDiagnostics,
    skillsToLearn,
    keywordsToAdd,
    nextActions,
    skillConfidence,
    analysisVersion: nextVersion,
  });

  await analysis.save();
  return analysis;
};

export const getAnalysisHistory = async (userId) => {
  return await ResumeAnalysis.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
};

export const getAnalysisById = async (userId, analysisId) => {
  return await ResumeAnalysis.findOne({ _id: analysisId, user: userId })
    .lean();
};

export const deleteAnalysis = async (userId, analysisId) => {
  return await ResumeAnalysis.findOneAndDelete({ _id: analysisId, user: userId });
};
