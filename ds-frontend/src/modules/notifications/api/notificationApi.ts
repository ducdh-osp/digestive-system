import axiosClient from '../../../core/api/axiosClient';
import type { ApiResponse, NotificationItem, NotificationListResponse } from '../types';

export const notificationApi = {
  getNotifications: (page: number, size: number): Promise<ApiResponse<NotificationListResponse>> => {
    return axiosClient.get('/notifications', { params: { page, size } });
  },

  markAsRead: (id: string): Promise<ApiResponse<NotificationItem>> => {
    return axiosClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<ApiResponse<null>> => {
    return axiosClient.put('/notifications/read-all');
  },

  deleteNotification: (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/notifications/${id}`);
  },
};
