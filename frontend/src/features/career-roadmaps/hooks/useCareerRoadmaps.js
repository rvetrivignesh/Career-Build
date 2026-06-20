import { useState, useCallback } from "react";
import { useAuth } from "@contexts/AuthContext";
import * as roadmapService from "../services/roadmapService";

/**
 * Custom hook to manage Career Roadmaps and Quiz state transitions
 */
export const useCareerRoadmaps = () => {
  const { token, userProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [attempts, setAttempts] = useState([]);

  // Quiz execution states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizStep, setQuizStep] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeLoadingQuiz, setActiveLoadingQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Skill Details state
  const [selectedSkill, setSelectedSkill] = useState(null);

  const fetchProgressAndAttempts = useCallback(async (targetRole, authToken) => {
    try {
      const [progData, attemptsData] = await Promise.all([
        roadmapService.getProgress(targetRole, authToken),
        roadmapService.getAttempts(targetRole, authToken),
      ]);
      setProgress(progData);
      setAttempts(attemptsData);
    } catch (err) {
      console.error("Error loading progress or attempt history:", err);
    }
  }, []);

  const initRoadmap = useCallback(async (targetRole) => {
    if (!targetRole) return;
    setLoading(true);
    setError(null);
    try {
      const roadmapData = await roadmapService.getOrCreateRoadmap(targetRole, token);
      setRoadmap(roadmapData);

      // Save last working target job role in localStorage scoped to the user ID
      if (userProfile?._id) {
        localStorage.setItem(`lastActiveTargetRole_${userProfile._id}`, targetRole);
      }

      await fetchProgressAndAttempts(targetRole, token);
    } catch (err) {
      setError(err.message || "Failed to load target role roadmap.");
    } finally {
      setLoading(false);
    }
  }, [token, userProfile?._id, fetchProgressAndAttempts]);

  const startQuiz = useCallback(async (skill, level, isRetake = false) => {
    setActiveLoadingQuiz(`${skill}-${level}`);
    setQuizLoading(true);
    setError(null);
    setQuizResult(null);
    setQuizAnswers([]);
    setQuizStep(0);
    try {
      const quizData = isRetake
        ? await roadmapService.retakeQuiz(skill, level, roadmap?.targetRole, token)
        : await roadmapService.getQuiz(skill, level, roadmap?.targetRole, token);
      setActiveQuiz(quizData);
    } catch (err) {
      setError(err.message || "Failed to load quiz.");
    } finally {
      setQuizLoading(false);
      setActiveLoadingQuiz(null);
    }
  }, [token, roadmap?.targetRole]);

  const submitQuizAnswers = useCallback(async () => {
    if (!activeQuiz) return;
    setQuizLoading(true);
    setError(null);
    try {
      const result = await roadmapService.submitQuiz(activeQuiz._id, quizAnswers, token);
      setQuizResult(result);
      // Synchronize database history updates
      await fetchProgressAndAttempts(activeQuiz.targetRole, token);
    } catch (err) {
      setError(err.message || "Failed to grade quiz.");
    } finally {
      setQuizLoading(false);
    }
  }, [activeQuiz, quizAnswers, token, fetchProgressAndAttempts]);

  const exitQuiz = useCallback(() => {
    setActiveQuiz(null);
    setQuizAnswers([]);
    setQuizStep(0);
    setQuizResult(null);
  }, []);

  return {
    loading,
    error,
    roadmap,
    progress,
    attempts,
    activeQuiz,
    quizAnswers,
    quizStep,
    setQuizStep,
    quizLoading,
    activeLoadingQuiz,
    quizResult,
    selectedSkill,
    setSelectedSkill,
    setQuizAnswers,
    initRoadmap,
    startQuiz,
    submitQuizAnswers,
    exitQuiz,
    refreshProgress: () => fetchProgressAndAttempts(roadmap?.targetRole, token),
  };
};
