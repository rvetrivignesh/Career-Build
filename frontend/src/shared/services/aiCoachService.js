const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getChatHistory = async (token) => {
  const response = await fetch(`${API_URL}/api/chat/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch chat history");
  }
  return data.data;
};

export const getChatMessages = async (chatId, token) => {
  const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to fetch chat messages");
  }
  return data.data;
};

export const sendMessage = async (chatId, message, token) => {
  const response = await fetch(`${API_URL}/api/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ chatId: chatId || null, message }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to send message");
  }
  return data; // returns success, message, chat, responseMessage, data
};

export const deleteChat = async (chatId, token) => {
  const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to delete chat");
  }
  return data;
};

export const renameChat = async (chatId, title, token) => {
  const response = await fetch(`${API_URL}/api/chat/${chatId}/title`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0] || "Failed to rename chat");
  }
  return data.chat || data.data;
};
