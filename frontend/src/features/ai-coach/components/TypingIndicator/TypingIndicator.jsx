import React from "react";
import styles from "./TypingIndicator.module.css";

export const TypingIndicator = () => {
  return (
    <div className={styles.container}>
      <div className={styles.bubble}>
        <div className={styles.text}>AI Coach is thinking</div>
        <div className={styles.dots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
