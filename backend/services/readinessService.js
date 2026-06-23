import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import AssessmentProgress from "../models/AssessmentProgress.js";
import { validateRecommendationsJSON } from "../validators/assessmentValidator.js";

/**
 * Service to manage assessment submissions, readiness scoring, and progression
 */

export const submitQuizAttempt = async (userId, quizId, userAnswers) => {
  // 1. Retrieve the quiz
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    const error = new Error("Quiz not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership (security rules)
  if (quiz.user.toString() !== userId.toString()) {
    const error = new Error("Not authorized to submit answers for this quiz");
    error.statusCode = 403;
    throw error;
  }

  // 2. Evaluate answers
  let score = 0;
  const feedback = quiz.questions.map((q, idx) => {
    const userAnswer = (userAnswers[idx] || "").trim();
    const correctAnswer = q.correctAnswer.trim();
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    if (isCorrect) {
      score += 1;
    }

    return {
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const percentage = (score / quiz.questions.length) * 100;
  const passed = percentage >= 70;

  // 3. Determine attempt number
  const attemptCount = await QuizAttempt.countDocuments({
    user: userId,
    targetRole: quiz.targetRole,
    skill: quiz.skill,
    level: quiz.level,
  });

  const attemptNumber = attemptCount + 1;

  // 4. Save the QuizAttempt document
  const attempt = new QuizAttempt({
    user: userId,
    targetRole: quiz.targetRole,
    skill: quiz.skill,
    level: quiz.level,
    quizId: quiz._id,
    answers: userAnswers,
    score,
    percentage,
    passed,
    attemptNumber,
  });

  await attempt.save();

  // 5. Update AssessmentProgress
  const progress = await AssessmentProgress.findOne({
    user: userId,
    targetRole: quiz.targetRole,
  });

  if (!progress) {
    const error = new Error("Assessment progress not found. Please generate the skill roadmap first.");
    error.statusCode = 404;
    throw error;
  }

  // Find the skill progress item
  const skillItem = progress.skillScores.find(
    (s) => s.skill.toLowerCase() === quiz.skill.toLowerCase()
  );

  if (!skillItem) {
    const error = new Error(`Skill progress tracking not found for: ${quiz.skill}`);
    error.statusCode = 404;
    throw error;
  }

  // Check if level unlocks / logic changes
  const levelPassedKey = `l${quiz.level}Passed`;
  const levelScoreKey = `l${quiz.level}Score`;

  // Update level metrics: if passed now or already passed
  skillItem[levelPassedKey] = skillItem[levelPassedKey] || passed;
  // Keep the best score achieved on this level
  skillItem[levelScoreKey] = Math.max(skillItem[levelScoreKey], percentage);

  // Recalculate skill overall score: (L1 * 0.2) + (L2 * 0.3) + (L3 * 0.5)
  skillItem.score = Math.round(
    skillItem.l1Score * 0.2 + skillItem.l2Score * 0.3 + skillItem.l3Score * 0.5
  );

  // Check if the entire skill is completed (all levels passed)
  const isSkillCompletedNow = skillItem.l1Passed && skillItem.l2Passed && skillItem.l3Passed;

  if (isSkillCompletedNow) {
    const completedIdx = progress.completedSkills.indexOf(skillItem.skill);
    if (completedIdx === -1) {
      progress.completedSkills.push(skillItem.skill);
    }
    const remainingIdx = progress.remainingSkills.indexOf(skillItem.skill);
    if (remainingIdx !== -1) {
      progress.remainingSkills.splice(remainingIdx, 1);
    }
  }

  // Recalculate overall readinessScore as average of all skills in roadmap
  const totalSkillsCount = progress.skillScores.length;
  const sumScores = progress.skillScores.reduce((acc, curr) => acc + curr.score, 0);
  progress.readinessScore = Math.round(sumScores / totalSkillsCount);

  await progress.save();

  // 6. Generate AI recommendations if the skill was completed during this attempt
  let focusAreas = null;
  if (isSkillCompletedNow && passed) {
    focusAreas = await generateSkillCompletedRecommendations(
      quiz.targetRole,
      skillItem.skill,
      skillItem.l1Score,
      skillItem.l2Score,
      skillItem.l3Score,
      skillItem.score
    );
  }

  return {
    attempt: attempt.toObject(),
    feedback,
    focusAreas,
    readinessScore: progress.readinessScore,
    progress: progress.toObject(),
  };
};

/**
 * Call Gemini to get learning focus recommendations when a skill is completed
 */
const generateSkillCompletedRecommendations = async (targetRole, skill, l1, l2, l3, total) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return ["Review advanced architectural concepts", "Optimize API calls", "Gain production testing experience"];
  }

  const prompt = `
You are an expert technical career coach.
A user has completed assessments for the skill "${skill}" under target role "${targetRole}".
Their level scores were:
- Level 1 (Fundamentals, Weight 20%): ${l1}%
- Level 2 (Practical Application, Weight 30%): ${l2}%
- Level 3 (Advanced, Weight 50%): ${l3}%
- Overall Weighted Skill Score: ${total}%

Generate a list of 3-5 specific, actionable focus areas, advanced libraries, or conceptual gaps they should focus on to improve further based on these scores.
Return the result in strict JSON format matching the schema below.
Do not include markdown code block formatting (such as \`\`\`json), backticks, or any conversational text.

Expected Output JSON Schema:
{
  "focusAreas": [
    "Learn advanced state management optimization techniques",
    "Gain exposure to server-side rendering performance profiling",
    "Explore unit testing strategies for asynchronous edge-cases"
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
      throw new Error(`Groq API error: ${response.status}`);
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

    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(jsonText);
    validateRecommendationsJSON(parsedData);

    return parsedData.focusAreas;
  } catch (error) {
    console.error("AI recommendations generation failed:", error);
    // Return generic recommendations as fallback instead of crashing
    return [
      `Review edge cases in ${skill} fundamentals`,
      `Focus on hands-on deployment scenarios for ${skill} projects`,
      `Explore advanced community practices in ${targetRole} contexts`,
    ];
  }
};

export const getAssessmentProgress = async (userId, targetRole) => {
  if (!targetRole) {
    return null;
  }
  const cleanRole = targetRole.trim();
  // Query only progress and return lean
  const progress = await AssessmentProgress.findOne({ user: userId, targetRole: cleanRole }).lean();
  if (!progress) {
    return null;
  }

  // Calculate strongest and weakest skills based on current scores
  let strongestSkills = [];
  let weakestSkills = [];

  if (progress.skillScores && progress.skillScores.length > 0) {
    // Sort scores descending
    const sortedSkills = [...progress.skillScores].sort((a, b) => b.score - a.score);
    const highestScore = sortedSkills[0].score;
    const lowestScore = sortedSkills[sortedSkills.length - 1].score;

    strongestSkills = sortedSkills
      .filter((s) => s.score === highestScore && s.score > 0)
      .map((s) => s.skill);

    weakestSkills = sortedSkills
      .filter((s) => s.score === lowestScore)
      .map((s) => s.skill);
  }

  return {
    readinessScore: progress.readinessScore,
    completedSkills: progress.completedSkills,
    remainingSkills: progress.remainingSkills,
    skillScores: progress.skillScores,
    strongestSkills,
    weakestSkills,
  };
};
