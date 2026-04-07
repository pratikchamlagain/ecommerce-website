import apiClient from "./apiClient";

export async function fetchAdminOverview() {
  const response = await apiClient.get("/admin/overview");
  return response.data.data;
}

export async function fetchAdminSellers() {
  const response = await apiClient.get("/admin/sellers");
  return response.data.data;
}

export async function updateSellerStatus(sellerId, isActive) {
  const response = await apiClient.patch(`/admin/sellers/${sellerId}/status`, { isActive });
  return response.data.data;
}
