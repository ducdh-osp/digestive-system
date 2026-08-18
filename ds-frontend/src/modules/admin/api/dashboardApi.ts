import axiosClient from '../../../core/api/axiosClient';

export interface DashboardSummary {
  totalCustomers: number;
  totalAdmins: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  getSummary: (): Promise<ApiResponse<DashboardSummary>> => {
    return axiosClient.get('/admin/dashboard/summary');
  },
};
