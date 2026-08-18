import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, ConfigProvider, Dropdown, Empty, Form, Select, Table, Tag, message } from 'antd';
import type { TableProps } from 'antd';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { DownloadOutlined, DownOutlined, FilterOutlined, LoadingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import AdminLayout from '../../../shared/layouts/AdminLayout';
import { useAdminAuth } from '../../../shared/hooks/useAuth';
import { PrimaryButton } from '../../../shared/components/Button';
import { auditLogApi } from '../api/auditLogApi';
import type { AdminLookup, AuditAction, AuditLogItem } from '../types';

const { RangePicker } = DatePicker;
const DATE_FORMAT = 'YYYY-MM-DD';

// Tông chàm (indigo) khớp với màu thương hiệu CMS ở sidebar/dashboard, thay cho xanh dương mặc định của AntD.
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
  const { isAuthenticated, admin } = useAdminAuth();
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
      .catch(() => setAdmins([]));
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
      .catch(() => {
        setData([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, admin?.role, appliedFilter, page, pageSize]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout title="Nhật ký hệ thống">
        <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-md border border-slate-300 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-500 mb-6">Chỉ SUPER_ADMIN được xem Nhật ký hệ thống (BR-03).</p>
          <PrimaryButton onClick={() => navigate('/admin/dashboard')} color="indigo">Quay lại Trang tổng quan</PrimaryButton>
        </div>
      </AdminLayout>
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
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
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
        components: {
          Table: { headerBg: '#eef2ff', headerColor: BRAND_COLOR, borderColor: '#e0e7ff', rowHoverBg: '#f5f3ff' },
        },
      }}
    >
      <AdminLayout title="Nhật ký hệ thống" subtitle="Lịch sử thao tác Create/Update/Delete của Admin">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card
            title={(
              <span className="flex items-center gap-3 py-1">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm shadow-md shadow-indigo-200 shrink-0">
                  <FilterOutlined />
                </span>
                <span className="font-bold text-slate-800">Bộ lọc</span>
              </span>
            )}
            className="rounded-2xl border-slate-300 shadow-md transition-shadow duration-300 hover:shadow-lg hover:border-indigo-300"
          >
            <Form layout="inline" className="[&_.ant-form-item]:!mb-0 items-end gap-y-4">
              <Form.Item label="Khoảng thời gian">
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
              </Form.Item>
              <Form.Item label="Hành động">
                <Select
                  allowClear
                  placeholder="Tất cả"
                  style={{ width: 160 }}
                  options={ACTION_OPTIONS}
                  value={action}
                  onChange={(value) => setAction(value)}
                />
              </Form.Item>
              <Form.Item label="Nhân viên">
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
              </Form.Item>
              <Form.Item>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleFilter}
                    disabled={loading}
                    className="h-10 min-w-[112px] px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? <LoadingOutlined /> : <FilterOutlined />} Lọc
                  </button>
                  <Dropdown
                    menu={{ items: exportItems, onClick: ({ key }) => handleExport(key as 'xlsx' | 'csv') }}
                    disabled={total === 0}
                    trigger={['click']}
                  >
                    <button
                      type="button"
                      disabled={total === 0 || exporting}
                      className="h-10 min-w-[112px] px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {exporting ? <LoadingOutlined /> : <DownloadOutlined />} Xuất file <DownOutlined className="text-xs opacity-80" />
                    </button>
                  </Dropdown>
                </div>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={(
              <span className="flex items-center gap-3 py-1">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm shadow-md shadow-fuchsia-200 shrink-0">
                  <UnorderedListOutlined />
                </span>
                <span className="font-bold text-slate-800">Danh sách</span>
              </span>
            )}
            extra={<Tag color="default" bordered={false} className="!m-0 !bg-indigo-50 !text-indigo-700 !font-medium">Tổng {total} bản ghi</Tag>}
            className="rounded-2xl border-slate-300 shadow-md transition-shadow duration-300 hover:shadow-lg hover:border-fuchsia-300 overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            <Table<AuditLogItem>
              rowKey="id"
              bordered
              columns={columns}
              dataSource={data}
              loading={loading}
              rowClassName={(_, index) => (index % 2 === 1 ? 'bg-indigo-50/30' : 'bg-white')}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có bản ghi nào phù hợp với bộ lọc hiện tại."
                    className="my-10"
                  />
                ),
              }}
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
          </Card>
        </div>
      </AdminLayout>
    </ConfigProvider>
  );
};

export default AuditLogPage;
