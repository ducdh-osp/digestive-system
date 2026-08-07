export interface RegisterRequest {
  fullName: string;
  phoneNumber: string;
  password?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otpCode: string;
  fullName: string;
  password?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  otpCode: string;
  newPassword?: string;
}

export interface AdminLoginRequest {
  username: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
