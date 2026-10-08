import axios from 'axios';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (envUrl) {
      try {
        const parsed = new URL(envUrl);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          return `${parsed.protocol}//${window.location.hostname}:${parsed.port || '3000'}`;
        }
      } catch {
        // fallback to default
      }
    }
    return `http://${window.location.hostname}:3000`;
  }
  return envUrl || 'http://localhost:3000';
};

export const BASE_URL = getApiBaseUrl();

// Base URL mengarah ke NestJS main-api
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Handle jika token expired / unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);