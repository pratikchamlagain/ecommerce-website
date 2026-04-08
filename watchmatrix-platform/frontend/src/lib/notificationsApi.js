import apiClient from "./apiClient";

export async function fetchMyNotifications() {
  const response = await apiClient.get("/notifications");
  return response.data.data;
}

export async function markNotificationRead(notificationId) {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data.data;
}
