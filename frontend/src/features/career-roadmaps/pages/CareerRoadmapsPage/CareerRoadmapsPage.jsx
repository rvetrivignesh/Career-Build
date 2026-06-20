import React, { useEffect, useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useCareerRoadmaps } from "../../hooks/useCareerRoadmaps";
import { RoadmapDashboard } from "../../components/RoadmapDashboard/RoadmapDashboard";
import { SkillCard } from "../../components/SkillCard/SkillCard";
import { QuizInterface } from "../../components/QuizInterface/QuizInterface";
import { SkillDetailsDrawer } from "../../components/SkillDetailsDrawer/SkillDetailsDrawer";
import { PageLoader } from "@components/Loader";
import styles from "./CareerRoadmapsPage.module.css";
import { Sparkles, BrainCircuit } from "lucide-react";

/**
 * CareerRoadmapsPage orchestrates the learning dashboard views, target role selections,
 * skill checklist cards, quiz interactions, and attempt logs.
 */
export const CareerRoadmapsPage = () => {
  const { userProfile } = useAuth();
  const {
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
  } = useCareerRoadmaps();

  const [roleInput, setRoleInput] = useState("");

  // Auto-initialize if targetRole is already set in the user profile or localStorage
  useEffect(() => {
    if (!userProfile?._id) return;

    if (!roadmap) {
      const storageKey = `lastActiveTargetRole_${userProfile._id}`;
      const savedRole = localStorage.getItem(storageKey);

      if (savedRole) {
        initRoadmap(savedRole);
      } else if (userProfile?.targetRoles && userProfile.targetRoles.length > 0) {
        initRoadmap(userProfile.targetRoles[0]);
      }
    }
  }, [userProfile, roadmap, initRoadmap]);

  const handleGenerateRoadmap = (e) => {
    e.preventDefault();
    if (roleInput.trim()) {
      initRoadmap(roleInput.trim());
    }
  };

  if (loading && !roadmap) {
    return <PageLoader text="Generating your custom career roadmap..." />;
  }

  // Active Quiz View
  if (activeQuiz) {
    return (
      <div className={styles.container}>
        <QuizInterface
          quiz={activeQuiz}
          answers={quizAnswers}
          setAnswers={setQuizAnswers}
          step={quizStep}
          setStep={setQuizStep}
          loading={quizLoading}
          result={quizResult}
          onSubmit={submitQuizAnswers}
          onExit={exitQuiz}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Roadmap Setup Input */}
      {!roadmap ? (
        <div className={styles.setupBox}>
          <BrainCircuit size={48} className={styles.setupIcon} />
          <h1 className={styles.title}>Generate Your Career Roadmap</h1>
          <p className={styles.subtitle}>
            Enter your target role to produce an AI-designed learning progression checklist with assessments.
          </p>

          <form onSubmit={handleGenerateRoadmap} className={styles.form}>
            <input
              type="text"
              placeholder="e.g. Frontend Developer, Full Stack Engineer"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.submitBtn}>
              <Sparkles size={16} />
              <span>Create Roadmap</span>
            </button>
          </form>

          {/* Quick presets */}
          <div className={styles.presets}>
            <span className={styles.presetsLabel}>Popular Targets:</span>
            <div className={styles.presetsList}>
              {["Frontend Developer", "Backend Developer", "Full Stack Developer", "AI Engineer", "DevOps Engineer"].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => initRoadmap(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 2. Main Dashboard Layout */
        <div className={styles.dashboardView}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>{roadmap.targetRole} Roadmap</h1>
              <p className={styles.subtitle}>
                Complete quiz assessments sequentially to track your readiness score.
              </p>
            </div>
            {userProfile?.targetRoles && userProfile.targetRoles.length > 1 && (
              <select
                className={styles.roleSelect}
                onChange={(e) => initRoadmap(e.target.value)}
                value={roadmap.targetRole}
              >
                {userProfile.targetRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}
          </header>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* Progress Overview Panel */}
          <RoadmapDashboard progress={progress} />

          {/* Skill Grid */}
          <section className={styles.skillsSection}>
            <h2 className={styles.sectionTitle}>Skill Progression Checklist</h2>
            <div className={styles.skillsGrid}>
              {roadmap.skills?.map((skill, index) => {
                const scoreItem = progress?.skillScores?.find(
                  (s) => s.skill.toLowerCase() === skill.skill.toLowerCase()
                );
                return (
                  <SkillCard
                    key={skill.skill}
                    skill={skill}
                    scoreItem={scoreItem}
                    priorityIndex={index + 1}
                    onTakeQuiz={startQuiz}
                    onViewDetails={setSelectedSkill}
                    activeLoadingQuiz={activeLoadingQuiz}
                    quizLoading={quizLoading}
                  />
                );
              })}
            </div>
          </section>

          {/* Detail Side Drawer */}
          {selectedSkill && (
            <SkillDetailsDrawer
              skillName={selectedSkill}
              progress={progress}
              attempts={attempts}
              onClose={() => setSelectedSkill(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CareerRoadmapsPage;
