import React from "react";
import styles from "./ResumeForm.module.css";

export const TemplateSelector = ({ selected, onChange }) => {
  return (
    <div className={styles.templateGrid}>
      {["classic", "modern", "minimal"].map((t) => (
        <button
          key={t}
          type="button"
          className={`${styles.templateBtn} ${selected === t ? styles.templateBtnActive : ""}`}
          onClick={() => onChange(t)}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
