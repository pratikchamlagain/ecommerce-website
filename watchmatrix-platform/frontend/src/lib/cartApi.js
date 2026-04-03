import apiClient from "./apiClient";

export async function fetchCart() {
  const response = await apiClient.get("/cart");
  return response.data.data;
}

export async function addToCart(payload) {
  const response = await apiClient.post("/cart/items", payload);
  return response.data.data;
}

export async function updateCartItem(itemId, quantity) {
  const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
  return response.data.data;
}

export async function removeCartItem(itemId) {
  const response = await apiClient.delete(`/cart/items/${itemId}`);
  return response.data.data;
}

export async function clearCart() {
  const response = await apiClient.delete("/cart/clear");
  return response.data.data;
}
