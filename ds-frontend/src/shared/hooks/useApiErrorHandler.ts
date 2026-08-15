import { message } from 'antd';
import { useCustomerAuth } from './useAuth';

/**
 * Toast lỗi API dùng chung — 401/403 tự logout Customer, còn lại hiện message từ BE.
 * Dựa trên error.status do axiosClient response interceptor gắn sẵn.
 */
export function useApiErrorHandler() {
  const { logout } = useCustomerAuth();

  return (error: any) => {
    if (error?.status === 401 || error?.status === 403) {
      message.error('Phiên đăng nhập đã hết hạn');
      logout();
      return;
    }
    message.error(error?.message || 'Có lỗi xảy ra');
  };
}
