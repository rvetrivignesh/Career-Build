import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import styles from "./ConnectionStatus.module.css";

export const ConnectionStatus = ({ connectionError, onRetry }) => {
  if (!connectionError) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <WifiOff size={16} className={styles.icon} />
        <span>Network connection issue detected. Please check your connection.</span>
      </div>
      <button type="button" onClick={onRetry} className={styles.retryBtn}>
        <RefreshCw size={14} />
        <span>Retry</span>
      </button>
    </div>
  );
};

export default ConnectionStatus;
