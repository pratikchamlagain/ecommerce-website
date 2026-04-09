import apiClient from "./apiClient";

export async function fetchMyConversations() {
  const response = await apiClient.get("/chat/conversations");
  return response.data.data;
}

export async function createConversation(payload) {
  const response = await apiClient.post("/chat/conversations", payload);
  return response.data.data;
}

export async function fetchConversationMessages(conversationId, params = {}) {
  const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, { params });
  return response.data.data;
}

export async function sendConversationMessage(conversationId, content) {
  const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { content });
  return response.data.data;
}

export async function markConversationRead(conversationId) {
  const response = await apiClient.patch(`/chat/conversations/${conversationId}/read`);
  return response.data.data;
}
