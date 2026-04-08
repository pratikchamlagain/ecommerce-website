import apiClient from "./apiClient";

export async function fetchSellerProducts() {
  const response = await apiClient.get("/seller/products");
  return response.data.data;
}

export async function fetchSellerCategories() {
  const response = await apiClient.get("/seller/categories");
  return response.data.data;
}

export async function createSellerProduct(payload) {
  const response = await apiClient.post("/seller/products", payload);
  return response.data.data;
}

export async function updateSellerProduct(productId, payload) {
  const response = await apiClient.patch(`/seller/products/${productId}`, payload);
  return response.data.data;
}

export async function deleteSellerProduct(productId) {
  const response = await apiClient.delete(`/seller/products/${productId}`);
  return response.data;
}

export async function fetchSellerOrderItems(params = {}) {
  const response = await apiClient.get("/orders/seller/items", { params });
  return response.data.data;
}

export async function updateSellerOrderItemStatus(itemId, sellerStatus) {
  const response = await apiClient.patch(`/orders/seller/items/${itemId}/status`, { sellerStatus });
  return response.data.data;
}
