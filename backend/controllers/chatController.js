import * as chatService from "../services/chatService.js";

// POST /message
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, message } = req.body;
    const isNewChat = !chatId;

    const result = await chatService.sendMessage(req.user._id, chatId, message);

    res.status(isNewChat ? 201 : 200).json({
      success: true,
      message: isNewChat ? "Chat session started successfully" : "Message sent successfully",
      chat: result.chat,
      responseMessage: result.responseMessage,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /history
export const getChatHistory = async (req, res, next) => {
  try {
    const history = await chatService.getChatHistory(req.user._id);

    res.status(200).json({
      success: true,
      message: "Chat history retrieved successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// GET /:chatId
export const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await chatService.getChatMessages(req.user._id, chatId);

    res.status(200).json({
      success: true,
      message: "Chat messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /:chatId
export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    await chatService.deleteChat(req.user._id, chatId);

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /:chatId/title
export const renameChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await chatService.renameChat(req.user._id, chatId, title);

    res.status(200).json({
      success: true,
      message: "Chat title updated successfully",
      chat,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};
