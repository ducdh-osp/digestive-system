export interface AdminNotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface AdminNotificationListResponse {
  content: AdminNotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
