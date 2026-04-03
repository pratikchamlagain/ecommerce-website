import apiClient from "./apiClient";

export async function fetchProducts(params = {}) {
  const response = await apiClient.get("/products", { params });
  return response.data.data;
}
