import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { FileTextOutlined, HeartOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import NotificationBell from '../../modules/notifications/components/NotificationBell';
import { LogoutButton } from '../components/Button';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import { useCustomerAuth } from '../hooks/useAuth';

interface NavItem {
  labelKey: string;
  path?: string;
  icon: ReactNode;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.customer.aiConsult', path: '/', icon: <MessageOutlined /> },
  { labelKey: 'nav.customer.healthProfile', path: '/profile', icon: <HeartOutlined /> },
  { labelKey: 'nav.customer.consultHistory', icon: <HistoryOutlined />, comingSoon: true },
  { labelKey: 'nav.customer.medicalRecord', icon: <FileTextOutlined />, comingSoon: true },
];

interface CustomerLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Trang có nội dung tự cuộn riêng (vd khung chat) thay vì để main cuộn theo trang. */
  fitContent?: boolean;
}

/**
 * Khung sườn dùng chung cho khu vực Customer đã đăng nhập (Trang chủ, Profile...).
 * Cùng bố cục với AdminLayout (sidebar tối cố định + header trắng theo trang) nhưng đổi màu chủ đạo
 * sang xanh dương -> xanh ngọc lấy từ minh họa auth-bg.png của trang login, thay vì tông tím/hồng CMS.
 * Mục nào chưa xây (Lịch sử tư vấn, Hồ sơ bệnh án) hiển thị mờ kèm tag "Sắp ra mắt" thay vì trỏ
 * tới trang không tồn tại.
 *
 * Bọc children trong ConfigProvider để mọi component antd bên trong các trang con (Tabs, Button,
 * Input, Alert...) tự ăn theo màu thương hiệu thay vì màu xanh mặc định của antd — không cần sửa
 * tay từng trang.
 */
const CustomerLayout = ({ title, subtitle, children, fitContent = false }: CustomerLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useCustomerAuth();
  const { t } = useTranslation();

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#2563eb', colorLink: '#2563eb', colorInfo: '#2563eb', borderRadius: 8, borderRadiusLG: 16 },
      }}
    >
      <div className="h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex overflow-hidden">
        <aside className="w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col shrink-0">
          <div className="h-24 px-5 flex items-center gap-3 border-b border-slate-700/60 shrink-0">
            <div className="brand-gradient-flow w-10 h-10 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-bold text-xl shrink-0">
              G
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold leading-tight truncate">{t('common.appName')}</h1>
              <span className="text-teal-400 text-xs font-semibold tracking-wide">{t('nav.customer.brand')}</span>
            </div>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              if (item.comingSoon) {
                return (
                  <div
                    key={item.labelKey}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-slate-500 cursor-not-allowed select-none"
                  >
                    <span className="flex items-center gap-3 truncate">
                      {item.icon}
                      {t(item.labelKey)}
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
                      ? 'bg-gradient-to-r from-blue-600 to-teal-500 !text-white font-bold text-shadow-sm shadow-md shadow-blue-900/40'
                      : 'font-medium !text-slate-300 hover:bg-slate-800/80 hover:!text-white hover:pl-4 hover:shadow-inner'
                  }`}
                >
                  {item.icon}
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700/60">
            <div className="mb-3">
              <div className="text-slate-200 font-semibold text-sm truncate">{user?.fullName || t('nav.customer.guest')}</div>
              <div className="text-teal-400 text-xs uppercase tracking-wide">{t('nav.customer.role')}</div>
            </div>
            <LogoutButton onClick={logout} className="w-full justify-center" />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-24 bg-gradient-to-r from-white to-blue-50/60 dark:from-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 px-8 flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h2>
              {subtitle && <p className="text-slate-500 dark:text-slate-300 text-sm mt-1 truncate">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <LanguageSwitcher />
              <NotificationBell />
            </div>
          </header>

          <main
            className={`flex-1 min-w-0 ${fitContent ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-8'}`}
          >
            {children}
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default CustomerLayout;
