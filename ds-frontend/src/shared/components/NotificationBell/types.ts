export interface NotificationLike<TId> {
  id: TId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponseLike<TId> {
  content: NotificationLike<TId>[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
}

interface ApiResponseLike<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Hình dạng chung của `notificationApi` (Customer) và `adminNotificationApi` (Admin) — 2 module này
 * có API/response identical hệt nhau, chỉ khác kiểu `id` (string vs number) và base path. Khai báo
 * interface chung ở đây để `NotificationBell` (component dùng chung, xem `NotificationBell.tsx`)
 * chấp nhận cả 2 mà không cần biết chi tiết từng module.
 */
export interface NotificationBellApi<TId> {
  getNotifications: (page: number, size: number) => Promise<ApiResponseLike<NotificationListResponseLike<TId>>>;
  markAsRead: (id: TId) => Promise<ApiResponseLike<NotificationLike<TId>>>;
  markAllAsRead: () => Promise<ApiResponseLike<null>>;
  deleteNotification: (id: TId) => Promise<ApiResponseLike<null>>;
}
