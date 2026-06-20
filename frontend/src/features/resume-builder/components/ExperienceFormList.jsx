import React from "react";
import Button from "@components/Button";
import { X } from "lucide-react";
import styles from "./ResumeForm.module.css";

export const ExperienceFormList = ({ experience = [], onChange }) => {
  const handleItemChange = (index, key, value) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const handleAdd = () => {
    const newEntry = {
      role: "",
      company: "",
      description: "",
      employmentType: "Full-Time",
      startMonth: "Jan",
      startYear: new Date().getFullYear(),
      currentlyWorking: true,
      duration: 1,
    };
    onChange([...experience, newEntry]);
  };

  const handleRemove = (index) => {
    onChange(experience.filter((_, i) => i !== index));
  };

  return (
    <>
      {experience.map((exp, idx) => (
        <div key={idx} className={styles.itemEditBlock}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.itemIndexLabel}>Job #{idx + 1}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className={styles.removeTagBtn}
              style={{ color: "var(--error-color)" }}
              aria-label="Remove Experience"
            >
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            value={exp.role || ""}
            onChange={(e) => handleItemChange(idx, "role", e.target.value)}
            placeholder="Role Title"
            className={styles.textInput}
          />
          <input
            type="text"
            value={exp.company || ""}
            onChange={(e) => handleItemChange(idx, "company", e.target.value)}
            placeholder="Company Name"
            className={styles.textInput}
          />
          <textarea
            value={exp.description || ""}
            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
            placeholder="Responsibilities / Highlights"
            rows={2}
            className={styles.textarea}
          />
        </div>
      ))}
      <Button variant="secondary" onClick={handleAdd} style={{ width: "100%", padding: "8px" }}>
        + Add Experience
      </Button>
    </>
  );
};

export default ExperienceFormList;
