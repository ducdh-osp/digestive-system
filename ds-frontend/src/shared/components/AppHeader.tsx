import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../hooks/useAuth';
import { LogoutButton } from './Button';
import NotificationBell from '../../modules/notifications/components/NotificationBell';

/**
 * Header dùng chung cho toàn bộ khu vực đã đăng nhập của Customer (Trang chủ + Profile...).
 * Bấm vào logo/tên app để về Trang chủ — thay cho việc mỗi trang tự làm 1 kiểu nút "quay lại".
 */
const AppHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useCustomerAuth();

  return (
    <header className="bg-gradient-to-br from-[#3E93C4] to-[#7DCBE8] shadow-md p-4 px-8 flex justify-between items-center">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
      >
        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">
          G
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Gastro AI</h1>
      </button>

      <div className="flex items-center gap-4">
        <NotificationBell />
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
  );
};

export default AppHeader;
