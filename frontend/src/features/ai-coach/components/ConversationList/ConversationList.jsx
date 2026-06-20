import React from "react";
import ConversationItem from "../ConversationItem";
import styles from "./ConversationList.module.css";

export const ConversationList = ({ conversations = [], activeChatId, onSelectChat, onRenameClick, onDeleteClick }) => {
  if (conversations.length === 0) {
    return (
      <div className={styles.empty}>
        <span>No chats found</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {conversations.map((chat) => (
        <ConversationItem
          key={chat._id}
          chat={chat}
          isActive={activeChatId === chat._id}
          onSelect={() => onSelectChat(chat._id)}
          onRenameClick={onRenameClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};

export default ConversationList;
