import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const domain = "https://api.ispbox.io/v1";

const axiosInstance = axios.create({
    baseURL: domain,
    headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
    },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
         
        if (tenantId) {
          config.headers['X-TENANT-ID'] = tenantId;
        }
    }
  }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

export default axiosInstance;