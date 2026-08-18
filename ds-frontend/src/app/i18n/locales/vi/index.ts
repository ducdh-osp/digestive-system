import common from './common.json';
import auth from './auth.json';
import adminAuth from './adminAuth.json';
import profile from './profile.json';
import dashboard from './dashboard.json';
import adminDashboard from './adminDashboard.json';
import notifications from './notifications.json';
import auditLog from './auditLog.json';

/**
 * Mỗi module (auth, profile, dashboard...) giữ từ điển riêng trong file của mình — dễ tìm/sửa hơn
 * so với 1 file JSON khổng lồ — rồi gộp phẳng lại đây thành object duy nhất. Các `t('module.key')`
 * trong toàn app không đổi vì hình dạng object sau khi gộp giống hệt trước khi tách file.
 */
export default {
  ...common,
  ...auth,
  ...adminAuth,
  ...profile,
  ...dashboard,
  ...adminDashboard,
  ...notifications,
  ...auditLog,
};
