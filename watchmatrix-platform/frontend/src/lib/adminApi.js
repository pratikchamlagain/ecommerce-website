import apiClient from "./apiClient";

export async function fetchAdminOverview() {
  const response = await apiClient.get("/admin/overview");
  return response.data.data;
}

export async function fetchAdminSellers(params = {}) {
  const response = await apiClient.get("/admin/sellers", { params });
  return response.data.data;
}

export async function updateSellerStatus(sellerId, isActive) {
  const response = await apiClient.patch(`/admin/sellers/${sellerId}/status`, { isActive });
  return response.data.data;
}

export async function fetchAdminAuditLogs(params = {}) {
  const response = await apiClient.get("/admin/audit-logs", { params });
  return response.data.data;
}

export async function fetchAdminOrders(params = {}) {
  const response = await apiClient.get("/admin/orders", { params });
  return response.data.data;
}

export async function updateAdminOrderStatus(orderId, status) {
  const response = await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
  return response.data.data;
}

export async function fetchAdminOrderById(orderId) {
  const response = await apiClient.get(`/admin/orders/${orderId}`);
  return response.data.data;
}

export async function fetchAdminChatEscalations(params = {}) {
  const response = await apiClient.get("/chat/escalations", { params });
  return response.data.data;
}
