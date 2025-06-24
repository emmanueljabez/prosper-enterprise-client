// lib/axios.ts
import axios from 'axios';
import encryptionUtil from '@/utils/crypto';

function getDomain() {
  const config = useRuntimeConfig()
  const environment = config.public.nodeEnv
  const isDev = environment === 'development';

  console.log("Environment:", environment, "Is Dev:", isDev);

  let domain;
  if (isDev) {
    domain = "https://apisandbox.pcash.africa/api/v1";
  } else {
    domain = "https://api.pcash.africa/api/v1";
  }
  // console.log("Using domain:", domain);
  return domain;
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
      const tenantId = localStorage.getItem('tenantId') || 'henexa';
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['X-Tenant-ID'] = tenantId || '';
      }
    }

    // Encrypt request data for POST, PUT, PATCH requests (except auth endpoints)
    if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '') &&
      !config.url?.includes('/auth/')) {
      // console.log(`Encrypting ${config.method?.toUpperCase()} request data for URL:`, config.url, 'Data:', config.data);
      if (typeof config.data === 'object') {
        // const originalData = config.data;
        config.data = encryptionUtil.encrypt(JSON.stringify(config.data));
        // console.log('Encrypted data:', config.data);
        // console.log('Original data was:', originalData);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle decryption
axiosInstance.interceptors.response.use(
  (response) => {
    // Decrypt response data if it's encrypted (except auth endpoints)
    if (response.data && !response.config.url?.includes('/auth/')) {
      // Check if response data has the encrypted structure: { data: { data: "encrypted_string" } }
      if (response.data.data && typeof response.data.data === 'string') {
        try {
          const decryptedData = encryptionUtil.decrypt(response.data.data); if (decryptedData) {
            response.data = decryptedData;
            console.log('Decrypted response data:', response.data);
          }
        } catch (error) {
          console.error('Failed to decrypt response:', error);
          // Continue with original response if decryption fails
        }
      }
    }
    return response;
  },
  (error) => {
    // Handle encrypted error responses
    if (error.response?.data?.data && typeof error.response.data.data === 'string' &&
      !error.config?.url?.includes('/auth/')) {
      try {
        const decryptedError = encryptionUtil.decrypt(error.response.data.data);
        if (decryptedError) {
          error.response.data = decryptedError;
        }
      } catch (decryptError) {
        console.error('Failed to decrypt error response:', decryptError);
        // Continue with original error if decryption fails
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;