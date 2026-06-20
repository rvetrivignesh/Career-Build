import React from "react";
import styles from "./SkillCard.module.css";
import { Lock, CheckCircle2, ChevronRight } from "lucide-react";

/**
 * SkillCard component representing a single skill in the learning path.
 * Renders lock/unlock levels sequentially and triggers quizzes or detailed breakdowns.
 */
export const SkillCard = ({
  skill,
  scoreItem,
  priorityIndex,
  onTakeQuiz,
  onViewDetails,
  activeLoadingQuiz = null,
  quizLoading = false,
}) => {
  const { description } = skill;
  const score = scoreItem?.score || 0;
  const l1Passed = scoreItem?.l1Passed || false;
  const l2Passed = scoreItem?.l2Passed || false;
  const l3Passed = scoreItem?.l3Passed || false;

  const l1Score = scoreItem?.l1Score || 0;
  const l2Score = scoreItem?.l2Score || 0;
  const l3Score = scoreItem?.l3Score || 0;

  // Determine Overall Status
  let status = "Not Started";
  let statusClass = styles.notStarted;
  if (l1Passed && l2Passed && l3Passed) {
    status = "Completed";
    statusClass = styles.completed;
  } else if (l1Passed || l2Passed || l3Passed || l1Score > 0 || l2Score > 0 || l3Score > 0) {
    status = "In Progress";
    statusClass = styles.inProgress;
  }

  // Determine Level Statuses
  const levels = [
    { level: 1, name: "Beginner", passed: l1Passed, score: l1Score, unlocked: true },
    { level: 2, name: "Intermediate", passed: l2Passed, score: l2Score, unlocked: l1Passed },
    { level: 3, name: "Advanced", passed: l3Passed, score: l3Score, unlocked: l1Passed && l2Passed },
  ];

  return (
    <div className={`${styles.card} ${status === "Completed" ? styles.cardCompleted : ""}`}>
      {/* Header Info */}
      <div className={styles.header}>
        <span className={styles.priority}>Rank #{priorityIndex}</span>
        <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>
      </div>

      {/* Main Info */}
      <h3 className={styles.title}>{skill.skill}</h3>
      <p className={styles.description}>{description}</p>

      {/* Weighted Score */}
      <div className={styles.scoreRow}>
        <span className={styles.scoreLabel}>Skill Score</span>
        <span className={styles.scoreValue}>{score}%</span>
      </div>

      {/* Levels list */}
      <div className={styles.levelsList}>
        {levels.map((lvl) => {
          let btnText = "Locked";
          let actionFn = null;
          let showLvlBtn = false;

          if (lvl.unlocked) {
            if (lvl.passed) {
              btnText = "Retake";
              actionFn = () => onTakeQuiz(skill.skill, lvl.level, true);
              showLvlBtn = true;
            } else if (lvl.score > 0) {
              btnText = "Retry";
              actionFn = () => onTakeQuiz(skill.skill, lvl.level, true);
              showLvlBtn = true;
            } else {
              btnText = "Start Quiz";
              actionFn = () => onTakeQuiz(skill.skill, lvl.level, false);
              showLvlBtn = true;
            }
          }

          return (
            <div
              key={lvl.level}
              className={`${styles.levelRow} ${!lvl.unlocked ? styles.levelLocked : ""}`}
            >
              <div className={styles.levelInfo}>
                <span className={styles.levelNum}>L{lvl.level}: {lvl.name}</span>
                {lvl.passed ? (
                  <CheckCircle2 size={16} className={styles.checkedIcon} />
                ) : !lvl.unlocked ? (
                  <Lock size={14} className={styles.lockIcon} />
                ) : null}
              </div>
              <div className={styles.levelActions}>
                {lvl.score > 0 && <span className={styles.levelScore}>{lvl.score}%</span>}
                {showLvlBtn ? (
                  <button
                    type="button"
                    className={styles.levelBtn}
                    onClick={actionFn}
                    disabled={quizLoading}
                  >
                    {activeLoadingQuiz === `${skill.skill}-${lvl.level}` ? "Loading..." : btnText}
                  </button>
                ) : (
                  <span className={styles.lockedLabel}>Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer details button */}
      <button
        type="button"
        className={styles.detailsBtn}
        onClick={() => onViewDetails(skill.skill)}
      >
        <span>View Details & History</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default SkillCard;
