import React from "react";
import { Trash2, Calendar, Sparkles } from "lucide-react";
import styles from "./AnalysisHistory.module.css";

export const AnalysisHistory = ({ history = [], activeId, onSelect, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (history.length === 0) {
    return (
      <div className={styles.emptyHistory}>
        <p className={styles.emptyText}>No analysis history found.</p>
      </div>
    );
  }

  return (
    <div className={styles.historyList}>
      <h3 className={styles.sidebarTitle}>Recent Analyses</h3>
      <div className={styles.itemsWrapper}>
        {history.map((item) => {
          const isActive = item._id === activeId;
          return (
            <div
              key={item._id}
              className={`${styles.historyCard} ${isActive ? styles.activeCard : ""}`}
              onClick={() => onSelect(item._id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.roleTitle}>{item.targetRole}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this analysis from history?")) {
                      onDelete(item._id);
                    }
                  }}
                  className={styles.deleteBtn}
                  aria-label="Delete Analysis"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className={styles.fileName}>{item.originalFileName}</span>
              <div className={styles.cardFooter}>
                <span className={styles.date}>
                  <Calendar size={11} /> {formatDate(item.createdAt)}
                </span>
                <span className={styles.scoreBadge}>
                  <Sparkles size={11} /> {item.atsScore}% ATS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisHistory;
