import apiClient from "./apiClient";

export async function initiateEsewaPayment(checkout) {
  const response = await apiClient.post("/payments/esewa/initiate", { checkout });
  return response.data.data;
}

export async function verifyEsewaPayment(data, checkout) {
  const response = await apiClient.post("/payments/esewa/verify", { data, checkout });
  return response.data.data;
}

export async function initiateKhaltiPayment(checkout) {
  const response = await apiClient.post("/payments/khalti/initiate", { checkout });
  return response.data.data;
}

export async function verifyKhaltiPayment(pidx, checkout) {
  const response = await apiClient.post("/payments/khalti/verify", { pidx, checkout });
  return response.data.data;
}

export async function fetchMyPaymentHistory(params = {}) {
  const response = await apiClient.get("/payments/history", { params });
  return response.data.data;
}

export async function fetchAdminPaymentHistory(params = {}) {
  const response = await apiClient.get("/payments/admin/history", { params });
  return response.data.data;
}
