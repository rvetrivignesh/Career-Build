import React from "react";
import QuizQuestionView from "./QuizQuestionView";
import QuizResultsView from "./QuizResultsView";
import { PageLoader } from "@components/Loader";
import styles from "./QuizInterface.module.css";

/**
 * QuizInterface acts as the coordinator between quiz taking (questions) and results views.
 */
export const QuizInterface = ({
  quiz,
  answers,
  setAnswers,
  step,
  setStep,
  loading,
  result,
  onSubmit,
  onExit,
}) => {
  const handleAnswerSelect = (qIdx, answer) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = answer;
      return copy;
    });
  };

  const handleNext = () => {
    if (step < quiz.questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (loading && !result && !quiz) {
    return <PageLoader text="Loading quiz questions..." />;
  }

  if (result) {
    return <QuizResultsView result={result} onExit={onExit} />;
  }

  if (!quiz) {
    return (
      <div className={styles.errorBox}>
        <p>No active quiz loaded. Please return and try again.</p>
        <button type="button" className={styles.exitBtn} onClick={onExit}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <QuizQuestionView
      quiz={quiz}
      currentStep={step}
      answers={answers}
      onAnswerSelect={handleAnswerSelect}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};

export default QuizInterface;
