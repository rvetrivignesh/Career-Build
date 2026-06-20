import React from "react";
import styles from "./QuizInterface.module.css";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/**
 * QuizQuestionView renders the interactive active quiz questions and options.
 */
export const QuizQuestionView = ({
  quiz,
  currentStep,
  answers,
  onAnswerSelect,
  onNext,
  onPrev,
  onSubmit,
  loading,
}) => {
  const currentQuestion = quiz.questions[currentStep];
  const selectedAnswer = answers[currentStep] || "";
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentStep + 1) / totalQuestions) * 100);

  return (
    <div className={styles.quizBox}>
      {/* Header Info */}
      <div className={styles.quizHeader}>
        <div>
          <h2 className={styles.skillTitle}>{quiz.skill}</h2>
          <span className={styles.levelSubtitle}>Level {quiz.level} Assessment</span>
        </div>
        <span className={styles.stepIndicator}>
          Question {currentStep + 1} of {totalQuestions}
        </span>
      </div>

      <div className={styles.progressBarBg}>
        <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Question */}
      <h3 className={styles.questionText}>{currentQuestion.question}</h3>

      {/* Options */}
      <div className={styles.optionsList}>
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={idx}
              type="button"
              className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ""}`}
              onClick={() => onAnswerSelect(currentStep, opt)}
              disabled={loading}
            >
              <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}.</span>
              <span className={styles.optionContent}>{opt}</span>
              {isSelected && <Check size={16} className={styles.selectedCheck} />}
            </button>
          );
        })}
      </div>

      {/* Nav */}
      <div className={styles.navigation}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={onPrev}
          disabled={currentStep === 0 || loading}
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        {currentStep === totalQuestions - 1 ? (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.submitBtn}`}
            onClick={onSubmit}
            disabled={answers.length < totalQuestions || loading}
          >
            <span>{loading ? "Grading..." : "Submit Quiz"}</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.navBtn}
            onClick={onNext}
            disabled={!selectedAnswer || loading}
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionView;
