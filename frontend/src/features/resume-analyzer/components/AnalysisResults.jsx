import React, { useState } from "react";
import Button from "@components/Button";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Award,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Cpu,
  Code,
  Database
} from "lucide-react";
import styles from "./AnalysisResults.module.css";

export const AnalysisResults = ({ analysis }) => {
  const [activeDetailsTab, setActiveDetailsTab] = useState("experience");

  if (!analysis) return null;

  const getScoreColorClass = (score) => {
    if (score >= 80) return styles.scoreHigh;
    if (score >= 60) return styles.scoreMedium;
    return styles.scoreLow;
  };

  const getScoreStrokeClass = (score) => {
    if (score >= 80) return styles.strokeHigh;
    if (score >= 60) return styles.strokeMedium;
    return styles.strokeLow;
  };

  const getMatchLevel = (score) => {
    if (score >= 80) return { text: "Strong Match", class: styles.matchStrong };
    if (score >= 60) return { text: "Moderate Match", class: styles.matchModerate };
    return { text: "Needs Improvement", class: styles.matchImprovement };
  };

  const matchLevel = getMatchLevel(analysis.overallScore || analysis.atsScore || 0);
  const strokeDashoffset = 251.2 - (251.2 * (analysis.overallScore || analysis.atsScore || 0)) / 100;

  const subScores = [
    { label: "ATS Compatibility", value: analysis.atsScore },
    { label: "Technical Skills", value: analysis.technicalScore },
    { label: "Project Quality", value: analysis.projectScore },
    { label: "Work Experience", value: analysis.experienceScore },
    { label: "Education Profile", value: analysis.educationScore },
    { label: "Industry Readiness", value: analysis.industryReadiness },
    { label: "Communication Quality", value: analysis.communicationScore }
  ];

  return (
    <div className={styles.container}>
      {/* Candidate Profile Header Card */}
      <div className={styles.profileHeaderCard}>
        <div className={styles.profileAvatar}>
          {analysis.candidate?.name ? analysis.candidate.name.charAt(0).toUpperCase() : "C"}
        </div>
        <div className={styles.profileDetails}>
          <h2 className={styles.candidateName}>{analysis.candidate?.name || "Candidate Name"}</h2>
          <p className={styles.candidateRole}>
            Target Role: <strong>{analysis.targetRole}</strong>
          </p>
          <div className={styles.candidateContacts}>
            {analysis.candidate?.email && (
              <span className={styles.contactItem}>
                <Mail size={14} /> {analysis.candidate.email}
              </span>
            )}
            {analysis.candidate?.phone && (
              <span className={styles.contactItem}>
                <Phone size={14} /> {analysis.candidate.phone}
              </span>
            )}
            {analysis.candidate?.location && (
              <span className={styles.contactItem}>
                <MapPin size={14} /> {analysis.candidate.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Score Dash Grid */}
      <div className={styles.summaryGrid}>
        {/* Overall Score Circle Card */}
        <div className={styles.overallScoreCard}>
          <h4 className={styles.cardHeaderTitle}>Overall Preparedness</h4>
          
          <div className={styles.radialProgressContainer}>
            <svg className={styles.radialSvg} width="140" height="140" viewBox="0 0 100 100">
              <circle className={styles.circleBg} cx="50" cy="50" r="40" strokeWidth="8" fill="none" />
              <circle
                className={`${styles.circleProgress} ${getScoreStrokeClass(analysis.overallScore || analysis.atsScore || 0)}`}
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text className={styles.radialText} x="50" y="58" textAnchor="middle">
                {analysis.overallScore || analysis.atsScore || 0}
              </text>
            </svg>
          </div>

          <div className={`${styles.matchLevelBadge} ${matchLevel.class}`}>
            {matchLevel.text}
          </div>
        </div>

        {/* Sub-Scores List */}
        <div className={styles.subScoresCard}>
          <h4 className={styles.panelTitle}>ATS Resume Performance Dimensions</h4>
          <div className={styles.subScoreList}>
            {subScores.map((sub, idx) => {
              const val = Math.min(Math.max(Math.round(sub.value || 0), 0), 100);
              return (
                <div key={idx} className={styles.subScoreItem}>
                  <div className={styles.subScoreLabelRow}>
                    <span className={styles.subScoreLabel}>{sub.label}</span>
                    <span className={styles.subScoreVal}>{val}%</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={`${styles.progressBarFill} ${getScoreColorClass(val)}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extracted Skills Inventory */}
      <div className={styles.skillsInventoryCard}>
        <h4 className={styles.panelTitle}>Extracted Technical & Soft Skills</h4>
        <div className={styles.skillsGrid}>
          {/* General Skills */}
          <div className={styles.skillsCol}>
            <h5 className={styles.skillsColTitle}>
              <Cpu size={15} /> Core Skills
            </h5>
            <div className={styles.badgeContainer}>
              {analysis.skills && analysis.skills.length > 0 ? (
                analysis.skills.map((s, i) => <span key={i} className={`${styles.tag} ${styles.tagSkill}`}>{s}</span>)
              ) : (
                <span className={styles.noneText}>None found</span>
              )}
            </div>
          </div>
          {/* Frameworks */}
          <div className={styles.skillsCol}>
            <h5 className={styles.skillsColTitle}>
              <Code size={15} /> Frameworks & Libraries
            </h5>
            <div className={styles.badgeContainer}>
              {analysis.frameworks && analysis.frameworks.length > 0 ? (
                analysis.frameworks.map((f, i) => <span key={i} className={`${styles.tag} ${styles.tagFramework}`}>{f}</span>)
              ) : (
                <span className={styles.noneText}>None found</span>
              )}
            </div>
          </div>
          {/* Databases */}
          <div className={styles.skillsCol}>
            <h5 className={styles.skillsColTitle}>
              <Database size={15} /> Databases
            </h5>
            <div className={styles.badgeContainer}>
              {analysis.databases && analysis.databases.length > 0 ? (
                analysis.databases.map((db, i) => <span key={i} className={`${styles.tag} ${styles.tagDatabase}`}>{db}</span>)
              ) : (
                <span className={styles.noneText}>None found</span>
              )}
            </div>
          </div>
          {/* Tools */}
          <div className={styles.skillsCol}>
            <h5 className={styles.skillsColTitle}>
              <BookOpen size={15} /> Tools & Platforms
            </h5>
            <div className={styles.badgeContainer}>
              {analysis.tools && analysis.tools.length > 0 ? (
                analysis.tools.map((t, i) => <span key={i} className={`${styles.tag} ${styles.tagTool}`}>{t}</span>)
              ) : (
                <span className={styles.noneText}>None found</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Details Tab Card */}
      <div className={styles.detailsTabsCard}>
        <div className={styles.tabsHeader}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeDetailsTab === "experience" ? styles.tabActive : ""}`}
            onClick={() => setActiveDetailsTab("experience")}
          >
            <Briefcase size={16} /> Work Experience ({analysis.experience?.length || 0})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeDetailsTab === "projects" ? styles.tabActive : ""}`}
            onClick={() => setActiveDetailsTab("projects")}
          >
            <Code size={16} /> Projects ({analysis.projects?.length || 0})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeDetailsTab === "education" ? styles.tabActive : ""}`}
            onClick={() => setActiveDetailsTab("education")}
          >
            <Award size={16} /> Education ({analysis.education?.length || 0})
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeDetailsTab === "experience" && (
            <div className={styles.timeline}>
              {analysis.experience && analysis.experience.length > 0 ? (
                analysis.experience.map((exp, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineHeader}>
                      <h4 className={styles.timelineTitle}>{exp.role}</h4>
                      <span className={styles.timelineDuration}>{exp.duration}</span>
                    </div>
                    <h5 className={styles.timelineSub}>{exp.company}</h5>
                    <p className={styles.timelineText}>{exp.description}</p>
                  </div>
                ))
              ) : (
                <p className={styles.noData}>No work experience extracted from this resume.</p>
              )}
            </div>
          )}

          {activeDetailsTab === "projects" && (
            <div className={styles.projectsGrid}>
              {analysis.projects && analysis.projects.length > 0 ? (
                analysis.projects.map((proj, idx) => (
                  <div key={idx} className={styles.projectCard}>
                    <h4 className={styles.projectTitle}>{proj.title}</h4>
                    <p className={styles.projectDescription}>{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className={styles.projectTech}>
                        {proj.technologies.map((t, i) => (
                          <span key={i} className={styles.techTag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.noData}>No projects extracted from this resume.</p>
              )}
            </div>
          )}

          {activeDetailsTab === "education" && (
            <div className={styles.educationList}>
              {analysis.education && analysis.education.length > 0 ? (
                analysis.education.map((edu, idx) => (
                  <div key={idx} className={styles.educationItem}>
                    <div className={styles.eduDot} />
                    <div className={styles.eduHeader}>
                      <h4 className={styles.eduInstitute}>{edu.institute}</h4>
                      <span className={styles.eduDuration}>{edu.duration}</span>
                    </div>
                    <p className={styles.eduDegree}>{edu.degree}</p>
                  </div>
                ))
              ) : (
                <p className={styles.noData}>No education history extracted from this resume.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className={styles.strengthsWeaknessesGrid}>
        <div className={`${styles.evalPanel} ${styles.strengthsPanel}`}>
          <div className={styles.panelHeader}>
            <CheckCircle2 size={18} />
            <span>Resume Strengths</span>
          </div>
          <ul className={styles.evalList}>
            {analysis.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((str, i) => <li key={i}>{str}</li>)
            ) : (
              <li>No key strengths identified. Keep optimizing sections.</li>
            )}
          </ul>
        </div>

        <div className={`${styles.evalPanel} ${styles.weaknessesPanel}`}>
          <div className={styles.panelHeader}>
            <AlertTriangle size={18} />
            <span>Resume Weaknesses</span>
          </div>
          <ul className={styles.evalList}>
            {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
              analysis.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)
            ) : (
              <li>No critical gaps found. Excellent alignment!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Gaps and Recommendations Panel */}
      <div className={styles.recommendationsGrid}>
        {/* Missing Skills */}
        <div className={styles.recommendCardCustom}>
          <h4 className={styles.recommendCardTitle}>
            <AlertTriangle size={16} /> Target Role Skill Gaps
          </h4>
          <p className={styles.recommendCardSub}>
            These skills are missing on your resume compared to the target role requirements:
          </p>
          <div className={styles.missingSkillsContainer}>
            {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
              analysis.missingSkills.map((s, i) => (
                <span key={i} className={styles.missingSkillTag}>
                  {s}
                </span>
              ))
            ) : (
              <span className={styles.allSkillsMatched}>✓ All core role competencies are already covered in your resume!</span>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className={styles.recommendCardCustom}>
          <h4 className={styles.recommendCardTitle}>
            <Lightbulb size={16} /> Actionable Recommendations
          </h4>
          <p className={styles.recommendCardSub}>
            Action items to increase compatibility and improve scores:
          </p>
          <ul className={styles.bulletsList}>
            {analysis.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)
            ) : (
              <li>No suggestions needed. Your resume matches closely!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
