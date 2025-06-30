import axios from 'axios';


const BASE_URL = "https://api.pcash.africa/api/v1/tenant/upload/Expense";


const uploadAxios = axios.create();

uploadAxios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const uploadFileApi = {
    uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return uploadAxios.post(`${BASE_URL}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default uploadFileApi;