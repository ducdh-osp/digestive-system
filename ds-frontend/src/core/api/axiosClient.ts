import axios from 'axios';
import { message } from 'antd';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
