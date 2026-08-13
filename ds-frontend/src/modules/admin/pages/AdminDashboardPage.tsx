import React from 'react';
import { Navigate } from 'react-router-dom';
import { LogoutButton } from '../../../shared/components/Button';
import { useAdminAuth } from '../../../shared/hooks/useAuth';

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 shadow-md p-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Gastro AI <span className="text-indigo-400">CMS</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-slate-200 font-semibold">{admin?.username || 'Admin'}</span>
            <span className="text-indigo-300 text-xs font-medium uppercase tracking-wider">{admin?.role || 'Quản trị viên'}</span>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <LogoutButton onClick={logout} />
        </div>
      </header>
      <main className="p-8">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto mt-10 text-center">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
             <span className="text-4xl">🚀</span>
           </div>
           <h2 className="text-3xl font-bold text-slate-800 mb-4">Chào mừng đến với hệ thống Quản trị!</h2>
           <p className="text-slate-500 text-lg">Các tính năng quản lý khách hàng và phân tích dữ liệu đang được hoàn thiện và sẽ sớm được ra mắt.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
