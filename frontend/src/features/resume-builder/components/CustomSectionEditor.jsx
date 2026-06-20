import React from "react";
import styles from "./ResumeForm.module.css";

export const CustomSectionEditor = ({ customSection = {}, onChange }) => {
  const heading = customSection?.heading || "";
  const content = customSection?.content || "";

  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="custom-section-heading" className={styles.fieldLabel}>Section Heading</label>
        <input
          id="custom-section-heading"
          type="text"
          value={heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className={styles.textInput}
          placeholder="e.g. Publications, Volunteer Work, Custom Title"
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="custom-section-content" className={styles.fieldLabel}>Section Content (Paragraph)</label>
        <textarea
          id="custom-section-content"
          value={content}
          onChange={(e) => onChange("content", e.target.value)}
          rows={5}
          className={styles.textarea}
          placeholder="Add details for your custom section..."
        />
      </div>
    </>
  );
};

export default CustomSectionEditor;
