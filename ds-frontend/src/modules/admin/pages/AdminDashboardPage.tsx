import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, Empty, Skeleton, Statistic, Tag, Timeline, Typography } from 'antd';
import { TeamOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../shared/layouts/AdminLayout';
import { useAdminAuth } from '../../../shared/hooks/useAuth';
import { dashboardApi, type DashboardSummary } from '../api/dashboardApi';
import { auditLogApi } from '../../audit-log/api/auditLogApi';
import type { AuditAction, AuditLogItem } from '../../audit-log/types';

const { Text } = Typography;

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'green',
  UPDATE: 'geekblue',
  DELETE: 'red',
};

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, admin } = useAdminAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLogItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    dashboardApi.getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || admin?.role !== 'SUPER_ADMIN') return;
    setLoadingActivity(true);
    auditLogApi.list({
      fromDate: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
      toDate: dayjs().format('YYYY-MM-DD'),
      page: 0,
      size: 5,
    })
      .then((res) => setRecentActivity(res.data.content))
      .catch(() => setRecentActivity([]))
      .finally(() => setLoadingActivity(false));
  }, [isAuthenticated, admin?.role]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout title={t('adminDashboard.title')} subtitle={t('adminDashboard.subtitle')}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card
            hoverable
            className="rounded-2xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 [&.ant-card-hoverable:hover]:shadow-indigo-200/60 dark:[&.ant-card-hoverable:hover]:shadow-indigo-950/40 [&.ant-card-hoverable:hover]:border-indigo-300 [&.ant-card-hoverable:hover]:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <Statistic
                title={t('adminDashboard.totalCustomers')}
                value={summary?.totalCustomers}
                loading={!summary}
                styles={{ content: { color: '#4f46e5', fontWeight: 700 } }}
              />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white text-lg shadow-md shadow-indigo-200 dark:shadow-indigo-950/50">
                <TeamOutlined />
              </div>
            </div>
          </Card>
          <Card
            hoverable
            className="rounded-2xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 [&.ant-card-hoverable:hover]:shadow-fuchsia-200/60 dark:[&.ant-card-hoverable:hover]:shadow-fuchsia-950/40 [&.ant-card-hoverable:hover]:border-fuchsia-300 [&.ant-card-hoverable:hover]:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <Statistic
                title={t('adminDashboard.totalAdmins')}
                value={summary?.totalAdmins}
                loading={!summary}
                styles={{ content: { color: '#c026d3', fontWeight: 700 } }}
              />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-400 flex items-center justify-center text-white text-lg shadow-md shadow-fuchsia-200 dark:shadow-fuchsia-950/50">
                <SafetyCertificateOutlined />
              </div>
            </div>
          </Card>
        </div>

        {admin?.role === 'SUPER_ADMIN' && (
          <Card
            className="rounded-2xl border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            title={<span className="font-bold text-slate-800 dark:text-slate-100">{t('adminDashboard.recentActivity')}</span>}
            extra={
              <Link
                to="/admin/audit-logs"
                className="!text-indigo-600 dark:!text-indigo-400 hover:!text-indigo-700 dark:hover:!text-indigo-300 text-sm font-medium transition-all duration-200 inline-flex items-center gap-1 hover:gap-2"
              >
                {t('adminDashboard.viewAll')} <ArrowRightOutlined className="text-xs" />
              </Link>
            }
          >
            {loadingActivity ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : recentActivity.length === 0 ? (
              <Empty description={t('adminDashboard.noActivity')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Timeline
                items={recentActivity.map((log) => ({
                  color: log.action === 'DELETE' ? 'red' : log.action === 'CREATE' ? 'green' : 'blue',
                  children: (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm text-slate-800 dark:text-slate-100">
                          <span className="font-medium">{log.adminUsername}</span>{' '}
                          {log.description || `${log.action} ${log.entityName}`}
                        </div>
                        <Text type="secondary" className="text-xs">
                          {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </div>
                      <Tag color={ACTION_COLORS[log.action]}>{log.action}</Tag>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
