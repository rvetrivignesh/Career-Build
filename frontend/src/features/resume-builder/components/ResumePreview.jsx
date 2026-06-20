import React from "react";
import { useAuth } from "@contexts/AuthContext";
import { Mail, Phone, Globe } from "lucide-react";
import styles from "./ResumePreview.module.css";

const Linkedin = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const ResumePreview = ({ resume }) => {
  const { userProfile, user } = useAuth();
  
  if (!resume || !userProfile) return null;

  const {
    templateId = "classic",
    summary,
    objective,
    skills = [],
    education = [],
    experience = [],
    projects = [],
    certifications = [],
    visibilitySettings = {},
    customSection = {},
  } = resume;

  // Helper for displaying date ranges
  const renderDates = (startMonth, startYear, endMonth, endYear, isCurrent) => {
    const start = `${startMonth || ""} ${startYear || ""}`.trim();
    const end = isCurrent ? "Present" : `${endMonth || ""} ${endYear || ""}`.trim();
    return start && end ? `${start} – ${end}` : start || end || "";
  };

  const contactInfo = (
    <div className={styles.contactList}>
      <span className={styles.contactItem}><Mail size={11} /> {userProfile.user?.email || user?.email}</span>
      <span className={styles.contactItem}><Phone size={11} /> {userProfile.phone}</span>
      {userProfile.location && <span className={styles.contactItem}>{userProfile.location}</span>}
      {userProfile.linkedin && <span className={styles.contactItem}><Linkedin size={11} /> {userProfile.linkedin}</span>}
      {userProfile.github && <span className={styles.contactItem}><Github size={11} /> {userProfile.github}</span>}
      {userProfile.portfolio && <span className={styles.contactItem}><Globe size={11} /> {userProfile.portfolio}</span>}
    </div>
  );

  const renderClassicTemplate = () => (
    <div className={`${styles.canvas} ${styles.classic}`}>
      <div className={styles.header}>
        <h1 className={styles.name}>{userProfile.fullName}</h1>
        <h2 className={styles.roleTitle}>{resume.targetRole}</h2>
        {contactInfo}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Objective</h3>
        <p className={styles.bodyText}>{objective}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Professional Summary</h3>
        <p className={styles.bodyText}>{summary}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Technical & Core Skills</h3>
        <div className={styles.skillsListClassic}>
          {skills.join(" • ")}
        </div>
      </div>

      {visibilitySettings.showExperience && experience.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Professional Experience</h3>
          {experience.map((exp, idx) => (
            <div key={idx} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{exp.role} at {exp.company}</span>
                <span className={styles.entryDates}>
                  {renderDates(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.currentlyWorking || exp.isCurrentRole)}
                </span>
              </div>
              <p className={styles.entryDesc}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {visibilitySettings.showProjects && projects.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key Projects</h3>
          {projects.map((proj, idx) => (
            <div key={idx} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>
                  {proj.title}
                  {proj.technologies && proj.technologies.length > 0 && ` | ${proj.technologies.join(", ")}`}
                </span>
                <span className={styles.entryDates} style={{ display: "flex", gap: "8px" }}>
                  {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--primary-color)" }}>GitHub</a>}
                  {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--primary-color)" }}>Live</a>}
                </span>
              </div>
              <p className={styles.entryDesc}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {visibilitySettings.showEducation && education.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Education</h3>
          {education.map((edu, idx) => (
            <div key={idx} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{edu.degree} in {edu.branch} – {edu.institute}</span>
                <span className={styles.entryDates}>
                  {renderDates(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.currentlyStudying)}
                </span>
              </div>
              {edu.cgpa && <p className={styles.entryDesc}>CGPA: {edu.cgpa}/10</p>}
            </div>
          ))}
        </div>
      )}

      {visibilitySettings.showCertifications && certifications.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Certifications</h3>
          <ul className={styles.bulletsList}>
            {certifications.map((cert, idx) => (
              <li key={idx}>
                <strong>{cert.title}</strong> — {cert.issuer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {visibilitySettings.showCustomSection !== false && customSection?.heading && customSection?.content && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{customSection.heading}</h3>
          <p className={styles.bodyText}>{customSection.content}</p>
        </div>
      )}
    </div>
  );

  const renderModernTemplate = () => (
    <div className={`${styles.canvas} ${styles.modern}`}>
      <div className={styles.modernLeftColumn}>
        <h1 className={styles.name}>{userProfile.fullName}</h1>
        <h2 className={styles.roleTitle}>{resume.targetRole}</h2>
        
        <div className={styles.modernSidebarSection}>
          <h4 className={styles.modernSidebarTitle}>Contact</h4>
          <div className={styles.modernSidebarContact}>
            <div>{userProfile.user?.email || user?.email}</div>
            <div>{userProfile.phone}</div>
            {userProfile.location && <div>{userProfile.location}</div>}
          </div>
        </div>

        {userProfile.linkedin || userProfile.github || userProfile.portfolio ? (
          <div className={styles.modernSidebarSection}>
            <h4 className={styles.modernSidebarTitle}>Links</h4>
            <div className={styles.modernSidebarContact}>
              {userProfile.linkedin && <div>LinkedIn: {userProfile.linkedin.replace("https://", "")}</div>}
              {userProfile.github && <div>GitHub: {userProfile.github.replace("https://", "")}</div>}
              {userProfile.portfolio && <div>Portfolio: {userProfile.portfolio.replace("https://", "")}</div>}
            </div>
          </div>
        ) : null}

        <div className={styles.modernSidebarSection}>
          <h4 className={styles.modernSidebarTitle}>Key Skills</h4>
          <div className={styles.skillsContainerModern}>
            {skills.map(s => <span key={s} className={styles.skillBadge}>{s}</span>)}
          </div>
        </div>
      </div>

      <div className={styles.modernRightColumn}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Objective</h3>
          <p className={styles.bodyText}>{objective}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Professional Summary</h3>
          <p className={styles.bodyText}>{summary}</p>
        </div>

        {visibilitySettings.showExperience && experience.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Work Experience</h3>
            {experience.map((exp, idx) => (
              <div key={idx} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryTitle}>{exp.role}</span>
                  <span className={styles.entryDates}>
                    {renderDates(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.currentlyWorking || exp.isCurrentRole)}
                  </span>
                </div>
                <div className={styles.entrySubtitle}>{exp.company}</div>
                <p className={styles.entryDesc}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {visibilitySettings.showProjects && projects.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Projects</h3>
            {projects.map((proj, idx) => (
              <div key={idx} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryTitle}>{proj.title}</span>
                  <span className={styles.entryDates} style={{ display: "flex", gap: "8px" }}>
                    {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--primary-color)" }}>GitHub</a>}
                    {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--primary-color)" }}>Live</a>}
                  </span>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className={styles.entrySubtitle}>{proj.technologies.join(", ")}</div>
                )}
                <p className={styles.entryDesc}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {visibilitySettings.showEducation && education.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Education</h3>
            {education.map((edu, idx) => (
              <div key={idx} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryTitle}>{edu.degree} in {edu.branch}</span>
                  <span className={styles.entryDates}>
                    {renderDates(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.currentlyStudying)}
                  </span>
                </div>
                <div className={styles.entrySubtitle}>{edu.institute}</div>
                {edu.cgpa && <p className={styles.entryDesc}>CGPA: {edu.cgpa}/10</p>}
              </div>
            ))}
          </div>
        )}

        {visibilitySettings.showCertifications && certifications.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Certifications</h3>
            <ul className={styles.bulletsList}>
              {certifications.map((cert, idx) => (
                <li key={idx}>
                  <strong>{cert.title}</strong> — {cert.issuer}
                </li>
              ))}
            </ul>
          </div>
        )}

        {visibilitySettings.showCustomSection !== false && customSection?.heading && customSection?.content && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{customSection.heading}</h3>
            <p className={styles.bodyText}>{customSection.content}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className={`${styles.canvas} ${styles.minimal}`}>
      <div className={styles.minimalHeader}>
        <h1 className={styles.name}>{userProfile.fullName}</h1>
        <div className={styles.minimalSubtitle}>{resume.targetRole}</div>
        {contactInfo}
      </div>

      <hr className={styles.minimalDivider} />

      <div className={styles.minimalRow}>
        <div className={styles.minimalLabelCol}>Objective</div>
        <div className={styles.minimalValueCol}><p className={styles.bodyText}>{objective}</p></div>
      </div>

      <div className={styles.minimalRow}>
        <div className={styles.minimalLabelCol}>Summary</div>
        <div className={styles.minimalValueCol}><p className={styles.bodyText}>{summary}</p></div>
      </div>

      <div className={styles.minimalRow}>
        <div className={styles.minimalLabelCol}>Skills</div>
        <div className={styles.minimalValueCol}>
          <div className={styles.minimalSkillsRow}>{skills.join(", ")}</div>
        </div>
      </div>

      {visibilitySettings.showExperience && experience.length > 0 && (
        <div className={styles.minimalRow}>
          <div className={styles.minimalLabelCol}>Experience</div>
          <div className={styles.minimalValueCol}>
            {experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: "12px" }}>
                <div className={styles.entryHeader}>
                  <strong>{exp.role}</strong> — {exp.company}
                  <span className={styles.entryDates}>
                    {renderDates(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.currentlyWorking || exp.isCurrentRole)}
                  </span>
                </div>
                <p className={styles.entryDesc}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibilitySettings.showProjects && projects.length > 0 && (
        <div className={styles.minimalRow}>
          <div className={styles.minimalLabelCol}>Projects</div>
          <div className={styles.minimalValueCol}>
            {projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: "10px" }}>
                <div className={styles.entryHeader}>
                  <strong>{proj.title}</strong>
                  <span className={styles.entryDates} style={{ display: "flex", gap: "8px" }}>
                    {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--primary-color)" }}>GitHub</a>}
                    {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--primary-color)" }}>Live</a>}
                  </span>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div style={{ fontSize: "11px", fontStyle: "italic", color: "#64748b" }}>Tech: {proj.technologies.join(", ")}</div>
                )}
                <p className={styles.entryDesc}>{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibilitySettings.showEducation && education.length > 0 && (
        <div className={styles.minimalRow}>
          <div className={styles.minimalLabelCol}>Education</div>
          <div className={styles.minimalValueCol}>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: "10px" }}>
                <div className={styles.entryHeader}>
                  <strong>{edu.degree} in {edu.branch}</strong> — {edu.institute}
                  <span className={styles.entryDates}>
                    {renderDates(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.currentlyStudying)}
                  </span>
                </div>
                {edu.cgpa && <p className={styles.entryDesc}>CGPA: {edu.cgpa}/10</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {visibilitySettings.showCertifications && certifications.length > 0 && (
        <div className={styles.minimalRow}>
          <div className={styles.minimalLabelCol}>Certificates</div>
          <div className={styles.minimalValueCol}>
            {certifications.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: "6px" }}>
                <strong>{cert.title}</strong> — {cert.issuer}
              </div>
            ))}
          </div>
        </div>
      )}

      {visibilitySettings.showCustomSection !== false && customSection?.heading && customSection?.content && (
        <div className={styles.minimalRow}>
          <div className={styles.minimalLabelCol}>{customSection.heading}</div>
          <div className={styles.minimalValueCol}>
            <p className={styles.bodyText}>{customSection.content}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div id="resume-preview-print" className={styles.previewCanvasWrapper}>
      {templateId === "classic" && renderClassicTemplate()}
      {templateId === "modern" && renderModernTemplate()}
      {templateId === "minimal" && renderMinimalTemplate()}
    </div>
  );
};

export default ResumePreview;
