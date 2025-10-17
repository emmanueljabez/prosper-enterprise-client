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
    domain = "http://localhost:8080/api";
  } else {
    domain = "https://app.prospermentor.com/api";
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