import axiosClient, { API_ORIGIN } from '../../../core/api/axiosClient';
import { STORAGE_KEYS } from '../../../core/constants/storageKeys';

import type {
  ApiResponse,
  ChangePasswordRequest,
  MedicalProfile,
  Profile,
  ProfileUpdateResponse,
  UpdateMedicalProfileRequest,
  UpdateProfileRequest,
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

  // Dùng fetch() thuần thay vì axiosClient: FormData qua fetch luôn được trình duyệt tự
  // gắn đúng 'Content-Type: multipart/form-data; boundary=...', không phụ thuộc cách
  // axiosClient merge header mặc định 'application/json' của instance dùng chung.
  uploadAvatar: async (file: File): Promise<ApiResponse<Profile>> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem(STORAGE_KEYS.customer.accessToken);
    const response = await fetch(`${API_ORIGIN}/api/v1/profile/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const result: ApiResponse<Profile> = await response.json();
    if (!response.ok) {
      throw { status: response.status, message: result.message };
    }
    return result;
  },
};
