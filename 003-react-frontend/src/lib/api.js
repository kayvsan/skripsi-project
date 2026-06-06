import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getHistory = async (page = 1, limit = 10, startDate = null, endDate = null) => {
  const offset = (page - 1) * limit;
  let url = `/history?limit=${limit}&offset=${offset}`;
  if (startDate) url += `&startDate=${startDate}T00:00:00`;
  if (endDate) url += `&endDate=${endDate}T23:59:59`;
  const response = await api.get(url);
  return response.data;
};

export const getFuzzyDecisions = async (page = 1, limit = 10, startDate = null, endDate = null) => {
  const offset = (page - 1) * limit;
  let url = `/fuzzy?limit=${limit}&offset=${offset}`;
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

export const getIrrigationLogs = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  let url = `/irrigation-logs?limit=${limit}&offset=${offset}`;
  const response = await api.get(url);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const downloadHistoryUrl = `${API_BASE_URL}/history/download`;

export default api;
