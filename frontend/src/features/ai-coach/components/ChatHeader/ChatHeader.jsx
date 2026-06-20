import React from "react";
import { Menu, Edit2, Trash2 } from "lucide-react";
import styles from "./ChatHeader.module.css";

export const ChatHeader = ({ chatTitle, isUnsaved, onMenuClick, onRenameClick, onDeleteClick }) => {
  return (
    <header className={styles.header}>
      {/* Mobile Hamburger menu toggle */}
      <button
        type="button"
        onClick={onMenuClick}
        className={styles.menuBtn}
        aria-label="Open chat history sidebar"
      >
        <Menu size={20} />
      </button>

      <div className={styles.titleInfo}>
        <h1 className={styles.title}>{chatTitle || "New Conversation"}</h1>
        {isUnsaved && <span className={styles.badge}>Unsaved</span>}
      </div>

      {!isUnsaved && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onRenameClick}
            className={styles.actionBtn}
            title="Rename Chat"
            aria-label="Rename Chat"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={onDeleteClick}
            className={styles.actionBtn}
            title="Delete Chat"
            aria-label="Delete Chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
