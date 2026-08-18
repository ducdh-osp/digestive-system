import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tag } from 'antd';
import { useAdminAuth } from '../hooks/useAuth';
import { LogoutButton } from '../components/Button';
import AdminNotificationBell from '../../modules/admin-notifications/components/AdminNotificationBell';

interface NavItem {
  label: string;
  path?: string;
  icon: string;
  visible: boolean;
  comingSoon?: boolean;
}

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Khung sườn dùng chung cho toàn bộ khu vực CMS đã đăng nhập (Trang tổng quan, Nhật ký hệ thống...).
 * Sidebar liệt kê các chức năng CMS — mục nào chưa xây (vd Quản lý Admin) hiển thị badge "Sắp ra mắt"
 * thay vì trỏ tới trang không tồn tại.
 *
 * Header (h-24) và khối logo đầu sidebar (h-24) cố tình cùng 1 chiều cao cố định để đường viền ngang
 * giữa 2 khối luôn thẳng hàng, bất kể nội dung bên trong (title/subtitle) dài ngắn khác nhau.
 */
const AdminLayout = ({ title, subtitle, children }: AdminLayoutProps) => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Trang tổng quan', path: '/admin/dashboard', icon: '🏠', visible: true },
    { label: 'Nhật ký hệ thống', path: '/admin/audit-logs', icon: '📋', visible: admin?.role === 'SUPER_ADMIN' },
    { label: 'Quản lý Admin', icon: '👤', visible: true, comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex">
      <aside className="w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col shrink-0">
        <div className="h-24 px-5 flex items-center gap-3 border-b border-slate-700/60 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 via-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-xl shrink-0">
            G
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold leading-tight truncate">Gastro AI</h1>
            <span className="text-indigo-400 text-xs font-semibold tracking-wide">CMS</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.filter((item) => item.visible).map((item) => {
            if (item.comingSoon) {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-slate-500 cursor-not-allowed select-none"
                >
                  <span className="flex items-center gap-3 truncate">
                    <span>{item.icon}</span>{item.label}
                  </span>
                  <Tag color="default" bordered={false} className="!m-0 !bg-slate-800 !text-slate-400 shrink-0">
                    Sắp ra mắt
                  </Tag>
                </div>
              );
            }
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path as string}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ease-out ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:pl-4 hover:shadow-inner'
                }`}
              >
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/60">
          <div className="mb-3">
            <div className="text-slate-200 font-semibold text-sm truncate">{admin?.username || 'Admin'}</div>
            <div className="text-indigo-400 text-xs uppercase tracking-wide">{admin?.role || 'Quản trị viên'}</div>
          </div>
          <LogoutButton onClick={logout} className="w-full justify-center" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-gradient-to-r from-white to-purple-50/60 border-b border-slate-300 px-8 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-800 truncate">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm mt-1 truncate">{subtitle}</p>}
          </div>
          <AdminNotificationBell />
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
