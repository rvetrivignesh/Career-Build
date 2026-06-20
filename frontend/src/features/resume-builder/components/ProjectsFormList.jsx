import React from "react";
import Button from "@components/Button";
import { X } from "lucide-react";
import styles from "./ResumeForm.module.css";

export const ProjectsFormList = ({ projects = [], onChange }) => {
  const handleItemChange = (index, key, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const handleAdd = () => {
    const newEntry = {
      title: "",
      description: "",
      technologies: [],
      githubLink: "",
      liveLink: "",
    };
    onChange([...projects, newEntry]);
  };

  const handleRemove = (index) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <>
      {projects.map((proj, idx) => (
        <div key={idx} className={styles.itemEditBlock}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.itemIndexLabel}>Project #{idx + 1}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className={styles.removeTagBtn}
              style={{ color: "var(--error-color)" }}
              aria-label="Remove Project"
            >
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            value={proj.title || ""}
            onChange={(e) => handleItemChange(idx, "title", e.target.value)}
            placeholder="Project Title"
            className={styles.textInput}
            required
          />
          <input
            type="text"
            value={proj.githubLink || ""}
            onChange={(e) => handleItemChange(idx, "githubLink", e.target.value)}
            placeholder="GitHub Repo URL (Optional)"
            className={styles.textInput}
          />
          <input
            type="text"
            value={proj.liveLink || ""}
            onChange={(e) => handleItemChange(idx, "liveLink", e.target.value)}
            placeholder="Live Demo URL (Optional)"
            className={styles.textInput}
          />
          <input
            type="text"
            value={proj.technologies?.join(", ") || ""}
            onChange={(e) => handleItemChange(idx, "technologies", e.target.value.split(",").map(t => t.trim()))}
            placeholder="Technologies (comma separated)"
            className={styles.textInput}
          />
          <textarea
            value={proj.description || ""}
            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
            placeholder="Project Description"
            rows={2}
            className={styles.textarea}
          />
        </div>
      ))}
      <Button variant="secondary" onClick={handleAdd} style={{ width: "100%", padding: "8px" }}>
        + Add Project
      </Button>
    </>
  );
};

export default ProjectsFormList;
