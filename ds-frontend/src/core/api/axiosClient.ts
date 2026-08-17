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

/**
 * Khi request dùng responseType 'blob' (vd tải file Export ở D.4.2) mà Backend trả lỗi,
 * response.data vẫn là 1 Blob (không phải JSON) — phải đọc lại nội dung Blob mới lấy được
 * đúng message lỗi (ApiResponse.error) thay vì rơi vào message mặc định chung chung.
 */
async function extractErrorData(error: any): Promise<any> {
  const data = error.response?.data;
  if (data instanceof Blob && data.type.includes('json')) {
    try {
      return JSON.parse(await data.text());
    } catch {
      return {};
    }
  }
  return data || {};
}

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const errorData = await extractErrorData(error);
    const errorMessage = errorData?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    if (error.response?.status >= 500) {
       message.error(errorMessage);
    }
    return Promise.reject({
      ...errorData,
      status: error.response?.status,
      message: errorMessage,
    });
  }
);

export default axiosClient;
