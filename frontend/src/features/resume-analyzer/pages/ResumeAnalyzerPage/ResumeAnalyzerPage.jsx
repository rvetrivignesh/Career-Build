import React, { useEffect, useState } from "react";
import useResumeAnalyzer from "../../hooks/useResumeAnalyzer";
import UploadSection from "../../components/UploadSection";
import AnalysisResults from "../../components/AnalysisResults";
import AnalysisHistory from "../../components/AnalysisHistory";
import { PageLoader } from "@components/Loader";
import Button from "@components/Button";
import { History, X } from "lucide-react";
import styles from "./ResumeAnalyzerPage.module.css";

export const ResumeAnalyzerPage = () => {
  const {
    step,
    loading,
    statusMessage,
    analysisProgressStep,
    history,
    activeAnalysis,
    loadHistory,
    runAnalysis,
    viewAnalysis,
    removeAnalysis,
    resetAnalyzer,
    error,
  } = useResumeAnalyzer();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const toggleHistory = () => setIsHistoryOpen((prev) => !prev);

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Resume Analyzer</h1>
          <p className={styles.subtitle}>
            Analyze your resume against targeted roles, identifying missing skills, keywords, and improvement metrics.
          </p>
        </div>
        <button type="button" className={styles.historyToggleBtn} onClick={toggleHistory}>
          <History size={18} />
          <span>{isHistoryOpen ? "Hide History" : "History"}</span>
        </button>
      </header>

      {/* Main Grid Workspace */}
      <div className={styles.workspace}>
        {/* History Sidebar Panel */}
        <aside className={`${styles.sidebar} ${isHistoryOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <span>Analysis Records</span>
            <button type="button" className={styles.closeSidebarBtn} onClick={toggleHistory}>
              <X size={18} />
            </button>
          </div>
          <div className={styles.sidebarContent}>
            <AnalysisHistory
              history={history}
              activeId={activeAnalysis?._id}
              onSelect={(id) => {
                viewAnalysis(id);
                setIsHistoryOpen(false); // close drawer on mobile selection
              }}
              onDelete={removeAnalysis}
            />
          </div>
        </aside>

        {/* Workspace Active Area */}
        <main className={styles.mainContent}>
          {loading && step === "loading" ? (
            <div className={styles.loadingContainer}>
              <h3 className={styles.loadingTitle}>{statusMessage}...</h3>
              <div className={styles.stepsTracker}>
                {[
                  "Extracting Resume",
                  "Parsing Sections",
                  "Matching Skills",
                  "Evaluating Preparedness",
                  "Generating Recommendations"
                ].map((stepMsg, idx) => {
                  const isActive = idx === analysisProgressStep;
                  const isCompleted = idx < analysisProgressStep;
                  return (
                    <div key={idx} className={`${styles.stepItem} ${isActive ? styles.stepActive : ""} ${isCompleted ? styles.stepCompleted : ""}`}>
                      <div className={styles.stepIndicator}>
                        {isCompleted ? "✓" : isActive ? "⏳" : "○"}
                      </div>
                      <span className={styles.stepText}>{stepMsg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : error && (error.toLowerCase().includes("incomplete") || error.toLowerCase().includes("parse") || error.toLowerCase().includes("empty") || error.toLowerCase().includes("scannable") || error.toLowerCase().includes("failed")) ? (
            <div className={styles.fallbackContainer}>
              <div className={styles.fallbackWarning}>
                <h3 className={styles.fallbackTitle}>Unable to Parse Resume</h3>
                <p className={styles.fallbackText} style={{ fontSize: "16px", color: "var(--error-color)", fontWeight: "600", margin: "16px 0" }}>
                  We couldn't reliably parse this resume. Please try another file or upload a DOCX version.
                </p>
                <div className={styles.fallbackActions}>
                  <Button onClick={resetAnalyzer} variant="primary">
                    Try Another File
                  </Button>
                </div>
              </div>
            </div>
          ) : step === "results" && activeAnalysis ? (
            /* Set score variables dynamically on the container so conic-gradients paint perfectly */
            <div style={{ "--value": activeAnalysis.overallScore || activeAnalysis.atsScore }}>
              <AnalysisResults analysis={activeAnalysis} onReset={resetAnalyzer} />
            </div>
          ) : (
            <UploadSection onAnalyze={runAnalysis} loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
