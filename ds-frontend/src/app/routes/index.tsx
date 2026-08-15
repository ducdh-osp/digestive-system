import { createBrowserRouter, Link, Navigate } from 'react-router-dom';
import ProfilePage from '../../modules/profile/pages/ProfilePage';
import AuthLayout from '../../shared/layouts/AuthLayout';
import { LogoutButton } from '../../shared/components/Button';
import { STORAGE_KEYS } from '../../core/constants/storageKeys';
import { useCustomerAuth } from '../../shared/hooks/useAuth';
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import VerifyOtpPage from '../../modules/auth/pages/VerifyOtpPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import AdminLoginPage from '../../modules/admin-auth/pages/AdminLoginPage';
import AdminDashboardPage from '../../modules/admin/pages/AdminDashboardPage';

const ProtectedRoute = () => {
  const { isAuthenticated, user, logout } = useCustomerAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-br from-[#3E93C4] to-[#7DCBE8] shadow-md p-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Gastro AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Xin chào, {user?.fullName || 'Khách'}!</span>
          <div className="h-8 w-px bg-white/30"></div>
          <Link
            to="/profile"
            className="cursor-pointer rounded-md px-3 py-2 font-medium text-white transition-colors hover:bg-white/20"
          >
            Xem hồ sơ
          </Link>
          <div className="h-8 w-px bg-white/30"></div>
          <LogoutButton onClick={logout} />
        </div>
      </header>
      <main className="p-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto mt-10 text-center">
           <h2 className="text-3xl font-bold text-gray-800 mb-4">Chào mừng bạn đã đăng nhập thành công!</h2>
           <p className="text-gray-500 text-lg">Hệ thống đang được xây dựng. Các tính năng sẽ sớm được ra mắt.</p>
        </div>
      </main>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
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
