import apiClient from "./apiClient";

export async function initiateEsewa(checkout) {
  const response = await apiClient.post("/payments/esewa/initiate", { checkout });
  return response.data.data;
}

export async function verifyEsewa(payload) {
  const response = await apiClient.post("/payments/esewa/verify", payload);
  return response.data.data;
}

export async function initiateKhalti(checkout) {
  const response = await apiClient.post("/payments/khalti/initiate", { checkout });
  return response.data.data;
}

export async function verifyKhalti(payload) {
  const response = await apiClient.post("/payments/khalti/verify", payload);
  return response.data.data;
}

export async function fetchPaymentHistory(params = {}) {
  const response = await apiClient.get("/payments/history", { params });
  return response.data.data;
}

export async function fetchAdminPaymentHistory(params = {}) {
  const response = await apiClient.get("/payments/admin/history", { params });
  return response.data.data;
}
