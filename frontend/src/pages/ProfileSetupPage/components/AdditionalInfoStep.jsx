import React, { useState } from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import { Plus, X, Trash2 } from "lucide-react";
import styles from "../ProfileSetupPage.module.css";

export const AdditionalInfoStep = ({ data, onChange, onSubmit, onPrev, loading }) => {
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && (!data.skills || !data.skills.includes(clean))) {
      onChange("skills", [...(data.skills || []), clean]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange("skills", (data.skills || []).filter((s) => s !== skillToRemove));
  };

  const handleAddLanguage = (e) => {
    e.preventDefault();
    const clean = langInput.trim();
    if (clean && (!data.languages || !data.languages.includes(clean))) {
      onChange("languages", [...(data.languages || []), clean]);
      setLangInput("");
    }
  };

  const handleAddAchievement = (e) => {
    e.preventDefault();
    const clean = achievementInput.trim();
    if (clean && (!data.achievements || !data.achievements.includes(clean))) {
      onChange("achievements", [...(data.achievements || []), clean]);
      setAchievementInput("");
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!data.skills || data.skills.length === 0) {
      alert("Please add at least one skill.");
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <h3 className={styles.stepTitle}>Additional Information</h3>
      <p className={styles.stepDesc}>Add skills and achievements to complete your profile.</p>

      <div className={styles.formGrid}>
        {/* Skills (Required) */}
        <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
          <label htmlFor="skills" style={{ fontSize: "14px", fontWeight: 550 }}>
            Skills <span style={{ color: "var(--error-color)" }}>*</span>
          </label>
          <div className={styles.tagInput}>
            <input
              type="text"
              id="skills"
              placeholder="e.g. React"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
              style={textInputStyle}
            />
            <Button variant="secondary" onClick={handleAddSkill} style={{ padding: "10px 16px" }}>
              <Plus size={16} />
            </Button>
          </div>
          <div className={styles.tagContainer}>
            {data.skills?.map((s) => (
              <span key={s} style={tagStyle}>
                {s}
                <button type="button" onClick={() => handleRemoveSkill(s)} style={removeTagBtnStyle}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Languages (Optional) */}
        <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
          <label htmlFor="languages" style={{ fontSize: "14px", fontWeight: 550 }}>Languages</label>
          <div className={styles.tagInput}>
            <input
              type="text"
              id="languages"
              placeholder="e.g. English"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage(e);
                }
              }}
              style={textInputStyle}
            />
            <Button variant="secondary" onClick={handleAddLanguage} style={{ padding: "10px 16px" }}>
              <Plus size={16} />
            </Button>
          </div>
          <div className={styles.tagContainer}>
            {data.languages?.map((l) => (
              <span key={l} style={tagStyle}>
                {l}
                <button type="button" onClick={() => onChange("languages", data.languages.filter(x => x !== l))} style={removeTagBtnStyle}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Achievements (Optional) */}
        <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
          <label htmlFor="achievements" style={{ fontSize: "14px", fontWeight: 550 }}>Achievements</label>
          <div className={styles.tagInput}>
            <input
              type="text"
              id="achievements"
              placeholder="e.g. Dean's List / Hackathon Winner"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAchievement(e);
                }
              }}
              style={textInputStyle}
            />
            <Button variant="secondary" onClick={handleAddAchievement} style={{ padding: "10px 16px" }}>
              <Plus size={16} />
            </Button>
          </div>
          <div className={styles.tagContainer}>
            {data.achievements?.map((a) => (
              <span key={a} style={tagStyle}>
                {a}
                <button type="button" onClick={() => onChange("achievements", data.achievements.filter(x => x !== a))} style={removeTagBtnStyle}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button type="submit" loading={loading}>
          Complete Setup
        </Button>
      </div>
    </form>
  );
};

const textInputStyle = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--card-bg)",
  color: "var(--text-color)",
  fontSize: "14px",
  outline: "none",
};

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "rgba(26, 115, 232, 0.1)",
  color: "var(--primary-color)",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
};

const removeTagBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--primary-color)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

export default AdditionalInfoStep;
