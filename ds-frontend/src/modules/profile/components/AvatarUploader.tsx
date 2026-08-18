import { useRef, useState } from 'react';
import { Spin, message } from 'antd';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';

import { profileApi } from '../api/profileApi';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import { API_ORIGIN } from '../../../core/api/axiosClient';

interface AvatarUploaderProps {
  avatarUrl: string | null;
  onUpdated: (avatarUrl: string | null) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB — khớp giới hạn phía Backend
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const AvatarUploader = ({ avatarUrl, onUpdated }: AvatarUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handleApiError = useApiErrorHandler();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Cho phép chọn lại đúng file cũ ở lần sau
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error('Chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WEBP');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      message.error('Kích thước ảnh tối đa 2MB');
      return;
    }

    try {
      setUploading(true);
      const response = await profileApi.uploadAvatar(file);
      onUpdated(response.data.avatarUrl);
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      handleApiError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-16 h-16 shrink-0">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 p-[2px] shadow-md">
        <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={`${API_ORIGIN}${avatarUrl}`} alt="Ảnh đại diện" className="w-full h-full object-cover" />
          ) : (
            <UserOutlined style={{ fontSize: 30, color: '#2563eb' }} />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 hover:scale-110 hover:shadow-lg hover:shadow-blue-300 border-2 border-white flex items-center justify-center text-white cursor-pointer transition-all duration-200"
        title="Đổi ảnh đại diện"
      >
        {uploading ? <Spin size="small" /> : <CameraOutlined style={{ fontSize: 13 }} />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarUploader;
