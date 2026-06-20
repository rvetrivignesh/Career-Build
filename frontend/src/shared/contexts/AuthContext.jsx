import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "@services/authService";
import * as profileService from "@services/profileService";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [userProfile, setUserProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Validate token and fetch user + profile details
  const initializeAuth = useCallback(async (authToken) => {
    try {
      setLoading(true);
      const userData = await authService.getMe(authToken);
      setUser(userData);

      const profileData = await profileService.getProfile(authToken);
      if (profileData) {
        setUserProfile(profileData);
        setProfileComplete(profileData.profileCompleted === true);
      } else {
        setUserProfile(null);
        setProfileComplete(false);
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      // Token is invalid/expired
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setUserProfile(null);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      initializeAuth(token);
    } else {
      setLoading(false);
    }
  }, [token, initializeAuth]);

  const loginUser = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      showToast("Logged in successfully!", "success");
      return data;
    } catch (error) {
      showToast(error.message || "Invalid email or password", "error");
      throw error;
    }
  };

  const registerUser = async (username, email, password) => {
    try {
      await authService.register(username, email, password);
      showToast("Registration successful! Please log in.", "success");
    } catch (error) {
      showToast(error.message || "Registration failed", "error");
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUserProfile(null);
    setProfileComplete(false);
    showToast("Logged out successfully", "info");
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profileData = await profileService.getProfile(token);
      if (profileData) {
        setUserProfile(profileData);
        setProfileComplete(profileData.profileCompleted === true);
      } else {
        setUserProfile(null);
        setProfileComplete(false);
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  const saveUserProfile = async (profileData, isUpdate = false) => {
    if (!token) throw new Error("No authorization token");
    try {
      let saved;
      if (isUpdate || userProfile) {
        saved = await profileService.updateProfile(profileData, token);
        showToast("Profile updated successfully!", "success");
      } else {
        saved = await profileService.createProfile(profileData, token);
        showToast("Profile set up completed!", "success");
      }
      setUserProfile(saved);
      setProfileComplete(saved.profileCompleted === true);
      return saved;
    } catch (error) {
      showToast(error.message || "Failed to save profile", "error");
      throw error;
    }
  };

  const value = {
    user,
    token,
    userProfile,
    profileComplete,
    isAuthenticated: !!user,
    loading,
    loginUser,
    registerUser,
    logoutUser,
    refreshProfile,
    saveUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
