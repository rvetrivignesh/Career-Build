import React from "react";
import { User, GraduationCap, AlertCircle, RefreshCw } from "lucide-react";
import styles from "./MessageBubble.module.css";

const parseMarkdown = (text) => {
  if (!text) return "";
  
  // 1. Escaping HTML characters for safety
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Code blocks: ```language ... ```
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="${styles.codeBlock}"><code>${code.trim()}</code></pre>`;
  });

  // 3. Inline code: `code`
  html = html.replace(/`([^`]+)`/g, `<code class="${styles.inlineCode}">$1</code>`);

  // 4. Bold: **text**
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");

  // 5. Italic: *text* or _text_
  html = html.replace(/\*([\s\S]+?)\*/g, "<em>$1</em>");
  html = html.replace(/_([\s\S]+?)_/g, "<em>$1</em>");

  // 6. Split by lines to parse lists and paragraphs
  const lines = html.split("\n");
  let inList = false;
  let listType = ""; // 'ul' or 'ol'
  let resultLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    let line = rawLine.trim();

    // Handle list items
    const ulMatch = line.match(/^[\*\-\+]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);

    if (ulMatch) {
      if (!inList || listType !== "ul") {
        if (inList) resultLines.push(`</${listType}>`);
        resultLines.push(`<ul class="${styles.list}">`);
        inList = true;
        listType = "ul";
      }
      resultLines.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inList || listType !== "ol") {
        if (inList) resultLines.push(`</${listType}>`);
        resultLines.push(`<ol class="${styles.list}">`);
        inList = true;
        listType = "ol";
      }
      resultLines.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inList) {
        resultLines.push(`</${listType}>`);
        inList = false;
        listType = "";
      }

      if (line === "") {
        // Skip consecutive empty lines
        if (resultLines[resultLines.length - 1] !== "<br />") {
          resultLines.push("<br />");
        }
      } else if (rawLine.includes(`<pre class="`)) {
        // Pre-formatted code blocks
        resultLines.push(rawLine);
      } else {
        resultLines.push(`<p class="${styles.paragraph}">${line}</p>`);
      }
    }
  }

  if (inList) {
    resultLines.push(`</${listType}>`);
  }

  return resultLines.join("\n");
};

export const MessageBubble = ({ message, isLast, error, onRetry }) => {
  const isUser = message.role === "user";

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}>
      <div className={styles.avatar}>
        {isUser ? <User size={16} /> : <GraduationCap size={16} />}
      </div>
      <div className={styles.bubble}>
        {isUser ? (
          <p className={styles.text}>{message.content}</p>
        ) : (
          <div
            className={styles.formattedText}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
          />
        )}

        {/* Failed Delivery & Retry System (Case 5, Rule 11) */}
        {!isUser && isLast && error && (
          <div className={styles.errorBox}>
            <div className={styles.errorContent}>
              <AlertCircle size={14} className={styles.errorIcon} />
              <span>Failed to load AI response.</span>
            </div>
            {onRetry && (
              <button type="button" onClick={onRetry} className={styles.retryBtn}>
                <RefreshCw size={12} />
                <span>Retry Response</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
