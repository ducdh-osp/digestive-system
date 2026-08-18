import axios, { AxiosError } from 'axios';
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
interface BackendErrorData {
  message?: unknown;
  error?: unknown;
  [key: string]: unknown;
}

export interface ApiError extends BackendErrorData {
  status?: number;
  message: string;
}

async function extractErrorData(error: AxiosError): Promise<BackendErrorData> {
  const data = error.response?.data;
  if (data instanceof Blob && data.type.includes('json')) {
    try {
      return JSON.parse(await data.text()) as BackendErrorData;
    } catch {
      return {};
    }
  }
  return data && typeof data === 'object' ? data as BackendErrorData : {};
}

function getErrorMessage(status: number | undefined, errorData: BackendErrorData): string {
  const backendMessage = [errorData.message, errorData.error]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  if (backendMessage) {
    return backendMessage;
  }

  if (status === undefined) return 'Không thể kết nối đến máy chủ.';
  if (status === 400) return 'Dữ liệu không hợp lệ.';
  if (status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
  if (status >= 500) return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
}

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const errorData = await extractErrorData(error);
    const status = error.response?.status;
    const errorMessage = getErrorMessage(status, errorData);

    message.open({
      type: 'error',
      content: errorMessage,
      key: `api-error-${status ?? 'network'}-${errorMessage}`,
    });

    const apiError: ApiError = {
      ...errorData,
      status,
      message: errorMessage,
    };
    return Promise.reject(apiError);
  }
);

export default axiosClient;
