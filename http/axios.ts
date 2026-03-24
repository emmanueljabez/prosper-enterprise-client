// lib/axios.ts
import axios from 'axios';
import encryptionUtil from '@/utils/crypto';

const LEGACY_API_BASE = 'https://app.prospermentor.com/api'
const ENTERPRISE_API_BASE = 'https://enterprise.prospermentor.com/api'

function normalizeApiBase(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')
  return trimmed === LEGACY_API_BASE ? ENTERPRISE_API_BASE : trimmed
}

function getDomain() {
  const config = useRuntimeConfig()
  const configuredApiBase = normalizeApiBase(String(config.public?.apiBaseUrl || ''))
  if (configuredApiBase.length > 0) {
    return configuredApiBase
  }

  const environment = String(config.public?.nodeEnv || process.env.NODE_ENV || '').toLowerCase()
  const isDev = environment === 'development';
  if (isDev) {
    return 'http://localhost:8080/api'
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin.replace(/\/+$/, '')}/api`
  }

  return ENTERPRISE_API_BASE
}

// Create axios instance
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.baseURL) {
      config.baseURL = getDomain();
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;
