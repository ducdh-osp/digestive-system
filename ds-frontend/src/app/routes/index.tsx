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

export const router = createBrowserRouter([
  {
    path: '/',
    element: localStorage.getItem(STORAGE_KEYS.customer.accessToken)
      ? <DashboardPage />
      : <Navigate to="/login" replace />,
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
    path: '/profile',
    element: localStorage.getItem(STORAGE_KEYS.customer.accessToken)
      ? <ProfilePage />
      : <Navigate to="/login" replace />,
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
]);
