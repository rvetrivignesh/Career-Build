import React from "react";
import styles from "./QuizInterface.module.css";
import { CheckCircle, XCircle, ChevronLeft } from "lucide-react";

/**
 * QuizResultsView renders quiz attempt analytics, scores, pass/fail status,
 * and list of explanations for the test questions.
 */
export const QuizResultsView = ({ result, onExit }) => {
  const { attempt, feedback, focusAreas } = result;
  const percentage = attempt?.percentage || 0;
  const score = attempt?.score || 0;
  const total = feedback?.length || 10;
  const passed = attempt?.passed || false;

  return (
    <div className={styles.resultsBox}>
      {/* Score Header Panel */}
      <div className={`${styles.resultsHeader} ${passed ? styles.resultsPass : styles.resultsFail}`}>
        <h2 className={styles.resultsTitle}>{passed ? "Congratulations!" : "Keep Learning!"}</h2>
        <p className={styles.resultsSubtitle}>
          You {passed ? "passed" : "did not pass"} the Level {attempt?.level} assessment for {attempt?.skill}.
        </p>

        <div className={styles.scoreCircle}>
          <span className={styles.scoreText}>{Math.round(percentage)}%</span>
          <span className={styles.scoreSubtext}>
            {score} / {total} Correct
          </span>
        </div>

        <span className={styles.statusBadgeLarge}>
          {passed ? "PASSED (Required: 70%)" : "FAILED (Required: 70%)"}
        </span>
      </div>

      {/* Focus Areas/AI recommendations if skill is completed */}
      {focusAreas && focusAreas.length > 0 && (
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>AI Career Coach Focus Recommendations</h3>
          <p className={styles.sectionIntro}>
            Since you completed all 3 levels of this skill, here are custom recommendations:
          </p>
          <ul className={styles.recommendationsList}>
            {focusAreas.map((area, idx) => (
              <li key={idx} className={styles.recommendationItem}>
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Answer Key / Explanation list */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>Detailed Review & Explanations</h3>
        <div className={styles.feedbackList}>
          {feedback.map((q, idx) => (
            <div key={idx} className={styles.feedbackCard}>
              <div className={styles.feedbackQuestionRow}>
                <span className={styles.qNum}>Q{idx + 1}.</span>
                <span className={styles.feedbackQuestion}>{q.question}</span>
              </div>

              <div className={styles.feedbackAnswersRow}>
                <div className={styles.answerIndicator}>
                  <span className={styles.answerLabel}>Your Answer:</span>
                  <span
                    className={`${styles.answerVal} ${
                      q.isCorrect ? styles.txtCorrect : styles.txtIncorrect
                    }`}
                  >
                    {q.userAnswer || "(No answer)"}
                    {q.isCorrect ? (
                      <CheckCircle size={14} className={styles.inlineIcon} />
                    ) : (
                      <XCircle size={14} className={styles.inlineIcon} />
                    )}
                  </span>
                </div>

                {!q.isCorrect && (
                  <div className={styles.answerIndicator}>
                    <span className={styles.answerLabel}>Correct Answer:</span>
                    <span className={`${styles.answerVal} ${styles.txtCorrect}`}>
                      {q.correctAnswer}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.explanationBox}>
                <strong>Explanation:</strong> {q.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exit Button */}
      <button type="button" className={styles.exitBtn} onClick={onExit}>
        <ChevronLeft size={16} />
        <span>Return to Roadmaps Dashboard</span>
      </button>
    </div>
  );
};

export default QuizResultsView;
