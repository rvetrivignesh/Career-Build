const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const generateRoleIntelligence = async (targetRole, token) => {
  const response = await fetch(`${API_URL}/api/resume/role-intelligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetRole }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to generate role intelligence");
  }
  return data.data;
};

export const generateResume = async (targetRole, templateId, token) => {
  const response = await fetch(`${API_URL}/api/resume/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetRole, templateId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to generate resume");
  }
  return data.data;
};

export const getLatestResume = async (token) => {
  const response = await fetch(`${API_URL}/api/resume/latest`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch resume");
  }
  return data.data;
};

export const saveResume = async (resumeId, updateData, token) => {
  const response = await fetch(`${API_URL}/api/resume/save`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resumeId, updateData }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to save resume");
  }
  return data.data;
};
