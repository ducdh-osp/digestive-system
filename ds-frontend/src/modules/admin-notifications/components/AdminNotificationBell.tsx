import NotificationBell from '../../../shared/components/NotificationBell/NotificationBell';
import { adminNotificationApi } from '../api/adminNotificationApi';

const AdminNotificationBell = () => (
  <NotificationBell
    api={adminNotificationApi}
    badgeColor="purple"
    iconClassName="!bg-gradient-to-br !from-purple-500 !to-fuchsia-500 shadow-purple-300 dark:shadow-purple-950/60 hover:!shadow-purple-300 dark:hover:!shadow-purple-950/60"
  />
);

export default AdminNotificationBell;
