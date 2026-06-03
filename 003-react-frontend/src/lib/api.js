import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getHistory = async (limit = 50, startDate = null, endDate = null) => {
  let url = `/history?limit=${limit}`;
  if (startDate) url += `&startDate=${startDate}T00:00:00`;
  if (endDate) url += `&endDate=${endDate}T23:59:59`;
  const response = await api.get(url);
  return response.data;
};

export const getFuzzyDecisions = async (limit = 50, startDate = null, endDate = null) => {
  let url = `/fuzzy?limit=${limit}`;
  if (startDate) url += `&startDate=${startDate}T00:00:00`;
  if (endDate) url += `&endDate=${endDate}T23:59:59`;
  const response = await api.get(url);
  return response.data;
};

export const getKpiData = async (startDate = null, endDate = null) => {
  let url = '/kpi';
  if (startDate || endDate) {
    url += '?';
    if (startDate) url += `startDate=${startDate}T00:00:00&`;
    if (endDate) url += `endDate=${endDate}T23:59:59`;
  }
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
