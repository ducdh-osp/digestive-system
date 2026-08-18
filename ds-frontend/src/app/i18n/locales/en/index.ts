import common from './common.json';
import auth from './auth.json';
import adminAuth from './adminAuth.json';
import profile from './profile.json';
import dashboard from './dashboard.json';
import adminDashboard from './adminDashboard.json';
import notifications from './notifications.json';
import auditLog from './auditLog.json';

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
