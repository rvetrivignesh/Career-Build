const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const analyzeResume = async (file, targetRole, token, runAdvanced = false) => {
  const formData = new FormData();
  formData.append("resumeFile", file);
  formData.append("targetRole", targetRole);
  if (runAdvanced) {
    formData.append("runAdvanced", "true");
  }

  const response = await fetch(`${API_URL}/api/analyzer/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to analyze resume");
  }
  
  if (data.fallbackTriggered) {
    return data;
  }
  
  return data.data || data.analysis;
};

export const getAnalysisHistory = async (token) => {
  const response = await fetch(`${API_URL}/api/analyzer/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch analysis history");
  }
  return data.data;
};

export const getAnalysisById = async (analysisId, token) => {
  const response = await fetch(`${API_URL}/api/analyzer/${analysisId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch analysis");
  }
  return data.data;
};

export const deleteAnalysis = async (analysisId, token) => {
  const response = await fetch(`${API_URL}/api/analyzer/${analysisId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to delete analysis");
  }
  return data.data;
};
