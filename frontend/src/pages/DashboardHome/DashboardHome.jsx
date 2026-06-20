import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { Sparkles, FileText, Compass } from "lucide-react";
import styles from "./DashboardHome.module.css";

export const DashboardHome = () => {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const userName = userProfile?.fullName || user?.username || "Developer";

  const statusCards = [
    {
      title: "Resume Readiness",
      description: "Build and analyze your master resume to match target job descriptions.",
      actionText: "Analyze Resume",
      path: "/dashboard/resume-analyzer",
      icon: <FileText size={20} color="var(--primary-color)" />,
    },
    {
      title: "Career Roadmaps",
      description: "Follow customized curriculum targets, take skill quizzes, and track your learning progress.",
      actionText: "View Roadmaps",
      path: "/dashboard/career-roadmaps",
      icon: <Compass size={20} color="var(--primary-color)" />,
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.welcomeHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h1 className={styles.welcomeTitle}>Welcome, {userName}</h1>
          <Sparkles size={24} color="var(--primary-color)" className={styles.pulseIcon} />
        </div>
        <p className={styles.welcomeSubtitle}>Your Career Journey Starts Here.</p>
      </header>

      {/* Quick Summary Section */}
      <section className={styles.dashboardGrid}>
        {statusCards.map((card) => (
          <div key={card.title} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>{card.icon}</div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
            </div>
            <p className={styles.cardDesc}>{card.description}</p>
            <button
              type="button"
              className={styles.cardBtn}
              onClick={() => navigate(card.path)}
            >
              {card.actionText}
            </button>
          </div>
        ))}
      </section>

      {/* Profile Overview Card */}
      <section className={styles.profileOverview}>
        <h3 className={styles.sectionTitle}>Profile Summary</h3>
        <div className={styles.profileGrid}>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Current Status</span>
            <span className={styles.profileValue}>{userProfile?.currentStatus || "Fresher"}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Target Roles</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {userProfile?.targetRoles?.map((role) => (
                <span key={role} className={styles.tag}>
                  {role}
                </span>
              )) || <span className={styles.profileValue}>Not set</span>}
            </div>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Preferred Location</span>
            <span className={styles.profileValue}>{userProfile?.location || "Not specified"}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
