import React from "react";
import { GraduationCap } from "lucide-react";
import PromptSuggestions from "../PromptSuggestions";
import styles from "./ChatEmptyState.module.css";

export const ChatEmptyState = ({ onSelectSuggestion }) => {
  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <div className={styles.iconCircle}>
          <GraduationCap size={36} />
        </div>
        <h2 className={styles.title}>AI Career Coach</h2>
        <p className={styles.subtitle}>
          Ask questions about study plans, roadmap progression, interview preparation, resume reviews, or technical concepts. I am here to help guide your career path!
        </p>
      </div>

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Get Started with a Suggestion</span>
        <div className={styles.line} />
      </div>

      <PromptSuggestions onSelectSuggestion={onSelectSuggestion} />
    </div>
  );
};

export default ChatEmptyState;
