import React from "react";
import styles from "./Loader.module.css";

export const PageLoader = ({ text = "Loading..." }) => {
  return (
    <div className={styles.pageLoader} role="alert" aria-busy="true">
      <div className={styles.spinner} />
      <span className={styles.text}>{text}</span>
    </div>
  );
};

export const Skeleton = ({ height = "20px", width = "100%", style = {} }) => {
  return (
    <div
      className={styles.skeleton}
      style={{
        height,
        width,
        ...style,
      }}
    />
  );
};

export default PageLoader;
