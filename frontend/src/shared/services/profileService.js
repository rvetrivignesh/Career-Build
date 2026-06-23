import { API_BASE_URL } from "@config/api";
const API_URL = API_BASE_URL;

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/api/profile/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (response.status === 404) {
    return null; // Profile not found is a valid state indicating profile is incomplete
  }
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch profile");
  }
  return data.data; // profile controller wraps returned object in `data` field
};

export const createProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to create profile");
  }
  return data.data;
};

export const updateProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to update profile");
  }
  return data.data;
};

export const getRecommendedRoles = async (token) => {
  const response = await fetch(`${API_URL}/api/profile/recommended-roles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch recommended roles");
  }
  return data.data;
};
