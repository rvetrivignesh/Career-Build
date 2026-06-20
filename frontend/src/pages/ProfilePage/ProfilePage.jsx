import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import Button from "@components/Button";
import {
  Edit,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Terminal,
} from "lucide-react";
import styles from "./ProfilePage.module.css";

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

export const ProfilePage = () => {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate("/profile-setup", { state: { edit: true } });
  };

  const getMonthAbbreviation = (m) => {
    if (!m) return "";
    return m.length > 3 ? m.substring(0, 3) : m;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Manage your professional background for Career-Build</p>
        </div>
        <Button onClick={handleEditClick} className={styles.editBtn}>
          <Edit size={16} />
          Edit Profile
        </Button>
      </header>

      {userProfile ? (
        <div className={styles.grid}>
          {/* Personal & Contact Details */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Personal Details</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{userProfile.fullName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Gender</span>
                <span className={styles.value}>{userProfile.gender}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Age</span>
                <span className={styles.value}>{userProfile.age} Years Old</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Location</span>
                <span className={styles.value} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  {userProfile.location}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Contact & Social Links</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email Address</span>
                <span className={styles.value} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={14} color="var(--text-muted)" />
                  {userProfile.user?.email || user?.email}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Mobile Number</span>
                <span className={styles.value} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color="var(--text-muted)" />
                  {userProfile.phone}
                </span>
              </div>
              <div className={styles.links}>
                {userProfile.linkedin && (
                  <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                    <Linkedin size={14} />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {userProfile.github && (
                  <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                    <Github size={14} />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {userProfile.portfolio && (
                  <a href={userProfile.portfolio} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                    <Globe size={14} />
                    <span>Portfolio Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Career Profile */}
          <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Career & Objectives</h3>
              <div className={styles.infoList}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Current Status</span>
                    <span className={styles.value}>{userProfile.currentStatus}</span>
                  </div>
                  {userProfile.currentRole && (
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Current Role</span>
                      <span className={styles.value}>{userProfile.currentRole}</span>
                    </div>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Target Roles</span>
                  <div className={styles.tagContainer}>
                    {userProfile.targetRoles?.map((role) => (
                      <span key={role} className={styles.tag}>{role}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Career Objective</span>
                  <span className={styles.value} style={{ fontStyle: "italic", lineHeight: "1.6", fontWeight: "400" }}>
                    "{userProfile.careerObjective}"
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Education timeline */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Education</h3>
            <div className={styles.timelineList}>
              {userProfile.education && userProfile.education.length > 0 ? (
                userProfile.education.map((edu, idx) => {
                  const startM = getMonthAbbreviation(edu.startMonth);
                  const endM = getMonthAbbreviation(edu.endMonth);
                  return (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineTitle}>{edu.degree} in {edu.branch}</span>
                        <span className={styles.timelineSubtitle} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} />
                          {startM} {edu.startYear} – {edu.currentlyStudying ? "Present" : `${endM} ${edu.endYear}`}
                        </span>
                      </div>
                      <span className={styles.timelineSubtitle}>{edu.institute}</span>
                      {edu.cgpa && <span className={styles.timelineSubtitle} style={{ color: "var(--primary-color)" }}>CGPA: {edu.cgpa}/10</span>}
                    </div>
                  );
                })
              ) : (
                <span className={styles.value}>No education details added.</span>
              )}
            </div>
          </div>

          {/* Experience timeline */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Experience</h3>
            <div className={styles.timelineList}>
              {userProfile.experience && userProfile.experience.length > 0 ? (
                userProfile.experience.map((exp, idx) => {
                  const startM = getMonthAbbreviation(exp.startMonth);
                  const endM = getMonthAbbreviation(exp.endMonth);
                  const isCurrent = exp.currentlyWorking || exp.isCurrentRole;
                  
                  // Calculate duration display
                  const getDurationTextLocal = (durMonths) => {
                    if (!durMonths) return "";
                    const yrs = Math.floor(durMonths / 12);
                    const mos = durMonths % 12;
                    let parts = [];
                    if (yrs > 0) parts.push(`${yrs} ${yrs === 1 ? "Yr" : "Yrs"}`);
                    if (mos > 0) parts.push(`${mos} ${mos === 1 ? "Mo" : "Mos"}`);
                    return parts.join(" ") || "1 Mo";
                  };

                  return (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineTitle}>{exp.role}</span>
                        <span className={styles.timelineSubtitle} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} />
                          {startM} {exp.startYear} – {isCurrent ? "Present" : `${endM} ${exp.endYear}`} {exp.duration ? `(${getDurationTextLocal(exp.duration)})` : ""}
                        </span>
                      </div>
                      <span className={styles.timelineSubtitle}>{exp.company} | {exp.employmentType}</span>
                      {exp.description && <p className={styles.timelineDesc}>{exp.description}</p>}
                    </div>
                  );
                })
              ) : (
                <span className={styles.value} style={{ color: "var(--text-muted)" }}>No experience details added.</span>
              )}
            </div>
          </div>

          {/* Projects (If any) */}
          {userProfile.projects && userProfile.projects.length > 0 && (
            <div className={styles.fullWidth}>
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Projects</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginTop: "12px" }}>
                  {userProfile.projects.map((proj, idx) => (
                    <div key={idx} style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "600", fontSize: "15px", color: "var(--text-color)" }}>{proj.title}</span>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)", fontSize: "13px", textDecoration: "none" }}>GitHub</a>}
                          {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)", fontSize: "13px", textDecoration: "none" }}>Live Demo</a>}
                        </div>
                      </div>
                      {proj.description && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px", lineHeight: "1.4" }}>{proj.description}</p>}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className={styles.tagContainer}>
                          {proj.technologies.map(tech => (
                            <span key={tech} className={styles.tag} style={{ fontSize: "11px", padding: "2px 8px" }}>{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certifications (If any) */}
          {userProfile.certifications && userProfile.certifications.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Certifications</h3>
              <div className={styles.timelineList} style={{ marginTop: "12px" }}>
                {userProfile.certifications.map((cert, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTitle}>{cert.title}</span>
                      {cert.issueDate && (
                        <span className={styles.timelineSubtitle}>
                          {new Date(cert.issueDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <span className={styles.timelineSubtitle}>{cert.issuer}</span>
                    {cert.credentialLink && (
                      <a href={cert.credentialLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--primary-color)", display: "inline-block", marginTop: "4px", textDecoration: "none" }}>
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills, Languages & Achievements */}
          <div className={`${userProfile.certifications && userProfile.certifications.length > 0 ? "" : styles.fullWidth}`}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Skills, Languages & Interests</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <span className={styles.label} style={{ marginBottom: "6px", display: "inline-block" }}>Core Skills</span>
                  <div className={styles.tagContainer}>
                    {userProfile.skills?.map((skill) => (
                      <span key={skill} className={styles.tag}>{skill}</span>
                    ))}
                  </div>
                </div>
                {userProfile.languages && userProfile.languages.length > 0 && (
                  <div>
                    <span className={styles.label} style={{ marginBottom: "6px", display: "inline-block" }}>Languages</span>
                    <div className={styles.tagContainer}>
                      {userProfile.languages.map((lang) => (
                        <span key={lang} className={styles.tag}>{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
                {userProfile.interests && userProfile.interests.length > 0 && (
                  <div>
                    <span className={styles.label} style={{ marginBottom: "6px", display: "inline-block" }}>Interests</span>
                    <div className={styles.tagContainer}>
                      {userProfile.interests.map((interest) => (
                        <span key={interest} className={styles.tag}>{interest}</span>
                      ))}
                    </div>
                  </div>
                )}
                {userProfile.achievements && userProfile.achievements.length > 0 && (
                  <div>
                    <span className={styles.label} style={{ marginBottom: "6px", display: "inline-block" }}>Achievements</span>
                    <ul style={{ listStyle: "disc", paddingLeft: "20px", fontSize: "14px", color: "var(--text-color)" }}>
                      {userProfile.achievements.map((ach, idx) => (
                        <li key={idx} style={{ marginBottom: "4px" }}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", border: "1px solid var(--border-color)", borderRadius: "10px", backgroundColor: "var(--card-bg)" }}>
          <h3 className={styles.value}>You haven't completed onboarding setup yet.</h3>
          <Button onClick={() => navigate("/profile-setup")} style={{ marginTop: "16px" }}>
            Start Profile Setup
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
