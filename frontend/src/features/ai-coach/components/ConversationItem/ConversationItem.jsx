import React from "react";
import { MessageSquare, Edit2, Trash2 } from "lucide-react";
import styles from "./ConversationItem.module.css";

export const ConversationItem = ({ chat, isActive, onSelect, onRenameClick, onDeleteClick }) => {
  const handleRename = (e) => {
    e.stopPropagation();
    onRenameClick(chat);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteClick(chat);
  };

  return (
    <div
      onClick={onSelect}
      className={`${styles.container} ${isActive ? styles.active : ""}`}
    >
      <MessageSquare size={16} className={styles.icon} />
      <div className={styles.details}>
        <span className={styles.title}>{chat.title || "New Conversation"}</span>
        {chat.lastMessage && (
          <span className={styles.preview}>{chat.lastMessage}</span>
        )}
      </div>

      {chat._id !== "temp" && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleRename}
            className={styles.actionBtn}
            title="Rename Chat"
            aria-label="Rename Chat"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={styles.actionBtn}
            title="Delete Chat"
            aria-label="Delete Chat"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
