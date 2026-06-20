import React, { useState } from "react";
import useAICoach from "../../hooks/useAICoach";
import ChatSidebar from "../../components/ChatSidebar";
import ChatHeader from "../../components/ChatHeader";
import MessageList from "../../components/MessageList";
import ChatInput from "../../components/ChatInput";
import ChatEmptyState from "../../components/ChatEmptyState";
import ConnectionStatus from "../../components/ConnectionStatus";
import RenameConversationModal from "../../components/RenameConversationModal";
import DeleteConversationModal from "../../components/DeleteConversationModal";
import styles from "./AICoachPage.module.css";

export const AICoachPage = () => {
  const {
    conversations,
    activeChatId,
    activeChatMessages,
    loading,
    sending,
    error,
    connectionError,
    searchQuery,
    setSearchQuery,
    selectChat,
    startNewChat,
    sendMessageText,
    retryResponse,
    deleteConversation,
    renameConversation,
  } = useAICoach();

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal active targets
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeChat = conversations.find((c) => c._id === activeChatId);
  const activeTitle = activeChatId === "temp" ? "New Conversation" : activeChat?.title || "AI Career Coach";

  const handleSelectSuggestion = (suggestionText) => {
    sendMessageText(suggestionText);
  };

  const handleRenameConfirm = async (newTitle) => {
    if (renameTarget) {
      await renameConversation(renameTarget._id, newTitle);
      setRenameTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteConversation(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  const handleRetry = () => {
    retryResponse();
  };

  return (
    <div className={styles.wrapper}>
      {/* Network Alert (Edge Case 8) */}
      <ConnectionStatus connectionError={connectionError} onRetry={handleRetry} />

      <div className={styles.layout}>
        {/* Chat History Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeChatId={activeChatId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectChat={selectChat}
          onNewChat={startNewChat}
          onRenameClick={setRenameTarget}
          onDeleteClick={setDeleteTarget}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Chat Area Container */}
        <div className={styles.chatArea}>
          <ChatHeader
            chatTitle={activeTitle}
            isUnsaved={activeChatId === "temp"}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            onRenameClick={() => setRenameTarget(activeChat)}
            onDeleteClick={() => setDeleteTarget(activeChat)}
          />

          <div className={styles.messageListContainer}>
            {loading ? (
              <div className={styles.loader}>
                <div className={styles.spinner} />
                <span>Loading messages...</span>
              </div>
            ) : activeChatMessages.length === 0 ? (
              <ChatEmptyState onSelectSuggestion={handleSelectSuggestion} />
            ) : (
              <MessageList
                messages={activeChatMessages}
                sending={sending}
                error={error}
                onRetry={handleRetry}
              />
            )}
          </div>

          <div className={styles.inputContainer}>
            <ChatInput onSendMessage={sendMessageText} disabled={sending} />
          </div>
        </div>
      </div>

      {/* Rename Dialog Modal */}
      {renameTarget && (
        <RenameConversationModal
          isOpen={!!renameTarget}
          initialTitle={renameTarget.title}
          onClose={() => setRenameTarget(null)}
          onConfirm={handleRenameConfirm}
        />
      )}

      {/* Delete Dialog Confirmation Modal */}
      {deleteTarget && (
        <DeleteConversationModal
          isOpen={!!deleteTarget}
          chatTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default AICoachPage;
