import React from "react";
import { BookOpen, Compass, Award, Target, FileText, HelpCircle } from "lucide-react";
import styles from "./PromptSuggestions.module.css";

export const PromptSuggestions = ({ onSelectSuggestion }) => {
  const suggestions = [
    {
      text: "Create a 30-day study plan for my target role",
      icon: <BookOpen size={18} />,
      label: "Study Plan"
    },
    {
      text: "Review my learning roadmap",
      icon: <Compass size={18} />,
      label: "Roadmap"
    },
    {
      text: "Help me prepare for interviews",
      icon: <Award size={18} />,
      label: "Interview Prep"
    },
    {
      text: "What skills should I focus on next?",
      icon: <Target size={18} />,
      label: "Skill Guidance"
    },
    {
      text: "Improve my resume",
      icon: <FileText size={18} />,
      label: "Resume Review"
    },
    {
      text: "Explain a roadmap skill in detail",
      icon: <HelpCircle size={18} />,
      label: "Concept Explain"
    }
  ];

  return (
    <div className={styles.grid}>
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectSuggestion(s.text)}
          className={styles.card}
        >
          <div className={styles.iconWrapper}>{s.icon}</div>
          <div className={styles.cardText}>
            <span className={styles.label}>{s.label}</span>
            <p className={styles.text}>{s.text}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PromptSuggestions;
