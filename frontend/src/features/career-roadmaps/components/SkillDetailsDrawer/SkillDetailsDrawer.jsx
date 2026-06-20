import React from "react";
import styles from "./SkillDetailsDrawer.module.css";
import { X, Award, CheckCircle2, AlertCircle, History, Star } from "lucide-react";

/**
 * SkillDetailsDrawer renders a slide-in sidebar overview of skill completion scores,
 * full list of previous quiz attempts, and tailored AI recommendations.
 */
export const SkillDetailsDrawer = ({ skillName, progress, attempts, onClose }) => {
  const progressItem = progress?.skillScores?.find(
    (s) => s.skill.toLowerCase() === skillName.toLowerCase()
  );

  const skillAttempts = attempts
    .filter((a) => a.skill.toLowerCase() === skillName.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isCompleted = progressItem?.l1Passed && progressItem?.l2Passed && progressItem?.l3Passed;

  // Generate smart customized learning recommendations
  const getRecommendations = () => {
    if (!progressItem) return [];

    const recs = [];
    const { l1Score, l2Score, l3Score } = progressItem;

    if (l1Score < 80) {
      recs.push(`Review core syntax, structures, and foundational definitions of ${skillName}.`);
    }
    if (l2Score < 80) {
      recs.push(`Build small practical sandboxes to gain confidence with async and practical state flows in ${skillName}.`);
    }
    if (l3Score < 85) {
      recs.push(`Explore performance optimization, profiling tools, and memory management specific to ${skillName}.`);
    }

    if (recs.length === 0 && isCompleted) {
      recs.push(`Excellent mastery! Explore architectural design patterns and best-practice scale testing for ${skillName}.`);
      recs.push(`Contribute to open-source libraries or write modular packages utilizing advanced ${skillName} features.`);
      recs.push(`Mentor junior developers or lead code reviews to solidify your command of ${skillName}.`);
    }

    if (recs.length < 3) {
      recs.push(`Practice coding interview questions and algorithmic edge-cases using ${skillName}.`);
      recs.push(`Implement complete error boundary layers and unit tests (Jest/React Testing Library) for your ${skillName} projects.`);
    }

    return recs.slice(0, 4);
  };

  const recommendations = getRecommendations();

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>
        {/* Drawer Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{skillName}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Progress Breakdown */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Award size={18} className={styles.sectionIcon} />
              <span>Skill Progression</span>
            </h3>
            <div className={styles.levelsGrid}>
              {[
                { lvl: 1, name: "Beginner", passed: progressItem?.l1Passed, score: progressItem?.l1Score },
                { lvl: 2, name: "Intermediate", passed: progressItem?.l2Passed, score: progressItem?.l2Score },
                { lvl: 3, name: "Advanced", passed: progressItem?.l3Passed, score: progressItem?.l3Score },
              ].map((item) => (
                <div
                  key={item.lvl}
                  className={`${styles.levelStatusCard} ${item.passed ? styles.levelPassedCard : ""}`}
                >
                  <div className={styles.levelCardTop}>
                    <span className={styles.levelCardNum}>Level {item.lvl}</span>
                    {item.passed ? (
                      <CheckCircle2 size={16} color="#38A169" />
                    ) : (
                      <AlertCircle size={16} color="#A0AEC0" />
                    )}
                  </div>
                  <span className={styles.levelCardName}>{item.name}</span>
                  <span className={styles.levelCardScore}>
                    Best Score: {item.score ? `${item.score}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Focus Recommendations */}
          {isCompleted && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Star size={18} className={styles.sectionIcon} color="#D69E2E" />
                <span>AI Focus Recommendations</span>
              </h3>
              <div className={styles.recsBox}>
                <p className={styles.recsIntro}>Based on your evaluation scores, prioritize the following targets:</p>
                <ul className={styles.recsList}>
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className={styles.recItem}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Attempt History */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <History size={18} className={styles.sectionIcon} />
              <span>Attempt History</span>
            </h3>
            {skillAttempts.length === 0 ? (
              <p className={styles.emptyText}>No quiz attempts registered for this skill yet.</p>
            ) : (
              <div className={styles.attemptsTableContainer}>
                <table className={styles.attemptsTable}>
                  <thead>
                    <tr>
                      <th>Attempt</th>
                      <th>Level</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillAttempts.map((attempt) => (
                      <tr key={attempt._id}>
                        <td>#{attempt.attemptNumber}</td>
                        <td>Level {attempt.level}</td>
                        <td className={styles.tableScore}>{Math.round(attempt.percentage)}%</td>
                        <td>
                          <span
                            className={`${styles.tableBadge} ${
                              attempt.passed ? styles.badgePass : styles.badgeFail
                            }`}
                          >
                            {attempt.passed ? "Pass" : "Fail"}
                          </span>
                        </td>
                        <td className={styles.tableDate}>
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetailsDrawer;
