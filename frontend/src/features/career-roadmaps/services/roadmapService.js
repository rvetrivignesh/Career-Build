const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Service to interact with Career Roadmaps and Quiz API endpoints
 */

export const getOrCreateRoadmap = async (targetRole, token) => {
  const response = await fetch(`${API_URL}/api/assessment/roadmap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetRole }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to retrieve or generate roadmap.");
  }
  return data.roadmap || data.data;
};

export const getProgress = async (targetRole, token) => {
  const url = targetRole
    ? `${API_URL}/api/assessment/progress?targetRole=${encodeURIComponent(targetRole)}`
    : `${API_URL}/api/assessment/progress`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to retrieve progression status.");
  }
  return data.data;
};

export const getQuiz = async (skill, level, targetRole, token) => {
  const response = await fetch(`${API_URL}/api/assessment/quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill, level, targetRole }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch quiz questions.");
  }
  return data.quiz || data.data;
};

export const retakeQuiz = async (skill, level, targetRole, token) => {
  const response = await fetch(`${API_URL}/api/assessment/retake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill, level, targetRole }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to generate retake quiz.");
  }
  return data.quiz || data.data;
};

export const submitQuiz = async (quizId, answers, token) => {
  const response = await fetch(`${API_URL}/api/assessment/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quizId, answers }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to grade quiz attempt.");
  }
  return data.data || data; // Contains attempt, feedback, focusAreas, readinessScore, progress
};

export const getAttempts = async (targetRole, token) => {
  const url = targetRole
    ? `${API_URL}/api/assessment/attempts?targetRole=${encodeURIComponent(targetRole)}`
    : `${API_URL}/api/assessment/attempts`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch attempt history.");
  }
  return data.data;
};
