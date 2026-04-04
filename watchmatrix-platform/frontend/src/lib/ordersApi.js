import apiClient from "./apiClient";

export async function placeOrder(payload) {
  const response = await apiClient.post("/orders", payload);
  return response.data.data;
}
