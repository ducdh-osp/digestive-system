import NotificationBell from '../../../shared/components/NotificationBell/NotificationBell';
import { notificationApi } from '../api/notificationApi';

/**
 * Chỉ map những `type` đã có màn hình tương ứng trên FE — type nào chưa có route thật (vd.
 * MEDICATION_REMINDER, SYSTEM) sẽ chỉ đổi trạng thái đã đọc, không điều hướng, để tránh dẫn khách
 * hàng tới màn hình không tồn tại (mục 3.2 Quan-ly-danh-sach.md).
 */
const NOTIFICATION_TYPE_ROUTES: Record<string, string> = {
  PROFILE_UPDATE: '/profile',
};

const CustomerNotificationBell = () => (
  <NotificationBell
    api={notificationApi}
    badgeColor="blue"
    iconClassName="!bg-gradient-to-br !from-blue-500 !to-teal-400 shadow-blue-300 dark:shadow-blue-950/60 hover:!shadow-blue-300 dark:hover:!shadow-blue-950/60"
    typeRoutes={NOTIFICATION_TYPE_ROUTES}
  />
);

export default CustomerNotificationBell;
