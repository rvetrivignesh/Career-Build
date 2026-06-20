import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import styles from "./ChatInput.module.css";

export const ChatInput = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea heights
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (cleanText && !disabled) {
      onSendMessage(cleanText);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    // Send message on Enter key (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI Coach a question..."
          rows={1}
          disabled={disabled}
          className={styles.textarea}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className={styles.sendBtn}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
      <span className={styles.hint}>
        Press Enter to send. Shift + Enter for new line.
      </span>
    </form>
  );
};

export default ChatInput;
