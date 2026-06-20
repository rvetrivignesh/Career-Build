import React, { useState } from "react";
import Button from "@components/Button";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Award,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  BookOpen,
  TrendingUp
} from "lucide-react";
import styles from "./AnalysisResults.module.css";

export const AnalysisResults = ({ analysis, onReset }) => {
  const [activeAccordion, setActiveAccordion] = useState("skills");

  if (!analysis) return null;

  const toggleAccordion = (name) => {
    setActiveAccordion((prev) => (prev === name ? "" : name));
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return styles.scoreHigh;
    if (score >= 60) return styles.scoreMedium;
    return styles.scoreLow;
  };

  // Determine Match Level Text and Color
  const getMatchLevel = (score) => {
    if (score >= 80) return { text: "Strong Match", class: styles.matchStrong };
    if (score >= 60) return { text: "Moderate Match", class: styles.matchModerate };
    return { text: "Needs Improvement", class: styles.matchImprovement };
  };

  const matchLevel = getMatchLevel(analysis.atsScore);

  // Helper to separate core vs secondary vs keywords in missing lists
  const missingCore = analysis.missingSkills?.filter(
    s => !analysis.skillsToLearn || analysis.skillsToLearn.slice(0, 5).includes(s)
  ) || [];

  const missingSecondary = analysis.missingSkills?.filter(
    s => !missingCore.includes(s)
  ) || [];

  // 6 Preparedness Breakdown categories
  const subScores = [
    {
      label: "Resume Structure",
      value: analysis.resumeStructureScore !== undefined ? analysis.resumeStructureScore : 0
    },
    {
      label: "Role Alignment",
      value: analysis.roleMatchScore !== undefined ? analysis.roleMatchScore : (analysis.keywordScore || 0)
    },
    {
      label: "Project Quality",
      value: analysis.projectQualityScore !== undefined ? analysis.projectQualityScore : (analysis.contentScore || 0)
    },
    {
      label: "Experience Quality",
      value: analysis.experienceQualityScore !== undefined ? analysis.experienceQualityScore : 0
    },
    {
      label: "Roadmap Progress",
      value: analysis.roadmapAlignmentScore !== undefined ? analysis.roadmapAlignmentScore : 0
    },
    {
      label: "Resume Optimization",
      value: analysis.resumeOptimizationScore !== undefined ? analysis.resumeOptimizationScore : 0
    }
  ];

  return (
    <div className={styles.container}>
      {/* Top Summary Block */}
      <div className={styles.summaryGrid}>
        {/* Overall Preparedness Score Summary Card */}
        <div className={styles.overallScoreCard}>
          <h4 className={styles.cardHeaderTitle}>Preparedness Score</h4>
          <div className={styles.overallScoreContainer}>
            <div className={styles.scoreWrap}>
              <span className={styles.overallScoreVal}>{analysis.atsScore}</span>
              <span className={styles.overallScoreMax}>/ 95</span>
            </div>
            <div className={`${styles.matchLevelBadge} ${matchLevel.class}`}>
              {matchLevel.text}
            </div>
          </div>
          <div className={styles.overallMeta}>
            <strong>Target Role:</strong> {analysis.targetRole}
          </div>
        </div>

        {/* Sub-Scores Panel (V2 Hybrid Scoring Metrics) */}
        <div className={styles.subScoresCard}>
          <h4 className={styles.panelTitle}>Career Preparedness Breakdown</h4>
          <div className={styles.subScoreList}>
            {subScores.map((sub, idx) => (
              <div key={idx} className={styles.subScoreItem}>
                <span className={styles.subScoreLabel}>{sub.label}</span>
                <div className={styles.progressBarContainer}>
                  <div
                    className={`${styles.progressBarFill} ${getScoreColorClass(sub.value)}`}
                    style={{ width: `${sub.value}%` }}
                  />
                </div>
                <span className={styles.subScoreVal}>{sub.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses & Next Actions Grid Cards */}
      <div className={styles.evaluationCardsGrid}>
        {/* Strengths Card */}
        <div className={`${styles.evalCard} ${styles.strengthsCard}`}>
          <div className={styles.evalCardHeader}>
            <CheckCircle2 size={20} className={styles.strengthsIcon} />
            <h4 className={styles.evalCardTitle}>Resume Strengths</h4>
          </div>
          <div className={styles.evalCardBody}>
            <ul className={styles.bullets}>
              {analysis.strengths && analysis.strengths.length > 0 ? (
                analysis.strengths.map((str, i) => <li key={i}>{str}</li>)
              ) : (
                <li>No specific strengths identified. Keep optimizing formatting and sections.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className={`${styles.evalCard} ${styles.weaknessesCard}`}>
          <div className={styles.evalCardHeader}>
            <AlertTriangle size={20} className={styles.weaknessesIcon} />
            <h4 className={styles.evalCardTitle}>Resume Weaknesses</h4>
          </div>
          <div className={styles.evalCardBody}>
            <ul className={styles.bullets}>
              {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)
              ) : (
                <li>No critical structural weaknesses found. Excellent alignment!</li>
              )}
            </ul>
          </div>
        </div>

        {/* Next Actions Card */}
        <div className={`${styles.evalCard} ${styles.nextActionsCard}`}>
          <div className={styles.evalCardHeader}>
            <TrendingUp size={20} className={styles.nextActionsIcon} />
            <h4 className={styles.evalCardTitle}>Specific Next Actions</h4>
          </div>
          <div className={styles.evalCardBody}>
            <ul className={styles.bullets}>
              {analysis.nextActions && analysis.nextActions.length > 0 ? (
                analysis.nextActions.map((act, i) => (
                  <li key={i}><strong>{act}</strong></li>
                ))
              ) : (
                <li>Your profile is highly optimized. Request final mock interviews from the AI Coach.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Detail Accordions */}
      <div className={styles.accordionList}>
        {/* Missing Skills (Categorized V2) */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("skills")}>
            <span className={styles.headerText}>
              <AlertTriangle size={18} color="var(--primary-color)" /> Missing Skills & Keywords
            </span>
            {activeAccordion === "skills" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeAccordion === "skills" && (
            <div className={styles.accordionBody}>
              <div className={styles.tagGroup}>
                <h5 className={styles.tagGroupTitle} style={{ color: "var(--error-color)" }}>Critical Missing Core Skills</h5>
                <div className={styles.tagContainer}>
                  {missingCore.map((s) => (
                    <span key={s} className={`${styles.tag} ${styles.tagSkill}`} style={{ color: "var(--error-color)", backgroundColor: "rgba(239, 68, 68, 0.08)" }}>
                      {s}
                    </span>
                  ))}
                  {missingCore.length === 0 && <span className={styles.noneText}>None missing! All core competencies listed.</span>}
                </div>
              </div>

              <div className={styles.tagGroup} style={{ marginTop: "16px" }}>
                <h5 className={styles.tagGroupTitle}>Important Secondary Skills</h5>
                <div className={styles.tagContainer}>
                  {missingSecondary.map((s) => (
                    <span key={s} className={`${styles.tag} ${styles.tagSkill}`}>
                      {s}
                    </span>
                  ))}
                  {missingSecondary.length === 0 && <span className={styles.noneText}>None missing! Good secondary alignment.</span>}
                </div>
              </div>

              <div className={styles.tagGroup} style={{ marginTop: "16px" }}>
                <h5 className={styles.tagGroupTitle}>Missing Tools & Keywords</h5>
                <div className={styles.tagContainer}>
                  {analysis.missingKeywords?.map((k) => (
                    <span key={k} className={`${styles.tag} ${styles.tagKeyword}`}>
                      {k}
                    </span>
                  ))}
                  {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                    <span className={styles.noneText}>None missing! Perfect keyword coverage.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skill Confidence Model (V2 Section) */}
        {analysis.skillConfidence && analysis.skillConfidence.length > 0 && (
          <div className={styles.accordion}>
            <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("confidence")}>
              <span className={styles.headerText}>
                <BrainCircuit size={18} color="var(--primary-color)" /> Skill Confidence Levels
              </span>
              {activeAccordion === "confidence" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeAccordion === "confidence" && (
              <div className={styles.accordionBody}>
                <div className={styles.confidenceGrid}>
                  {analysis.skillConfidence.map((item, idx) => (
                    <div key={idx} className={styles.confidenceCard}>
                      <span className={styles.confidenceSkill}>{item.skill}</span>
                      <span className={`${styles.confidenceBadge} ${styles["badge" + item.confidence]}`}>
                        {item.confidence} Confidence
                      </span>
                      <div className={styles.confidenceDetails}>
                        <span>On Resume: {item.onResume ? "Yes" : "No"}</span>
                        <span>Roadmap: {item.roadmapCompleted ? "Done" : "Pending"}</span>
                        {item.quizScore > 0 && <span>Quiz: {item.quizScore}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Priority Skills to Learn (V2 Section) */}
        {((analysis.skillsToLearn && analysis.skillsToLearn.length > 0) ||
          (analysis.keywordsToAdd && analysis.keywordsToAdd.length > 0)) && (
          <div className={styles.accordion}>
            <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("learn")}>
              <span className={styles.headerText}>
                <BookOpen size={18} color="var(--primary-color)" /> Skills to Learn & Keywords to Add
              </span>
              {activeAccordion === "learn" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeAccordion === "learn" && (
              <div className={styles.accordionBody}>
                {analysis.skillsToLearn && analysis.skillsToLearn.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h5 className={styles.tagGroupTitle}>Skills to Learn (Priority Order)</h5>
                    <ol className={styles.bullets} style={{ marginTop: "8px", paddingLeft: "20px" }}>
                      {analysis.skillsToLearn.map((s, i) => (
                        <li key={i}><strong>{s}</strong></li>
                      ))}
                    </ol>
                  </div>
                )}
                {analysis.keywordsToAdd && analysis.keywordsToAdd.length > 0 && (
                  <div>
                    <h5 className={styles.tagGroupTitle}>Keywords to Add (Recommended)</h5>
                    <div className={styles.tagContainer} style={{ marginTop: "8px" }}>
                      {analysis.keywordsToAdd.map((k, i) => (
                        <span key={i} className={`${styles.tag} ${styles.tagKeyword}`}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actionable Suggestions (Top Improvements V2) */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("tips")}>
            <span className={styles.headerText}>
              <Lightbulb size={18} color="#eab308" /> Top Actionable Suggestions
            </span>
            {activeAccordion === "tips" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeAccordion === "tips" && (
            <div className={styles.accordionBody}>
              <ul className={styles.bullets}>
                {analysis.improvementSuggestions?.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Recommended Actions */}
        <div className={styles.accordion}>
          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("recommendations")}>
            <span className={styles.headerText}>
              <Award size={18} color="var(--primary-color)" /> Recommended Projects & Certifications
            </span>
            {activeAccordion === "recommendations" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {activeAccordion === "recommendations" && (
            <div className={styles.accordionBody}>
              {analysis.recommendedProjects && analysis.recommendedProjects.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h5 className={styles.listTitle} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Briefcase size={14} /> Recommended Projects
                  </h5>
                  <div className={styles.recommendationGrid}>
                    {analysis.recommendedProjects.map((proj, i) => (
                      <div key={i} className={styles.recommendCard}>
                        <strong>{proj.title}</strong>
                        <p>{proj.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.recommendedCertifications && analysis.recommendedCertifications.length > 0 && (
                <div>
                  <h5 className={styles.listTitle} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Award size={14} /> Recommended Certifications
                  </h5>
                  <div className={styles.recommendationGrid}>
                    {analysis.recommendedCertifications.map((cert, i) => (
                      <div key={i} className={styles.recommendCard}>
                        <strong>{cert.name || cert.title}</strong>
                        <p>{cert.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <Button onClick={onReset} variant="secondary">
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
};

export default AnalysisResults;
