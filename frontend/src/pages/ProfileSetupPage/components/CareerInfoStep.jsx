import React, { useState } from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import { Plus, X } from "lucide-react";
import styles from "../ProfileSetupPage.module.css";

export const CareerInfoStep = ({ data, onChange, onNext, onPrev }) => {
  const [tagInput, setTagInput] = useState("");
  const currentStatusOptions = ["Student", "Fresher", "Working Professional", "Career Switcher"];

  const handleNext = (e) => {
    e.preventDefault();
    if (!data.currentStatus || !data.careerObjective) return;
    if (!data.targetRoles || data.targetRoles.length === 0) {
      alert("Please add at least one target job role.");
      return;
    }
    onNext();
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim();
    if (cleanTag && (!data.targetRoles || !data.targetRoles.includes(cleanTag))) {
      const currentTags = data.targetRoles || [];
      onChange("targetRoles", [...currentTags, cleanTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const currentTags = data.targetRoles || [];
    onChange("targetRoles", currentTags.filter((t) => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleNext}>
      <h3 className={styles.stepTitle}>Career Information</h3>
      <p className={styles.stepDesc}>Define your career path and platform objectives.</p>

      <div className={styles.formGrid}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
          <label htmlFor="currentStatus" style={{ fontSize: "14px", fontWeight: 550 }}>
            Current Status <span style={{ color: "var(--error-color)" }}>*</span>
          </label>
          <select
            id="currentStatus"
            value={data.currentStatus || ""}
            onChange={(e) => onChange("currentStatus", e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-color)",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="" disabled>Select Current Status</option>
            {currentStatusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Current Role (Optional)"
            id="currentRole"
            value={data.currentRole || ""}
            onChange={(e) => onChange("currentRole", e.target.value)}
            placeholder="Frontend Engineer / Student"
          />
        </div>

        <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
          <label htmlFor="targetRoles" style={{ fontSize: "14px", fontWeight: 550 }}>
            Target Job Roles <span style={{ color: "var(--error-color)" }}>*</span>
          </label>
          <div className={styles.tagInput}>
            <input
              type="text"
              id="targetRoles"
              placeholder="e.g. Full Stack Developer"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(e);
                }
              }}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <Button variant="secondary" onClick={handleAddTag} style={{ padding: "10px 16px" }}>
              <Plus size={16} />
            </Button>
          </div>
          <div className={styles.tagContainer}>
            {data.targetRoles?.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(26, 115, 232, 0.1)",
                  color: "var(--primary-color)",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  aria-label={`Remove ${tag}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
          <label htmlFor="careerObjective" style={{ fontSize: "14px", fontWeight: 550 }}>
            Career Objective <span style={{ color: "var(--error-color)" }}>*</span>
          </label>
          <textarea
            id="careerObjective"
            value={data.careerObjective || ""}
            onChange={(e) => onChange("careerObjective", e.target.value)}
            placeholder="Describe your short-term and long-term career goals..."
            required
            rows="4"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-color)",
              fontSize: "14px",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
      </div>

      <div className={styles.buttonRow}>
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default CareerInfoStep;
