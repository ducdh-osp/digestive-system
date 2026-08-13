import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../../core/constants/storageKeys';
import type { AuthResponse, AdminAuthResponse } from '../../modules/auth/types';

type CustomerInfo = AuthResponse['user'];
type AdminInfo = AdminAuthResponse['admin'];

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Đọc trạng thái đăng nhập Customer từ localStorage và cung cấp hàm logout dùng chung.
 * Dùng cho các trang/route thuộc app Customer (Trang chủ, Profile, ...).
 */
export function useCustomerAuth() {
  const navigate = useNavigate();

  const token = localStorage.getItem(STORAGE_KEYS.customer.accessToken);
  const user = readJson<CustomerInfo>(STORAGE_KEYS.customer.user);
  const isAuthenticated = Boolean(token);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.customer.accessToken);
    localStorage.removeItem(STORAGE_KEYS.customer.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.customer.user);
    navigate('/login', { replace: true });
  };

  return { token, user, isAuthenticated, logout };
}

/**
 * Đọc trạng thái đăng nhập Admin từ localStorage và cung cấp hàm logout dùng chung.
 * Dùng cho các trang/route thuộc khu vực CMS.
 */
export function useAdminAuth() {
  const navigate = useNavigate();

  const token = localStorage.getItem(STORAGE_KEYS.admin.accessToken);
  const admin = readJson<AdminInfo>(STORAGE_KEYS.admin.info);
  const isAuthenticated = Boolean(token);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.admin.accessToken);
    localStorage.removeItem(STORAGE_KEYS.admin.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.admin.info);
    navigate('/admin/login', { replace: true });
  };

  return { token, admin, isAuthenticated, logout };
}
