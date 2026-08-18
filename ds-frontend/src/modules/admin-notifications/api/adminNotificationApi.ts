import axiosClient from '../../../core/api/axiosClient';
import type { AdminNotificationItem, AdminNotificationListResponse, ApiResponse } from '../types';

export const adminNotificationApi = {
  getNotifications: (page: number, size: number): Promise<ApiResponse<AdminNotificationListResponse>> => {
    return axiosClient.get('/admin/notifications', { params: { page, size } });
  },

  markAsRead: (id: number): Promise<ApiResponse<AdminNotificationItem>> => {
    return axiosClient.put(`/admin/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<ApiResponse<null>> => {
    return axiosClient.put('/admin/notifications/read-all');
  },

  deleteNotification: (id: number): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/admin/notifications/${id}`);
  },
};
