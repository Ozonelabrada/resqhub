import axios from 'axios';
import { serverHealth } from './serverHealth';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com',
  timeout: Number(import.meta.env.VITE_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

publicApi.interceptors.request.use((config) => {
  if (serverHealth.isServerDown()) {
    return Promise.reject(new Error('SERVER UNREACHABLE'));
  }
  return config;
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.request || error.message === 'SERVER UNREACHABLE') {
      serverHealth.reportNetworkError();
    }
    return Promise.reject(error);
  }
);

export default publicApi;