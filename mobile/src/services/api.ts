/**
 * 📡 API Service
 * Centralized API client for all backend communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const API_PREFIX = process.env.EXPO_PUBLIC_API_BASE_URL || '/api/v1';
const FULL_API_URL = `${API_BASE_URL}${API_PREFIX}`;

let instance: AxiosInstance;

/**
 * Initialize API client with interceptors
 */
export const initApiService = async () => {
  instance = axios.create({
    baseURL: FULL_API_URL,
    timeout: 30000,
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Auth token retrieval error:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Get API client instance
 */
export const getApiClient = (): AxiosInstance => {
  if (!instance) {
    throw new Error('API service not initialized. Call initApiService() first.');
  }
  return instance;
};

/**
 * Generic API call wrapper
 */
export const apiCall = async <T = any>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const client = getApiClient();
    const response = await client[method]<T>(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(`API ${method.toUpperCase()} ${endpoint}:`, error);
    throw error;
  }
};

export default {
  initApiService,
  getApiClient,
  apiCall,
};
