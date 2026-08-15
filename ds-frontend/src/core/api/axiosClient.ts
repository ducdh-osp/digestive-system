import axios from 'axios';
import { message } from 'antd';
import { STORAGE_KEYS } from '../constants/storageKeys';

export const API_ORIGIN = 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const isAdminRequest = config.url?.startsWith('/admin');
    const token = localStorage.getItem(isAdminRequest ? STORAGE_KEYS.admin.accessToken : STORAGE_KEYS.customer.accessToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    if (error.response?.status >= 500) {
       message.error(errorMessage);
    }
    return Promise.reject({
      ...(error.response?.data || {}),
      status: error.response?.status,
      message: errorMessage,
    });
  }
);

export default axiosClient;
