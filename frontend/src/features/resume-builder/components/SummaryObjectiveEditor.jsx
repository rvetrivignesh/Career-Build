import React from "react";
import styles from "./ResumeForm.module.css";

export const SummaryObjectiveEditor = ({ objective, summary, onChange }) => {
  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="resume-objective" className={styles.fieldLabel}>Career Objective</label>
        <textarea
          id="resume-objective"
          value={objective || ""}
          onChange={(e) => onChange("objective", e.target.value)}
          rows={3}
          className={styles.textarea}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="resume-summary" className={styles.fieldLabel}>Professional Summary</label>
        <textarea
          id="resume-summary"
          value={summary || ""}
          onChange={(e) => onChange("summary", e.target.value)}
          rows={4}
          className={styles.textarea}
        />
      </div>
    </>
  );
};

export default SummaryObjectiveEditor;
