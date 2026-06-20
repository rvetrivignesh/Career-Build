import React from "react";
import styles from "./ResumeForm.module.css";

export const SectionVisibility = ({ settings = {}, onChange }) => {
  return (
    <div className={styles.toggleGrid}>
      {Object.keys(settings).map((key) => (
        <label key={key} className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={!!settings[key]}
            onChange={() => onChange(key)}
            className={styles.toggleInput}
          />
          <span>{key.replace("show", "")}</span>
        </label>
      ))}
    </div>
  );
};

export default SectionVisibility;
