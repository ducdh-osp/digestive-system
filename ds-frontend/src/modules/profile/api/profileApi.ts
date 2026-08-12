import axios from 'axios';

import type {
  ApiResponse,
  ChangePasswordRequest,
  MedicalProfile,
  Profile,
  ProfileUpdateResponse,
  UpdateMedicalProfileRequest,
  UpdateProfileRequest,
} from '../types';

const API_URL = 'http://localhost:8080/api/v1/profile';

const getAuthConfig = () => {
  const token = localStorage.getItem('accessToken');

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    const response = await axios.get<ApiResponse<Profile>>(
      API_URL,
      getAuthConfig(),
    );

    return response.data.data;
  },

  updateProfile: async (
    request: UpdateProfileRequest,
  ): Promise<ProfileUpdateResponse> => {
    const response = await axios.put<ApiResponse<ProfileUpdateResponse>>(
      API_URL,
      request,
      getAuthConfig(),
    );

    const result = response.data.data;

    // Quan trọng:
    // phone number nằm trong JWT subject.
    // Nếu đổi phone backend trả token mới.
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
    }

    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }

    localStorage.setItem(
      'user',
      JSON.stringify(result.profile),
    );

    return result;
  },

  changePassword: async (
    request: ChangePasswordRequest,
  ): Promise<void> => {
    await axios.put(
      `${API_URL}/password`,
      request,
      getAuthConfig(),
    );
  },

  updateMedicalProfile: async (
    request: UpdateMedicalProfileRequest,
  ): Promise<MedicalProfile> => {
    const response = await axios.put<ApiResponse<MedicalProfile>>(
      `${API_URL}/medical`,
      request,
      getAuthConfig(),
    );

    return response.data.data;
  },
};