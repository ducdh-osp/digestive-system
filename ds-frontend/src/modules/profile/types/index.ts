export interface MedicalProfile {
  heightCm: number | null;
  weightKg: number | null;
  medicalHistory: string | null;
}

export type Theme = 'light' | 'dark';

export interface Profile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  avatarUrl: string | null;
  theme: Theme;
  medicalProfile: MedicalProfile | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateMedicalProfileRequest {
  heightCm?: number;
  weightKg?: number;
  medicalHistory?: string;
}

export interface UpdateThemeRequest {
  theme: Theme;
}

export interface ProfileUpdateResponse {
  profile: Profile;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}