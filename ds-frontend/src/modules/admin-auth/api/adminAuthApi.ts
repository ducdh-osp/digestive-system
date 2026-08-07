import axiosClient from '../../../core/api/axiosClient';
import type { AdminLoginRequest, AdminAuthResponse, ApiResponse } from '../../auth/types';

export const adminAuthApi = {
  login: (data: AdminLoginRequest): Promise<ApiResponse<AdminAuthResponse>> => {
    return axiosClient.post('/admin/auth/login', data);
  }
};
