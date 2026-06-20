import React, { useState } from "react";
import Button from "@components/Button";
import Input from "@components/Input";
import { Briefcase, ArrowRight } from "lucide-react";
import styles from "./RoleSelector.module.css";

const PRESET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Scientist",
  "DevOps Engineer",
];

export const RoleSelector = ({ onSelect, loading }) => {
  const [customRole, setCustomRole] = useState("");

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    const clean = customRole.trim();
    if (clean) {
      onSelect(clean);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Choose Your Target Role</h2>
      <p className={styles.subtitle}>
        We will customize your professional summary, objective, and skills matching the industry standards for this role.
      </p>

      {/* Preset Grid */}
      <div className={styles.grid}>
        {PRESET_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={styles.roleCard}
            onClick={() => onSelect(role)}
            disabled={loading}
          >
            <div className={styles.cardIcon}>
              <Briefcase size={20} />
            </div>
            <span className={styles.roleName}>{role}</span>
          </button>
        ))}
      </div>

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      {/* Custom Input */}
      <form onSubmit={handleSubmitCustom} className={styles.customForm}>
        <div className={styles.inputWrapper}>
          <Input
            id="custom-role-input"
            label="Enter Custom Target Role"
            placeholder="e.g. Cybersecurity Analyst"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            required
            disabled={loading}
          />
          <Button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !customRole.trim()}
          >
            Generate <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoleSelector;
