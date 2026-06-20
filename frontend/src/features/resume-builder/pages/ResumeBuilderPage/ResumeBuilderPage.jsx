import React, { useEffect, useState } from "react";
import useResumeBuilder from "../../hooks/useResumeBuilder";
import RoleSelector from "../../components/RoleSelector";
import LoadingScreen from "../../components/LoadingScreen";
import ResumeForm from "../../components/ResumeForm";
import ResumePreview from "../../components/ResumePreview";
import Button from "@components/Button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import html2pdf from "html2pdf.js";
import styles from "./ResumeBuilderPage.module.css";

export const ResumeBuilderPage = () => {
  const { userProfile } = useAuth();
  const {
    step,
    loading,
    statusMessage,
    resume,
    loadLatestResume,
    startGeneration,
    updateResumeLocal,
    persistResume,
    resetBuilder,
  } = useResumeBuilder();

  const [activeTab, setActiveTab] = useState("edit"); // 'edit' | 'preview' (used on mobile only)

  useEffect(() => {
    loadLatestResume();
  }, [loadLatestResume]);

  const handleBackToSelect = () => {
    if (window.confirm("Are you sure you want to go back? Unsaved progress will be lost.")) {
      resetBuilder();
    }
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector("#resume-preview-print > div");
    if (!element) {
      alert("Resume preview element not found!");
      return;
    }

    const opt = {
      margin: 0,
      filename: `${userProfile?.fullName || "resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      },
      jsPDF: { 
        unit: "in", 
        format: "a4", 
        orientation: "portrait" 
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    // Temporarily adjust styles for clean PDF conversion (avoiding empty trailing pages)
    const originalMinHeight = element.style.minHeight;
    const originalBoxShadow = element.style.boxShadow;
    
    element.style.setProperty("min-height", "auto", "important");
    element.style.setProperty("box-shadow", "none", "important");

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        if (originalMinHeight) element.style.setProperty("min-height", originalMinHeight);
        else element.style.removeProperty("min-height");
        
        if (originalBoxShadow) element.style.setProperty("box-shadow", originalBoxShadow);
        else element.style.removeProperty("box-shadow");
      })
      .catch((err) => {
        console.error("PDF generation error:", err);
        if (originalMinHeight) element.style.setProperty("min-height", originalMinHeight);
        else element.style.removeProperty("min-height");
        
        if (originalBoxShadow) element.style.setProperty("box-shadow", originalBoxShadow);
        else element.style.removeProperty("box-shadow");
      });
  };

  return (
    <div className={styles.container}>
      {/* Header section (hidden when printing) */}
      <header className={`${styles.header} no-print`}>
        <div className={styles.headerInfo}>
          {step === "editor" && (
            <button type="button" className={styles.backBtn} onClick={handleBackToSelect}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div>
            <h1 className={styles.title}>Resume Builder</h1>
            <p className={styles.subtitle}>
              {step === "editor"
                ? `Customizing resume for target role: ${resume?.targetRole}`
                : "Generate an ATS-friendly, professional resume in seconds."}
            </p>
          </div>
        </div>
      </header>

      {/* Render Steps */}
      {step === "loading" && <LoadingScreen message={statusMessage} />}

      {step === "select-role" && (
        <div className="no-print">
          <RoleSelector onSelect={startGeneration} loading={loading} />
        </div>
      )}

      {step === "editor" && resume && (
        <div className={styles.editorWorkspace}>
          {/* Mobile Tab Swapper */}
          <div className={`${styles.mobileTabs} no-print`}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "edit" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              Edit Details
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "preview" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              View Preview
            </button>
          </div>

          <div className={styles.splitLayout}>
            {/* Left Column: Form Editor (hidden on mobile when preview is active) */}
            <div className={`${styles.formColumn} no-print ${activeTab === "edit" ? styles.mobileVisible : styles.mobileHidden}`}>
              <ResumeForm
                resume={resume}
                onUpdate={updateResumeLocal}
                onSave={persistResume}
                onDownload={handleDownloadPDF}
                saving={loading}
              />
            </div>

            {/* Right Column: High Fidelity Preview (hidden on mobile when edit is active) */}
            <div className={`${styles.previewColumn} ${activeTab === "preview" ? styles.mobileVisible : styles.mobileHidden}`}>
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilderPage;
