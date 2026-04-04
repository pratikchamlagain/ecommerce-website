import apiClient from "./apiClient";

export async function fetchProducts(params = {}) {
  const response = await apiClient.get("/products", { params });
  return response.data.data;
}

export async function fetchProductBySlug(slug) {
  const response = await apiClient.get(`/products/${slug}`);
  return response.data.data;
}
