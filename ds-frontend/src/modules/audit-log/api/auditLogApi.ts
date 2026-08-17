import axiosClient from '../../../core/api/axiosClient';
import type { ApiResponse } from '../../auth/types';
import type { AdminLookup, AuditLogFilter, AuditLogItem, PageResponse } from '../types';

export const auditLogApi = {
  list: (filter: AuditLogFilter): Promise<ApiResponse<PageResponse<AuditLogItem>>> => {
    return axiosClient.get('/admin/audit-logs', { params: filter });
  },

  listAdmins: (): Promise<ApiResponse<AdminLookup[]>> => {
    return axiosClient.get('/admin/audit-logs/admins');
  },

  export: (filter: AuditLogFilter & { format: 'xlsx' | 'csv' }): Promise<Blob> => {
    return axiosClient.get('/admin/audit-logs/export', { params: filter, responseType: 'blob' });
  },
};
