import axiosClient from '../../../core/api/axiosClient';
import type { RegisterRequest, VerifyOtpRequest, LoginRequest, AuthResponse, ApiResponse, ForgotPasswordRequest, ResetPasswordRequest } from '../types';

export const authApi = {
  register: (data: RegisterRequest): Promise<ApiResponse<string>> => {
    return axiosClient.post('/auth/register', data);
  },
  
  verifyOtp: (data: VerifyOtpRequest): Promise<ApiResponse<AuthResponse>> => {
    return axiosClient.post('/auth/verify-otp', data);
  },

  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return axiosClient.post('/auth/login', data);
  },

  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<string>> => {
    return axiosClient.post('/auth/forgot-password', data);
  },

  resetPassword: (data: ResetPasswordRequest): Promise<ApiResponse<string>> => {
    return axiosClient.post('/auth/reset-password', data);
  }
};
