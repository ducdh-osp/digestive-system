import axiosClient from '../../../core/api/axiosClient';
import type { ApiResponse, NotificationItem } from '../types';

export const notificationApi = {
  getNotifications: (): Promise<ApiResponse<NotificationItem[]>> => {
    return axiosClient.get('/notifications');
  },

  markAsRead: (id: string): Promise<ApiResponse<NotificationItem>> => {
    return axiosClient.put(`/notifications/${id}/read`);
  },

  deleteNotification: (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/notifications/${id}`);
  },
};
