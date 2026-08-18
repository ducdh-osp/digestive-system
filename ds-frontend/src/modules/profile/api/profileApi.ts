import axiosClient from '../../../core/api/axiosClient';

import type {
  ApiResponse,
  ChangePasswordRequest,
  MedicalProfile,
  Profile,
  ProfileUpdateResponse,
  UpdateMedicalProfileRequest,
  UpdateProfileRequest,
  UpdateThemeRequest,
} from '../types';

export const profileApi = {
  getProfile: (): Promise<ApiResponse<Profile>> => {
    return axiosClient.get('/profile');
  },

  updateProfile: (request: UpdateProfileRequest): Promise<ApiResponse<ProfileUpdateResponse>> => {
    return axiosClient.put('/profile', request);
  },

  changePassword: (request: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return axiosClient.put('/profile/password', request);
  },

  updateMedicalProfile: (request: UpdateMedicalProfileRequest): Promise<ApiResponse<MedicalProfile>> => {
    return axiosClient.put('/profile/medical', request);
  },

  updateTheme: (request: UpdateThemeRequest): Promise<ApiResponse<Profile>> => {
    return axiosClient.put('/profile/theme', request);
  },

  uploadAvatar: (file: File): Promise<ApiResponse<Profile>> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
