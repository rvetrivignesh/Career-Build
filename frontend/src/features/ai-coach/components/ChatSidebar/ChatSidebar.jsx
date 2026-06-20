import React from "react";
import { Plus, Search, X } from "lucide-react";
import ConversationList from "../ConversationList";
import styles from "./ChatSidebar.module.css";

export const ChatSidebar = ({
  conversations = [],
  activeChatId,
  searchQuery,
  setSearchQuery,
  onSelectChat,
  onNewChat,
  onRenameClick,
  onDeleteClick,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile Sidebar Overlay/Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <button type="button" onClick={onNewChat} className={styles.newChatBtn}>
            <Plus size={16} />
            <span>New Chat</span>
          </button>
          
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Search Panel */}
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className={styles.searchInput}
          />
        </div>

        {/* Conversations Scroll area */}
        <div className={styles.listWrapper}>
          <ConversationList
            conversations={conversations}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              onSelectChat(id);
              if (onClose) onClose(); // Auto-close drawer on mobile on select
            }}
            onRenameClick={onRenameClick}
            onDeleteClick={onDeleteClick}
          />
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
