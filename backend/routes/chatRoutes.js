import express from "express";
import protect from "../middleware/auth.js";
import checkProfileCompletion from "../middleware/checkProfileCompletion.js";
import { chatRateLimiter } from "../middleware/chatRateLimiter.js";
import { validateSendMessage, validateRename } from "../validators/chatValidator.js";
import {
  sendMessage,
  getChatHistory,
  getChatMessages,
  deleteChat,
  renameChat,
} from "../controllers/chatController.js";

const router = express.Router();

// Enforce auth protection and profile completion checks on all endpoints
router.use(protect);
router.use(checkProfileCompletion);

// Endpoints
router.post("/message", chatRateLimiter, validateSendMessage, sendMessage);
router.get("/history", getChatHistory);
router.get("/:chatId", getChatMessages);
router.delete("/:chatId", deleteChat);
router.patch("/:chatId/title", validateRename, renameChat);

export default router;
