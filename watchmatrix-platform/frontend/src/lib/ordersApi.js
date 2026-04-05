import apiClient from "./apiClient";

export async function placeOrder(payload) {
  const response = await apiClient.post("/orders", payload);
  return response.data.data;
}

export async function fetchMyOrders() {
  const response = await apiClient.get("/orders");
  return response.data.data;
}

export async function fetchOrderById(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data.data;
}
