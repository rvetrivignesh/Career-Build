import React from "react";
import styles from "./RoadmapDashboard.module.css";
import { Award, CheckCircle2, AlertCircle, Percent, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Roadmap Dashboard component displaying progress indicators and stats summary cards
 */
export const RoadmapDashboard = ({ progress }) => {
  const totalSkills = progress?.skillScores?.length || 0;
  const completedSkills = progress?.completedSkills?.length || 0;
  const pendingSkills = progress?.remainingSkills?.length || 0;
  const averageScore = progress?.readinessScore || 0;

  const scores = progress?.skillScores?.map((s) => s.score) || [];
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  const stats = [
    {
      title: "Total Skills",
      value: totalSkills,
      icon: <Award size={20} color="var(--primary-color)" />,
      color: "rgba(107, 70, 193, 0.1)",
    },
    {
      title: "Completed Skills",
      value: completedSkills,
      icon: <CheckCircle2 size={20} color="#38A169" />,
      color: "rgba(56, 161, 105, 0.1)",
    },
    {
      title: "Pending Skills",
      value: pendingSkills,
      icon: <AlertCircle size={20} color="#DD6B20" />,
      color: "rgba(221, 107, 32, 0.1)",
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      icon: <Percent size={20} color="#3182CE" />,
      color: "rgba(49, 130, 206, 0.1)",
    },
    {
      title: "Highest Skill Score",
      value: `${highestScore}%`,
      icon: <TrendingUp size={20} color="#319795" />,
      color: "rgba(49, 151, 149, 0.1)",
    },
    {
      title: "Lowest Skill Score",
      value: `${lowestScore}%`,
      icon: <TrendingDown size={20} color="#E53E3E" />,
      color: "rgba(229, 62, 62, 0.1)",
    },
  ];

  const percentComplete = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  return (
    <div className={styles.dashboard}>
      {/* Overall Progress Tracker */}
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Overall Roadmap Progress</span>
          <span className={styles.progressValue}>
            {percentComplete}% Complete ({completedSkills}/{totalSkills} Skills)
          </span>
        </div>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: `${percentComplete}%` }} />
        </div>
      </div>

      {/* Stats Summary Cards Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statTitle}>{stat.title}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
            <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapDashboard;
