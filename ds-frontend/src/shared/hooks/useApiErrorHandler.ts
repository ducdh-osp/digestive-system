import { useCallback } from 'react';
import { useCustomerAuth } from './useAuth';
import type { ApiError } from '../../core/api/axiosClient';

/**
 * Axios interceptor đã hiển thị toast lỗi toàn cục. Hook này chỉ giữ hành vi logout
 * của khu vực Customer khi phiên đăng nhập không còn hợp lệ, tránh hiện toast hai lần.
 */
export function useApiErrorHandler() {
  const { logout } = useCustomerAuth();

  return useCallback((error: unknown) => {
    const apiError = error as Partial<ApiError>;
    if (apiError.status === 401 || apiError.status === 403) {
      logout();
    }
  }, [logout]);
}
