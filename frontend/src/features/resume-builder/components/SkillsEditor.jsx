import React, { useState } from "react";
import Button from "@components/Button";
import { Plus, X } from "lucide-react";
import styles from "./ResumeForm.module.css";

export const SkillsEditor = ({ skills = [], onChange }) => {
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      onChange([...skills, clean]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <>
      <div className={styles.tagInputWrapper}>
        <input
          type="text"
          placeholder="Add skill..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill(e)}
          className={styles.textInput}
        />
        <Button variant="secondary" onClick={handleAddSkill} style={{ padding: "8px 12px" }}>
          <Plus size={14} />
        </Button>
      </div>
      <div className={styles.tagContainer}>
        {skills.map((s) => (
          <span key={s} className={styles.tag}>
            {s}
            <button type="button" onClick={() => handleRemoveSkill(s)} className={styles.removeTagBtn}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    </>
  );
};

export default SkillsEditor;
