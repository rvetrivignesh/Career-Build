import Quiz from "../models/Quiz.js";
import RoleRoadmap from "../models/RoleRoadmap.js";
import { validateQuizJSON } from "../validators/assessmentValidator.js";

/**
 * Service to manage assessment quizzes
 */

export const generateQuiz = async (userId, targetRole, skill, level, isRetake = false) => {
  const cleanRole = targetRole.trim();
  const cleanSkill = skill.trim();

  // 1. Verify that the skill is valid for the user's roadmap
  const roadmap = await RoleRoadmap.findOne({
    user: userId,
    targetRole: cleanRole,
  }).lean();

  if (!roadmap) {
    const error = new Error(`Roadmap not found for role: ${cleanRole}. Please generate the roadmap first.`);
    error.statusCode = 404;
    throw error;
  }

  const skillExists = roadmap.skills.some(
    (s) => s.skill.toLowerCase() === cleanSkill.toLowerCase()
  );

  if (!skillExists) {
    const error = new Error(`Invalid skill: ${cleanSkill} is not part of the skills for ${cleanRole}`);
    error.statusCode = 400;
    throw error;
  }

  // Find exact casing matching the roadmap skill name
  const roadmapSkill = roadmap.skills.find(
    (s) => s.skill.toLowerCase() === cleanSkill.toLowerCase()
  );
  const correctSkillName = roadmapSkill.skill;

  // 2. Database Optimization: If NOT a retake, check for an existing generated quiz
  if (!isRetake) {
    const existingQuiz = await Quiz.findOne({
      user: userId,
      targetRole: cleanRole,
      skill: correctSkillName,
      level,
    })
      .sort({ generatedAt: -1 })
      .lean();

    if (existingQuiz) {
      return existingQuiz;
    }
  }

  // 3. Retake or first-time generation: fetch previously generated questions to prevent duplication
  const previousQuizzes = await Quiz.find({
    user: userId,
    targetRole: cleanRole,
    skill: correctSkillName,
    level,
  })
    .select("questions.question")
    .lean();

  const previousQuestionsList = previousQuizzes.flatMap((q) =>
    q.questions.map((quest) => quest.question)
  );

  const nextVersion = previousQuizzes.length + 1;

  // Generate quiz via Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  // Map difficulty level descriptions
  const difficultyMapping = {
    1: "Fundamentals / Basic Concepts",
    2: "Practical Application / Scenario-based questions",
    3: "Advanced Concepts / Architectural, troubleshooting, and optimization scenarios",
  };

  const exclusionPrompt =
    previousQuestionsList.length > 0
      ? `\nCRITICAL: Do NOT reuse, repeat, or rephrase any of the following questions that were previously generated for this user:\n${JSON.stringify(
          previousQuestionsList,
          null,
          2
        )}`
      : "";

  const prompt = `
You are an expert technical interviewer and recruiter specializing in job readiness assessments.
Generate exactly 10 Multiple Choice Questions (MCQs) for the skill "${correctSkillName}" in the target role "${cleanRole}".

Difficulty Level: Level ${level} - ${difficultyMapping[level]}
${exclusionPrompt}

Instructions:
1. Generate exactly 10 high-quality, role-relevant MCQs.
2. Each question must have:
   - A question string.
   - An options array containing exactly 4 options.
   - A correctAnswer string that matches exactly one of the options (case-sensitive).
   - An explanation string explaining why the correctAnswer is correct and why other options are wrong.
3. Return the result in strict JSON format matching the schema below.
4. Do not include markdown code block formatting (such as \`\`\`json), backticks, or any conversational text.

Expected Output JSON Schema:
{
  "questions": [
    {
      "question": "What is the primary difference between let and var in JavaScript?",
      "options": [
        "let is block-scoped, var is function-scoped",
        "var is block-scoped, let is function-scoped",
        "let is global-scoped, var is local-scoped",
        "There is no difference"
      ],
      "correctAnswer": "let is block-scoped, var is function-scoped",
      "explanation": "Variables declared with let are scoped to the block they are defined in, whereas var variables are scoped to the containing function."
    }
  ]
}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (
      !result.candidates ||
      result.candidates.length === 0 ||
      !result.candidates[0].content ||
      !result.candidates[0].content.parts ||
      result.candidates[0].content.parts.length === 0
    ) {
      throw new Error("Invalid or empty response from Gemini API");
    }

    let jsonText = result.candidates[0].content.parts[0].text.trim();

    // Strip markdown formatting if returned
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(jsonText);
    const validatedData = validateQuizJSON(parsedData);

    const quiz = new Quiz({
      user: userId,
      targetRole: cleanRole,
      skill: correctSkillName,
      level,
      questions: validatedData.questions,
      questionVersion: nextVersion,
    });

    await quiz.save();
    return quiz.toObject();
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Asynchronously pre-generates Level 1, 2, and 3 quizzes for a list of skills in the roadmap
 */
export const pregenerateRoadmapQuizzes = async (userId, targetRole, skills) => {
  const cleanRole = targetRole.trim();
  console.log(`[Quiz Pregeneration] Starting background generation for role "${cleanRole}" with ${skills.length} skills.`);

  for (const s of skills) {
    const skillName = s.skill.trim();
    for (let level = 1; level <= 3; level++) {
      try {
        // Check if a quiz already exists
        const existingQuiz = await Quiz.findOne({
          user: userId,
          targetRole: cleanRole,
          skill: skillName,
          level,
        }).lean();

        if (!existingQuiz) {
          console.log(`[Quiz Pregeneration] Generating quiz: Skill="${skillName}", Level=${level}`);
          await generateQuiz(userId, cleanRole, skillName, level, false);
          // 300ms delay to avoid rate limit spikes from Gemini
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          console.log(`[Quiz Pregeneration] Quiz already exists: Skill="${skillName}", Level=${level}`);
        }
      } catch (error) {
        console.error(`[Quiz Pregeneration Error] Failed for "${skillName}" L${level}:`, error.message);
      }
    }
  }
  console.log(`[Quiz Pregeneration] Finished background generation for role "${cleanRole}".`);
};
