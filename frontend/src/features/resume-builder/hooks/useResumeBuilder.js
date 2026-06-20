import { useState, useCallback } from "react";
import { useAuth } from "@contexts/AuthContext";
import * as resumeService from "@services/resumeService";
import { useToast } from "@contexts/ToastContext";

export const useResumeBuilder = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState("select-role"); // 'select-role' | 'loading' | 'editor'
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resume, setResume] = useState(null);
  const [error, setError] = useState(null);

  const loadLatestResume = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await resumeService.getLatestResume(token);
      if (data) {
        setResume(data);
        setStep("editor");
      } else {
        setStep("select-role");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load latest resume");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const startGeneration = async (targetRole) => {
    if (!token) return;
    try {
      setError(null);
      setStep("loading");
      setLoading(true);

      setStatusMessage("Analyzing target role requirements...");
      await resumeService.generateRoleIntelligence(targetRole, token);

      setStatusMessage("Synthesizing custom professional summary & objective...");
      const newResume = await resumeService.generateResume(targetRole, "classic", token);

      setResume(newResume);
      setStep("editor");
      showToast("Resume generated successfully!", "success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate resume");
      setStep("select-role");
      showToast(err.message || "Resume generation failed", "error");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const updateResumeLocal = useCallback((updateFnOrObject) => {
    setResume((prev) => {
      if (!prev) return null;
      const updates = typeof updateFnOrObject === "function" ? updateFnOrObject(prev) : updateFnOrObject;
      return {
        ...prev,
        ...updates,
      };
    });
  }, []);

  const persistResume = async () => {
    if (!token || !resume?._id) return;
    try {
      setLoading(true);
      const updated = await resumeService.saveResume(resume._id, resume, token);
      setResume(updated);
      showToast("Resume saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save resume", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetBuilder = () => {
    setResume(null);
    setStep("select-role");
  };

  return {
    step,
    loading,
    statusMessage,
    resume,
    error,
    loadLatestResume,
    startGeneration,
    updateResumeLocal,
    persistResume,
    resetBuilder,
  };
};

export default useResumeBuilder;
