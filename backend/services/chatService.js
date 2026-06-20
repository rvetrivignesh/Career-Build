import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import * as coachService from "./coachService.js";

// In-memory duplicate submit cache
const duplicateSentMap = new Map();

/**
 * Core business service for Career AI Coach Chat Management
 */

export const sendMessage = async (userId, chatId, messageText) => {
  const cleanMessage = messageText.trim();
  if (cleanMessage.length === 0) {
    const error = new Error("Message content cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Accidental Duplicate Submission Check (within 5 seconds)
  const duplicateKey = `${userId}:${chatId || "new"}:${cleanMessage}`;
  const now = Date.now();
  const lastSentTime = duplicateSentMap.get(duplicateKey);
  if (lastSentTime && now - lastSentTime < 5000) {
    const error = new Error("Duplicate message detected. Please wait 5 seconds before re-submitting.");
    error.statusCode = 409; // Conflict / Duplicate
    throw error;
  }
  // Record current send timestamp
  duplicateSentMap.set(duplicateKey, now);

  // 2. If existing chat, verify ownership and state
  let existingChat = null;
  if (chatId) {
    existingChat = await Chat.findOne({
      _id: chatId,
      user: userId,
      isArchived: false,
    });

    if (!existingChat) {
      const error = new Error("Chat session not found or has been archived.");
      error.statusCode = 404;
      throw error;
    }
  }

  // 3. Request Gemini response (Empty Chat Prevention: call API BEFORE creating DB documents)
  const aiResponseText = await coachService.getAIResponse(userId, chatId, cleanMessage);

  // 4. Gemini succeeded: persist documents
  let chat = existingChat;
  if (!chat) {
    // Generate chat title locally from first message (max 50 chars)
    let localTitle = cleanMessage.split("\n")[0].slice(0, 50).trim();
    if (localTitle.length === 50) {
      localTitle += "...";
    }

    chat = new Chat({
      user: userId,
      title: localTitle,
      lastMessage: cleanMessage,
      messageCount: 2,
    });
    await chat.save();
  } else {
    chat.lastMessage = cleanMessage;
    chat.messageCount += 2;
    await chat.save();
  }

  // Save user message
  const userMessage = new Message({
    chat: chat._id,
    role: "user",
    content: cleanMessage,
    tokenCount: Math.ceil(cleanMessage.length / 4),
  });
  await userMessage.save();

  // Save assistant message
  const assistantMessage = new Message({
    chat: chat._id,
    role: "assistant",
    content: aiResponseText,
    tokenCount: Math.ceil(aiResponseText.length / 4),
  });
  await assistantMessage.save();

  return {
    chat: chat.toObject(),
    responseMessage: assistantMessage.toObject(),
  };
};

export const getChatHistory = async (userId) => {
  return await Chat.find({
    user: userId,
    isArchived: false,
  })
    .sort({ updatedAt: -1 })
    .select("_id title lastMessage messageCount updatedAt")
    .lean();
};

export const getChatMessages = async (userId, chatId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    user: userId,
    isArchived: false,
  }).lean();

  if (!chat) {
    const error = new Error("Chat session not found or has been archived.");
    error.statusCode = 404;
    throw error;
  }

  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: 1 })
    .lean();

  return messages;
};

export const deleteChat = async (userId, chatId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    user: userId,
  });

  if (!chat) {
    const error = new Error("Chat session not found.");
    error.statusCode = 404;
    throw error;
  }

  // Soft delete by archiving
  chat.isArchived = true;
  await chat.save();

  return chat.toObject();
};

export const renameChat = async (userId, chatId, title) => {
  const chat = await Chat.findOne({
    _id: chatId,
    user: userId,
    isArchived: false,
  });

  if (!chat) {
    const error = new Error("Chat session not found or has been archived.");
    error.statusCode = 404;
    throw error;
  }

  chat.title = title.trim();
  await chat.save();

  return chat.toObject();
};
