import React from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import styles from "../ProfileSetupPage.module.css";

export const PersonalInfoStep = ({ data, onChange, onNext }) => {
  const genderOptions = ["Male", "Female", "Other"];

  const handleNext = (e) => {
    e.preventDefault();
    if (!data.fullName || !data.gender || !data.age || !data.location) return;
    onNext();
  };

  return (
    <form onSubmit={handleNext}>
      <h3 className={styles.stepTitle}>Personal Information</h3>
      <p className={styles.stepDesc}>Tell us a bit about yourself to get started.</p>

      <div className={styles.formGrid}>
        <div className={styles.fullWidth}>
          <Input
            label="Full Name"
            id="fullName"
            value={data.fullName || ""}
            onChange={(e) => onChange("fullName", e.target.value)}
            required
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <Input
            label="Age"
            id="age"
            type="number"
            min="10"
            max="100"
            value={data.age || ""}
            onChange={(e) => onChange("age", parseInt(e.target.value) || "")}
            required
            placeholder="25"
          />
        </div>

        <div>
          <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label htmlFor="gender" style={{ fontSize: "14px", fontWeight: 550 }}>
              Gender <span style={{ color: "var(--error-color)" }}>*</span>
            </label>
            <select
              id="gender"
              value={data.gender || ""}
              onChange={(e) => onChange("gender", e.target.value)}
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
              <option value="" disabled>Select Gender</option>
              {genderOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="Location"
            id="location"
            value={data.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            required
            placeholder="City, Country"
          />
        </div>
      </div>

      <div className={styles.buttonRow} style={{ justifyContent: "center" }}>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default PersonalInfoStep;
