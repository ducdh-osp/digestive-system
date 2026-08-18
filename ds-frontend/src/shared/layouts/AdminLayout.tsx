import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../hooks/useAuth';
import { LogoutButton } from '../components/Button';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import AdminNotificationBell from '../../modules/admin-notifications/components/AdminNotificationBell';

interface NavItem {
  labelKey: string;
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
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { labelKey: 'nav.admin.dashboard', path: '/admin/dashboard', icon: '🏠', visible: true },
    { labelKey: 'nav.admin.auditLog', path: '/admin/audit-logs', icon: '📋', visible: admin?.role === 'SUPER_ADMIN' },
    { labelKey: 'nav.admin.adminManagement', icon: '👤', visible: true, comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 flex">
      <aside className="w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col shrink-0">
        <div className="h-24 px-5 flex items-center gap-3 border-b border-slate-700/60 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 via-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-xl shrink-0">
            G
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold leading-tight truncate">{t('common.appName')}</h1>
            <span className="text-indigo-400 text-xs font-semibold tracking-wide">{t('nav.admin.brand')}</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.filter((item) => item.visible).map((item) => {
            if (item.comingSoon) {
              return (
                <div
                  key={item.labelKey}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-slate-500 cursor-not-allowed select-none"
                >
                  <span className="flex items-center gap-3 truncate">
                    <span>{item.icon}</span>{t(item.labelKey)}
                  </span>
                  <Tag color="default" bordered={false} className="!m-0 !bg-slate-800 !text-slate-400 shrink-0">
                    {t('common.comingSoon')}
                  </Tag>
                </div>
              );
            }
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.labelKey}
                to={item.path as string}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-out ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-500 !text-white font-bold text-shadow-sm shadow-md shadow-indigo-900/40'
                    : 'font-medium !text-slate-300 hover:bg-slate-800/80 hover:!text-white hover:pl-4 hover:shadow-inner'
                }`}
              >
                <span>{item.icon}</span>{t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/60">
          <div className="mb-3">
            <div className="text-slate-200 font-semibold text-sm truncate">{admin?.username || t('nav.admin.guest')}</div>
            <div className="text-indigo-400 text-xs uppercase tracking-wide">{admin?.role || t('nav.admin.role')}</div>
          </div>
          <LogoutButton onClick={logout} className="w-full justify-center" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-gradient-to-r from-white to-purple-50/60 dark:from-slate-900 dark:to-slate-900 border-b border-slate-300 dark:border-slate-700 px-8 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h2>
            {subtitle && <p className="text-slate-500 dark:text-slate-300 text-sm mt-1 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            <AdminNotificationBell />
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
