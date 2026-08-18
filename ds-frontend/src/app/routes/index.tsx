import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import ProfilePage from '../../modules/profile/pages/ProfilePage';
import AuthLayout from '../../shared/layouts/AuthLayout';
import { STORAGE_KEYS } from '../../core/constants/storageKeys';
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import VerifyOtpPage from '../../modules/auth/pages/VerifyOtpPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import AdminLoginPage from '../../modules/admin-auth/pages/AdminLoginPage';
import AdminDashboardPage from '../../modules/admin/pages/AdminDashboardPage';
import AuditLogPage from '../../modules/audit-log/pages/AuditLogPage';

/**
 * Đọc `localStorage` ngay lúc RENDER (mỗi khi React Router mount lại route này), KHÔNG phải lúc
 * module `router` này được import (chỉ chạy 1 lần lúc app khởi động). Trước đây route `/` và
 * `/profile` kiểm tra token trực tiếp trong object route (`element: localStorage.getItem(...) ? ... `)
 * — giá trị đó bị "đóng băng" từ lúc app khởi động, nên nếu người dùng đăng nhập/đăng ký ngay trong
 * phiên đó (điều hướng phía client, không reload trang), `/` vẫn tưởng chưa đăng nhập và bật ngược
 * về `/login` dù vừa đăng nhập thành công.
 */
function RequireCustomerAuth({ children }: { children: ReactNode }) {
  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.customer.accessToken));
  return hasToken ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireCustomerAuth><DashboardPage /></RequireCustomerAuth>,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'verify-otp',
        element: <VerifyOtpPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      }
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/audit-logs',
    element: <AuditLogPage />,
  },
  {
    path: '/profile',
    element: <RequireCustomerAuth><ProfilePage /></RequireCustomerAuth>,
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
]);
