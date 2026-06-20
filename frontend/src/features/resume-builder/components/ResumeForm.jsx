import React, { useState } from "react";
import Button from "@components/Button";
import { ChevronDown, ChevronUp, Save, Download } from "lucide-react";
import TemplateSelector from "./TemplateSelector";
import SectionVisibility from "./SectionVisibility";
import SummaryObjectiveEditor from "./SummaryObjectiveEditor";
import SkillsEditor from "./SkillsEditor";
import ExperienceFormList from "./ExperienceFormList";
import ProjectsFormList from "./ProjectsFormList";
import CustomSectionEditor from "./CustomSectionEditor";
import styles from "./ResumeForm.module.css";

export const ResumeForm = ({ resume, onUpdate, onSave, onDownload, saving }) => {
  const [activeSection, setActiveSection] = useState("templates");

  const toggleSection = (sectionName) => {
    setActiveSection((prev) => (prev === sectionName ? "" : sectionName));
  };

  const handleVisibilityToggle = (key) => {
    const visibilitySettings = {
      ...resume.visibilitySettings,
      [key]: !resume.visibilitySettings[key],
    };
    onUpdate({ visibilitySettings });
  };

  const handleTemplateChange = (templateId) => {
    onUpdate({ templateId });
  };

  const handleFieldChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handleSkillsChange = (skills) => {
    onUpdate({ skills });
  };

  const handleListChange = (key, list) => {
    onUpdate({ [key]: list });
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionHeader}>
        <Button onClick={onSave} loading={saving} variant="primary" className={styles.actionBtn}>
          <Save size={16} /> Save
        </Button>
        <Button onClick={onDownload} variant="secondary" className={styles.actionBtn}>
          <Download size={16} /> PDF
        </Button>
      </div>

      {/* Accordion List */}
      <div className={styles.accordionList}>
        {/* Template Selector Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("templates")}>
            <span>1. Choose Template</span>
            {activeSection === "templates" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "templates" && (
            <div className={styles.accordionBody}>
              <TemplateSelector selected={resume.templateId} onChange={handleTemplateChange} />
            </div>
          )}
        </div>

        {/* Section Visibility Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("visibility")}>
            <span>2. Section Visibility</span>
            {activeSection === "visibility" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "visibility" && (
            <div className={styles.accordionBody}>
              <SectionVisibility settings={resume.visibilitySettings} onChange={handleVisibilityToggle} />
            </div>
          )}
        </div>

        {/* Summary & Objective Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("summary")}>
            <span>3. Objective & Summary</span>
            {activeSection === "summary" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "summary" && (
            <div className={styles.accordionBody}>
              <SummaryObjectiveEditor
                objective={resume.objective}
                summary={resume.summary}
                onChange={handleFieldChange}
              />
            </div>
          )}
        </div>

        {/* Skills Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("skills")}>
            <span>4. Skills</span>
            {activeSection === "skills" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "skills" && (
            <div className={styles.accordionBody}>
              <SkillsEditor skills={resume.skills} onChange={handleSkillsChange} />
            </div>
          )}
        </div>

        {/* Experience Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("experience")}>
            <span>5. Experience Details</span>
            {activeSection === "experience" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "experience" && (
            <div className={styles.accordionBody}>
              <ExperienceFormList
                experience={resume.experience}
                onChange={(list) => handleListChange("experience", list)}
              />
            </div>
          )}
        </div>

        {/* Projects Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("projects")}>
            <span>6. Projects</span>
            {activeSection === "projects" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "projects" && (
            <div className={styles.accordionBody}>
              <ProjectsFormList
                projects={resume.projects}
                onChange={(list) => handleListChange("projects", list)}
              />
            </div>
          )}
        </div>

        {/* Custom Section Accordion */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleSection("custom")}>
            <span>7. Add Your Own Data</span>
            {activeSection === "custom" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeSection === "custom" && (
            <div className={styles.accordionBody}>
              <CustomSectionEditor
                customSection={resume.customSection}
                onChange={(key, value) => {
                  const customSection = {
                    ...resume.customSection,
                    [key]: value,
                  };
                  onUpdate({ customSection });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
