export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogItem {
  id: number;
  createdAt: string;
  adminUsername: string | null;
  adminRoleName: string | null;
  action: AuditAction;
  entityName: string;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AuditLogFilter {
  fromDate?: string;
  toDate?: string;
  action?: AuditAction;
  adminId?: number;
  page?: number;
  size?: number;
}

export interface AdminLookup {
  id: number;
  username: string;
  roleName: string;
}
