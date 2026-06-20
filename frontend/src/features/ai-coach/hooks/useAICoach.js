import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@contexts/AuthContext";
import * as aiCoachService from "@services/aiCoachService";
import { useToast } from "@contexts/ToastContext";

export const useAICoach = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatMessages, setActiveChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Error and connection states
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  // Track if we have a temporary unsaved chat active
  const [hasTempChat, setHasTempChat] = useState(false);

  // Ref to prevent double submissions or stale closures
  const sendingRef = useRef(false);

  // 1. Fetch conversations history
  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      setConnectionError(false);
      const history = await aiCoachService.getChatHistory(token);
      setConversations(history || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      if (err.message?.includes("Failed to fetch") || !navigator.onLine) {
        setConnectionError(true);
      }
      setError("Unable to load chat history.");
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 2. Select a conversation
  const selectChat = useCallback(async (chatId) => {
    if (chatId === "temp") {
      setActiveChatId("temp");
      setActiveChatMessages([]);
      return;
    }

    if (!token) return;
    setLoading(true);
    setError(null);
    setConnectionError(false);
    try {
      const messages = await aiCoachService.getChatMessages(chatId, token);
      setActiveChatId(chatId);
      setActiveChatMessages(messages || []);
      // If we switch to a saved chat, clean up any temp chat state
      setHasTempChat(false);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
      setError("Failed to load conversation messages.");
      showToast("Could not load messages", "error");
      if (err.message?.includes("Failed to fetch") || !navigator.onLine) {
        setConnectionError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // 3. New Chat Workflow (Rule 1, 2, 3, 4)
  const startNewChat = useCallback(() => {
    // Rule 3 & 4: If an unsaved chat already exists, simply focus that existing chat
    if (hasTempChat || activeChatId === "temp") {
      setActiveChatId("temp");
      setActiveChatMessages([]);
      return;
    }
    setHasTempChat(true);
    setActiveChatId("temp");
    setActiveChatMessages([]);
  }, [hasTempChat, activeChatId]);

  // If no conversations exist and we are done loading, initialize a temp chat automatically
  useEffect(() => {
    if (!loading && conversations.length === 0 && !hasTempChat && activeChatId === null) {
      startNewChat();
    }
  }, [conversations, loading, hasTempChat, activeChatId, startNewChat]);

  // 4. Send Message Flow
  const sendMessageText = useCallback(async (text) => {
    const cleanText = text?.trim();
    if (!cleanText) return; // Prevent empty/whitespace submission (Rule 6, 7)

    if (sendingRef.current) return; // Prevent duplicate requests/spam (Rule 9)
    sendingRef.current = true;
    setSending(true);
    setError(null);
    setConnectionError(false);

    // Optimistically add user message to list
    const tempUserMessage = {
      _id: `user-temp-${Date.now()}`,
      role: "user",
      content: cleanText,
      createdAt: new Date().toISOString()
    };
    setActiveChatMessages((prev) => [...prev, tempUserMessage]);

    const isNew = activeChatId === "temp";
    const serviceChatId = isNew ? null : activeChatId;

    try {
      const response = await aiCoachService.sendMessage(serviceChatId, cleanText, token);
      
      // Update states on success
      const newChat = response.chat;
      const assistantMsg = response.responseMessage;

      if (isNew) {
        // First successful message: persist conversation (Rule 5)
        setConversations((prev) => [newChat, ...prev]);
        setActiveChatId(newChat._id);
        setActiveChatMessages([
          { ...tempUserMessage, _id: response.data?.userMessage?._id || `user-${Date.now()}` },
          assistantMsg
        ]);
        setHasTempChat(false);
      } else {
        // Existing chat: append assistant message
        setActiveChatMessages((prev) => {
          // Remove the temporary user message and replace with persisted one if available
          const filtered = prev.filter(m => m._id !== tempUserMessage._id);
          return [...filtered, tempUserMessage, assistantMsg];
        });
        
        // Update history sidebar
        setConversations((prev) =>
          prev.map((c) => (c._id === newChat._id ? newChat : c)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to get response from AI coach.");
      showToast(err.message || "Message delivery failed", "error");
      if (err.message?.includes("Failed to fetch") || !navigator.onLine) {
        setConnectionError(true);
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [activeChatId, token, showToast]);

  // 5. Retry last response if it failed
  const retryResponse = useCallback(async () => {
    // Find last user message
    const lastUserMsg = [...activeChatMessages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError(null);
    setConnectionError(false);

    const isNew = activeChatId === "temp";
    const serviceChatId = isNew ? null : activeChatId;

    try {
      const response = await aiCoachService.sendMessage(serviceChatId, lastUserMsg.content, token);
      
      const newChat = response.chat;
      const assistantMsg = response.responseMessage;

      if (isNew) {
        setConversations((prev) => [newChat, ...prev]);
        setActiveChatId(newChat._id);
        setActiveChatMessages([
          { ...lastUserMsg, _id: response.data?.userMessage?._id || `user-${Date.now()}` },
          assistantMsg
        ]);
        setHasTempChat(false);
      } else {
        setActiveChatMessages((prev) => [...prev, assistantMsg]);
        setConversations((prev) =>
          prev.map((c) => (c._id === newChat._id ? newChat : c)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      }
    } catch (err) {
      console.error("Failed to retry message:", err);
      setError(err.message || "Retry attempt failed.");
      showToast(err.message || "Retry failed", "error");
      if (err.message?.includes("Failed to fetch") || !navigator.onLine) {
        setConnectionError(true);
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [activeChatMessages, activeChatId, token, showToast]);

  // 6. Delete conversation
  const deleteConversation = useCallback(async (chatId) => {
    if (!token) return;
    try {
      await aiCoachService.deleteChat(chatId, token);
      setConversations((prev) => prev.filter((c) => c._id !== chatId));
      showToast("Chat deleted successfully", "success");
      
      // Rule 10: If active chat is deleted, navigate to new temp state
      if (activeChatId === chatId) {
        startNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      showToast("Failed to delete chat", "error");
    }
  }, [token, activeChatId, startNewChat, showToast]);

  // 7. Rename conversation
  const renameConversation = useCallback(async (chatId, title) => {
    if (!token) return;
    const cleanTitle = title?.trim();
    if (!cleanTitle) return;
    try {
      const updated = await aiCoachService.renameChat(chatId, cleanTitle, token);
      setConversations((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, title: updated.title } : c))
      );
      showToast("Chat renamed successfully", "success");
    } catch (err) {
      console.error("Failed to rename chat:", err);
      showToast("Failed to rename chat", "error");
    }
  }, [token, showToast]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return {
    conversations: filteredConversations,
    allConversationsCount: conversations.length,
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
    refreshHistory: loadHistory,
  };
};

export default useAICoach;
