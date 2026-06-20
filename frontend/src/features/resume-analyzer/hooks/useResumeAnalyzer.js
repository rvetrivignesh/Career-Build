import { useState, useCallback } from "react";
import { useAuth } from "@contexts/AuthContext";
import * as analyzerService from "@services/analyzerService";
import { useToast } from "@contexts/ToastContext";

export const useResumeAnalyzer = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState("upload"); // 'upload' | 'loading' | 'results' | 'fallback'
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [analysisProgressStep, setAnalysisProgressStep] = useState(0); // 0-5
  const [fallbackDiagnostics, setFallbackDiagnostics] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingTargetRole, setPendingTargetRole] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await analyzerService.getAnalysisHistory(token);
      setHistory(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const runAnalysis = async (file, targetRole, runAdvanced = false) => {
    if (!token) return;
    let stepInterval = null;
    try {
      setError(null);
      setStep("loading");
      setLoading(true);
      setFallbackDiagnostics(null);
      setAnalysisProgressStep(0);
      setStatusMessage("Extracting Resume");

      // Setup simulated status step message progression (approx 1.5s per step)
      let currentProgressStep = 0;
      const progressMessages = [
        "Extracting Resume",
        "Parsing Sections",
        "Matching Skills",
        "Evaluating Preparedness",
        "Generating Recommendations"
      ];
      
      stepInterval = setInterval(() => {
        if (currentProgressStep < progressMessages.length - 1) {
          currentProgressStep++;
          setAnalysisProgressStep(currentProgressStep);
          setStatusMessage(progressMessages[currentProgressStep]);
        }
      }, 1500);

      const result = await analyzerService.analyzeResume(file, targetRole, token, runAdvanced);

      if (stepInterval) clearInterval(stepInterval);
      setAnalysisProgressStep(5); // Complete

      if (result && result.fallbackTriggered) {
        setFallbackDiagnostics(result.diagnostics);
        setPendingFile(file);
        setPendingTargetRole(targetRole);
        setStep("fallback");
        showToast("Resume parsing confidence is low. Advanced analysis recommended.", "warning");
      } else {
        setActiveAnalysis(result);
        setHistory((prev) => [result, ...prev]);
        setStep("results");
        showToast("Resume analyzed successfully!", "success");
      }
    } catch (err) {
      if (stepInterval) clearInterval(stepInterval);
      console.error(err);
      setError(err.message || "Failed to analyze resume");
      setStep("upload");
      showToast(err.message || "Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const runAdvancedAnalysis = async () => {
    if (pendingFile && pendingTargetRole) {
      await runAnalysis(pendingFile, pendingTargetRole, true);
    }
  };

  const viewAnalysis = async (analysisId) => {
    if (!token) return;
    try {
      setError(null);
      setLoading(true);
      const result = await analyzerService.getAnalysisById(analysisId, token);
      setActiveAnalysis(result);
      setStep("results");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to retrieve analysis", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeAnalysis = async (analysisId) => {
    if (!token) return;
    try {
      setLoading(true);
      await analyzerService.deleteAnalysis(analysisId, token);
      setHistory((prev) => prev.filter((item) => item._id !== analysisId));
      if (activeAnalysis?._id === analysisId) {
        setActiveAnalysis(null);
        setStep("upload");
      }
      showToast("Analysis deleted from history", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete analysis", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalyzer = () => {
    setActiveAnalysis(null);
    setFallbackDiagnostics(null);
    setPendingFile(null);
    setPendingTargetRole(null);
    setStep("upload");
  };

  return {
    step,
    loading,
    statusMessage,
    analysisProgressStep,
    fallbackDiagnostics,
    history,
    activeAnalysis,
    error,
    loadHistory,
    runAnalysis,
    runAdvancedAnalysis,
    viewAnalysis,
    removeAnalysis,
    resetAnalyzer,
  };
};

export default useResumeAnalyzer;
