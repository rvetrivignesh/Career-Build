import RoleRoadmap from "../models/RoleRoadmap.js";
import AssessmentProgress from "../models/AssessmentProgress.js";
import { validateRoadmapJSON } from "../validators/assessmentValidator.js";
import { pregenerateRoadmapQuizzes } from "./quizService.js";

/**
 * Service to manage target role skill roadmaps
 */

export const getOrCreateRoadmap = async (userId, targetRole) => {
  const cleanRole = targetRole.trim();

  // Lean read optimization: Check if roadmap already exists
  const existingRoadmap = await RoleRoadmap.findOne({
    user: userId,
    targetRole: cleanRole,
  }).lean();

  if (existingRoadmap) {
    return existingRoadmap;
  }

  // Generate new roadmap via Groq API
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  const prompt = `
You are an expert technical recruiter and talent strategist.
Generate a structured skill roadmap for the target job role: "${cleanRole}".
Identify between 7 and 10 of the most important skills required to succeed in this role.
Rank these skills by importance, with the most critical skill scored as 100, descending from there.
Provide a brief, clear, and professional description for each skill.

Instructions:
1. Return ONLY the JSON object conforming exactly to the schema below.
2. Sort the skills array descending by importance (highest importance first).
3. Do not include markdown code block formatting (such as \`\`\`json), backticks, or any conversational text.

Expected Output JSON Schema:
{
  "targetRole": "${cleanRole}",
  "skills": [
    {
      "skill": "JavaScript",
      "importance": 100,
      "description": "Core programming language for web applications."
    },
    {
      "skill": "React",
      "importance": 95,
      "description": "Component-based frontend library."
    }
  ]
}
`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_object",
          },
          temperature: 0.2,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (
      !result.choices ||
      result.choices.length === 0 ||
      !result.choices[0].message ||
      !result.choices[0].message.content
    ) {
      throw new Error("Invalid or empty response from Groq API");
    }

    let jsonText = result.choices[0].message.content.trim();

    // Strip markdown formatting if returned
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(jsonText);
    validateRoadmapJSON(parsedData);

    // Save the new RoleRoadmap document
    const roadmap = new RoleRoadmap({
      user: userId,
      targetRole: cleanRole,
      skills: parsedData.skills,
      generatedByAI: true,
    });

    await roadmap.save();

    // Initialize AssessmentProgress for this role if it doesn't already exist
    const existingProgress = await AssessmentProgress.findOne({
      user: userId,
      targetRole: cleanRole,
    }).select("_id").lean();

    if (!existingProgress) {
      const skillScores = parsedData.skills.map((s) => ({
        skill: s.skill,
        score: 0,
        l1Passed: false,
        l2Passed: false,
        l3Passed: false,
        l1Score: 0,
        l2Score: 0,
        l3Score: 0,
      }));

      const progress = new AssessmentProgress({
        user: userId,
        targetRole: cleanRole,
        readinessScore: 0,
        completedSkills: [],
        remainingSkills: parsedData.skills.map((s) => s.skill),
        skillScores,
      });

      await progress.save();
    }

    // Fire and forget background quiz pre-generation to load questions upfront
    pregenerateRoadmapQuizzes(userId, cleanRole, parsedData.skills).catch((err) => {
      console.error("[Background Quiz Pregeneration Trigger Error]:", err);
    });

    return roadmap.toObject();
  } catch (error) {
    console.error("Roadmap generation error:", error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};
