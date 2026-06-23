import UserProfile from "../models/UserProfile.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import AssessmentProgress from "../models/AssessmentProgress.js";
import Message from "../models/Message.js";

/**
 * Service to manage AI Career Coach context assembly and Gemini calls
 */

export const getAIResponse = async (userId, chatId, newMessageText) => {
  // 1. Fetch personalization context (summarized to minimize token cost)
  const profile = await UserProfile.findOne({ user: userId })
    .select("targetRoles careerObjective skills")
    .lean();

  const progress = await AssessmentProgress.findOne({ user: userId })
    .select("readinessScore completedSkills remainingSkills")
    .lean();

  const resumeAnalysis = await ResumeAnalysis.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .select("atsScore missingSkills")
    .lean();

  const contextSummary = {
    targetRoles: profile?.targetRoles || [],
    careerObjective: profile?.careerObjective || "",
    atsScore: resumeAnalysis?.atsScore || null,
    weakSkills: resumeAnalysis?.missingSkills || [],
    readinessScore: progress?.readinessScore || 0,
    completedSkills: progress?.completedSkills || [],
    remainingSkills: progress?.remainingSkills || [],
  };

  // 2. Fetch last 10 messages for conversation context
  let history = [];
  if (chatId) {
    history = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Sort chronologically (oldest first)
    history.reverse();
  }

  // 3. Trim context to prevent exceeding 15,000 characters
  let totalLength = JSON.stringify(contextSummary).length + newMessageText.length;
  const prunedHistory = [];

  // Iterate backwards from newest history messages to keep context short
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    totalLength += msg.content.length;

    if (totalLength < 15000) {
      prunedHistory.unshift(msg);
    } else {
      break;
    }
  }

  // 4. Construct Groq API messages
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  const systemPrompt = `
You are the "CareerBuild AI Coach", an expert career mentor, technical learning assistant, and resume advisor.
Your goal is to guide the user in their career progression, study plans, job preparation, and skill assessments.

Here is the user's localized CareerBuild profile data for personalization:
${JSON.stringify(contextSummary, null, 2)}

Instructions:
1. Always act as a professional and encouraging career mentor. Never break character.
2. Provide specific, actionable, and role-appropriate advice. Avoid generic guidance.
3. If the user asks for a study plan or learning roadmap, detail daily/weekly milestones, topics, and goals.
4. Keep context in mind from the recent chat logs provided.
5. Do NOT output markdown code blocks (e.g. \`\`\`json) for responses unless they explicitly ask you to output a code snippet, in which case output the code normally.
6. Provide helpful, conversational responses.
`;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Map history to OpenAI message format
  prunedHistory.forEach((msg) => {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  });

  // Append new user message
  messages.push({
    role: "user",
    content: newMessageText,
  });

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
          messages,
          temperature: 0.7,
          max_tokens: 2048,
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

    const responseText = result.choices[0].message.content.trim();
    return responseText;
  } catch (error) {
    console.error("AI Coach Groq error:", error);
    throw new Error(`AI Coach failed to respond: ${error.message}`);
  }
};
