import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getHistory = async (limit = 50, startDate = null, endDate = null) => {
  let url = `/history?limit=${limit}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  const response = await api.get(url);
  return response.data;
};

export const getFuzzyDecisions = async (limit = 50, startDate = null, endDate = null) => {
  let url = `/fuzzy?limit=${limit}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  const response = await api.get(url);
  return response.data;
};

export const getIrrigationLogs = async (limit = 20) => {
  const response = await api.get('/irrigation-logs');
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const downloadHistoryUrl = `${API_BASE_URL}/history/download`;

export default api;
