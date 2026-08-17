import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider, Dropdown, Select, Table, Tag, message } from 'antd';
import type { TableProps } from 'antd';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { DownOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../../shared/hooks/useAuth';
import { LogoutButton, PrimaryButton } from '../../../shared/components/Button';
import { auditLogApi } from '../api/auditLogApi';
import type { AdminLookup, AuditAction, AuditLogItem } from '../types';

const { RangePicker } = DatePicker;
const DATE_FORMAT = 'YYYY-MM-DD';

// Tông chàm (indigo) khớp với màu thương hiệu CMS ở header/dashboard, thay cho xanh dương mặc định của AntD.
const BRAND_COLOR = '#4f46e5';

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'green',
  UPDATE: 'geekblue',
  DELETE: 'red',
};

const ACTION_OPTIONS = [
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

const AuditLogPage: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(6, 'day'), dayjs()]);
  const [action, setAction] = useState<AuditAction | undefined>(undefined);
  const [adminId, setAdminId] = useState<number | undefined>(undefined);
  const [admins, setAdmins] = useState<AdminLookup[]>([]);

  const [appliedFilter, setAppliedFilter] = useState({ dateRange, action, adminId });
  const [data, setData] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || admin?.role !== 'SUPER_ADMIN') {
      return;
    }
    auditLogApi.listAdmins()
      .then((res) => setAdmins(res.data))
      .catch((err) => message.error(err?.message || 'Không tải được danh sách Admin'));
  }, [isAuthenticated, admin?.role]);

  useEffect(() => {
    if (!isAuthenticated || admin?.role !== 'SUPER_ADMIN') {
      return;
    }
    setLoading(true);
    auditLogApi.list({
      fromDate: appliedFilter.dateRange[0].format(DATE_FORMAT),
      toDate: appliedFilter.dateRange[1].format(DATE_FORMAT),
      action: appliedFilter.action,
      adminId: appliedFilter.adminId,
      page: page - 1,
      size: pageSize,
    })
      .then((res) => {
        setData(res.data.content);
        setTotal(res.data.totalElements);
      })
      .catch((err) => message.error(err.message || 'Không tải được lịch sử hoạt động'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, admin?.role, appliedFilter, page, pageSize]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-md border border-slate-300 max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-500 mb-6">Chỉ SUPER_ADMIN được xem Nhật ký hệ thống (BR-03).</p>
          <PrimaryButton onClick={() => navigate('/admin/dashboard')} color="indigo">Quay lại Trang tổng quan</PrimaryButton>
        </div>
      </div>
    );
  }

  const handleFilter = () => {
    setPage(1);
    setAppliedFilter({ dateRange, action, adminId });
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    try {
      setExporting(true);
      const blob = await auditLogApi.export({
        format,
        fromDate: appliedFilter.dateRange[0].format(DATE_FORMAT),
        toDate: appliedFilter.dateRange[1].format(DATE_FORMAT),
        action: appliedFilter.action,
        adminId: appliedFilter.adminId,
      });
      const filename = `audit-log_${appliedFilter.dateRange[0].format(DATE_FORMAT)}_${appliedFilter.dateRange[1].format(DATE_FORMAT)}.${format}`;
      downloadBlob(blob, filename);
      message.success('Xuất file thành công');
    } catch (err: any) {
      message.error(err?.message || 'Xuất file thất bại, vui lòng thử lại sau');
    } finally {
      setExporting(false);
    }
  };

  const columns: TableProps<AuditLogItem>['columns'] = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 170,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Admin thực hiện',
      dataIndex: 'adminUsername',
      render: (_: string, record: AuditLogItem) => (
        <span>
          {record.adminUsername || 'N/A'}
          {record.adminRoleName && <span className="text-slate-400 text-xs"> ({record.adminRoleName})</span>}
        </span>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: 110,
      render: (value: AuditAction) => <Tag color={ACTION_COLORS[value]}>{value}</Tag>,
    },
    {
      title: 'Đối tượng',
      dataIndex: 'entityName',
      render: (_: string, record: AuditLogItem) => (
        <span className="font-mono text-sm">{record.entityName}{record.entityId ? `#${record.entityId}` : ''}</span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      render: (value: string | null) => value || '-',
    },
  ];

  const exportItems = [
    { key: 'xlsx', label: 'Xuất Excel (.xlsx)' },
    { key: 'csv', label: 'Xuất CSV (.csv)' },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: BRAND_COLOR, colorLink: BRAND_COLOR },
        components: { Table: { headerBg: '#eef2ff', headerColor: '#3730a3', borderColor: '#cbd5e1' } },
      }}
    >
    <div className="min-h-screen bg-slate-100 flex flex-col">
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-sm text-slate-500 hover:text-indigo-600 mb-2 inline-block"
              >
                ← Trang tổng quan
              </button>
              <h2 className="text-2xl font-bold text-slate-800">Nhật ký hệ thống (Audit Log)</h2>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-300 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Khoảng thời gian</label>
                <RangePicker
                  value={dateRange}
                  onChange={(values) => {
                    if (values && values[0] && values[1]) {
                      setDateRange([values[0], values[1]]);
                    }
                  }}
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Hành động</label>
                <Select
                  allowClear
                  placeholder="Tất cả"
                  style={{ width: 160 }}
                  options={ACTION_OPTIONS}
                  value={action}
                  onChange={(value) => setAction(value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nhân viên</label>
                <Select
                  allowClear
                  showSearch
                  placeholder="Tất cả"
                  style={{ width: 220 }}
                  optionFilterProp="label"
                  options={admins.map((a) => ({ value: a.id, label: `${a.username} (${a.roleName})` }))}
                  value={adminId}
                  onChange={(value) => setAdminId(value)}
                />
              </div>
              <PrimaryButton onClick={handleFilter} loading={loading} icon={<FilterOutlined />} color="indigo" fullWidth={false}>
                Lọc
              </PrimaryButton>
              <Dropdown
                menu={{ items: exportItems, onClick: ({ key }) => handleExport(key as 'xlsx' | 'csv') }}
                disabled={exporting || total === 0}
              >
                <button
                  disabled={exporting || total === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 h-12 rounded-lg border border-indigo-200 text-indigo-700 font-semibold bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <DownloadOutlined /> Xuất file <DownOutlined className="text-xs" />
                </button>
              </Dropdown>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden">
            <Table<AuditLogItem>
              rowKey="id"
              bordered
              columns={columns}
              dataSource={data}
              loading={loading}
              rowClassName={(_, index) => (index % 2 === 1 ? 'bg-slate-50' : 'bg-white')}
              expandable={{
                columnTitle: <span className="whitespace-nowrap">Chi tiết</span>,
                columnWidth: 100,
                expandedRowRender: (record) => (
                  <p className="whitespace-pre-wrap text-slate-600">{record.description || 'Không có mô tả'}</p>
                ),
              }}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                showTotal: (t) => `Tổng ${t} bản ghi`,
                onChange: (newPage, newSize) => {
                  setPage(newPage);
                  setPageSize(newSize);
                },
              }}
            />
          </div>
        </div>
      </main>
    </div>
    </ConfigProvider>
  );
};

export default AuditLogPage;
