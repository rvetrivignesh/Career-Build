import React, { useEffect, useRef } from "react";
import MessageBubble from "../MessageBubble";
import TypingIndicator from "../TypingIndicator";
import styles from "./MessageList.module.css";

export const MessageList = ({ messages = [], sending, error, onRetry }) => {
  const containerRef = useRef(null);

  const scrollToBottom = (force = false) => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    
    if (force || isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Scroll to bottom on new messages or loading state transitions
  useEffect(() => {
    scrollToBottom(messages.length <= 2);
  }, [messages, sending]);

  return (
    <div ref={containerRef} className={styles.container}>
      {messages.map((msg, index) => {
        const isLast = index === messages.length - 1;
        return (
          <MessageBubble
            key={msg._id || index}
            message={msg}
            isLast={isLast}
            error={error}
            onRetry={onRetry}
          />
        );
      })}
      
      {sending && <TypingIndicator />}
    </div>
  );
};

export default MessageList;
