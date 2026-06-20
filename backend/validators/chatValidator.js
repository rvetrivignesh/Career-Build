import mongoose from "mongoose";

// Validate POST /message
export const validateSendMessage = (req, res, next) => {
  let { chatId, message } = req.body;
  const errors = [];

  // Validate message
  if (message === undefined || message === null) {
    errors.push("message is required");
  } else if (typeof message !== "string") {
    errors.push("message must be a string");
  } else {
    message = message.trim();
    if (message.length === 0) {
      errors.push("message cannot be empty");
    }
  }

  // Validate chatId (optional)
  if (chatId !== undefined && chatId !== null) {
    if (typeof chatId !== "string" || !mongoose.Types.ObjectId.isValid(chatId)) {
      errors.push("chatId must be a valid Mongoose ObjectId");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body.message = message;
  next();
};

// Validate PATCH /:chatId/title
export const validateRename = (req, res, next) => {
  let { title } = req.body;
  const { chatId } = req.params;

  const errors = [];

  // Validate chatId
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    errors.push("chatId parameter is required and must be a valid Mongoose ObjectId");
  }

  // Validate title
  if (title === undefined || title === null) {
    errors.push("title is required");
  } else if (typeof title !== "string") {
    errors.push("title must be a string");
  } else {
    title = title.trim();
    if (title.length === 0) {
      errors.push("title cannot be empty");
    } else if (title.length > 100) {
      errors.push("title cannot exceed 100 characters");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body.title = title;
  next();
};
