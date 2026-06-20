import React, { useState } from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import { Plus, Trash2, Edit } from "lucide-react";
import styles from "../ProfileSetupPage.module.css";

export const ProjectsStep = ({ data, onChange, onNext, onPrev }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [techInput, setTechInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);

  const projectsList = data.projects || [];

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!title) return;

    const technologies = techInput
      ? techInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const newEntry = {
      title,
      description,
      technologies,
      githubLink,
      liveLink,
    };

    let updatedList;
    if (editingIndex >= 0) {
      updatedList = [...projectsList];
      updatedList[editingIndex] = newEntry;
      setEditingIndex(-1);
    } else {
      updatedList = [...projectsList, newEntry];
    }

    onChange("projects", updatedList);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGithubLink("");
    setLiveLink("");
    setTechInput("");
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    const entry = projectsList[index];
    setTitle(entry.title);
    setDescription(entry.description || "");
    setGithubLink(entry.githubLink || "");
    setLiveLink(entry.liveLink || "");
    setTechInput((entry.technologies || []).join(", "));
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedList = projectsList.filter((_, i) => i !== index);
    onChange("projects", updatedList);
  };

  return (
    <div>
      <h3 className={styles.stepTitle}>Projects</h3>
      <p className={styles.stepDesc}>Add academic or personal projects you've built.</p>

      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: "20px" }}>
        <div className={styles.formGrid}>
          <div className={styles.fullWidth}>
            <Input
              label="Project Title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E-Commerce Platform"
              required
            />
          </div>

          <div>
            <Input
              label="GitHub Repository Link (Optional)"
              id="githubLink"
              type="url"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>

          <div>
            <Input
              label="Live Demo Link (Optional)"
              id="liveLink"
              type="url"
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
              placeholder="https://project.vercel.app"
            />
          </div>

          <div className={styles.fullWidth}>
            <Input
              label="Technologies Used (Comma separated)"
              id="technologies"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label htmlFor="description" style={{ fontSize: "14px", fontWeight: 550 }}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail key challenges solved, system design decisions, and features built."
              rows="3"
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

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <Button type="submit" variant="secondary">
            <Plus size={16} style={{ marginRight: "4px" }} />
            {editingIndex >= 0 ? "Update Project" : "Add Project"}
          </Button>
        </div>
      </form>

      <div className={styles.listContainer}>
        {projectsList.map((proj, idx) => (
          <div key={idx} className={styles.listItem}>
            <div className={styles.listItemInfo}>
              <span className={styles.listItemTitle}>{proj.title}</span>
              {proj.technologies && proj.technologies.length > 0 && (
                <span className={styles.listItemSubtitle}>
                  Tech: {proj.technologies.join(", ")}
                </span>
              )}
              {proj.description && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {proj.description}
                </p>
              )}
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => handleEdit(idx)} className={styles.iconBtn} aria-label="Edit Project">
                <Edit size={16} />
              </button>
              <button type="button" onClick={() => handleDelete(idx)} className={styles.iconBtn} aria-label="Delete Project">
                <Trash2 size={16} color="var(--error-color)" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonRow}>
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};

export default ProjectsStep;
