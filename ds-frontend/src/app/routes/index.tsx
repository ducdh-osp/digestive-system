import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../../shared/layouts/AuthLayout';
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import VerifyOtpPage from '../../modules/auth/pages/VerifyOtpPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import AdminLoginPage from '../../modules/admin-auth/pages/AdminLoginPage';
import AdminDashboardPage from '../../modules/admin/pages/AdminDashboardPage';

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 px-8 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-blue-900">Gastro AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Xin chào, {user?.fullName || 'Khách'}!</span>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="text-red-500 hover:text-red-700 font-medium cursor-pointer transition-colors"
          >
            Đăng xuất
          </button>
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
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  }
]);
