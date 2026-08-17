import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ArrowLeftOutlined, LockOutlined, MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Spin, Tabs, Typography } from 'antd';

import { profileApi } from '../api/profileApi';
import PersonalInfoTab from '../components/PersonalInfoTab';
import MedicalProfileTab from '../components/MedicalProfileTab';
import ChangePasswordTab from '../components/ChangePasswordTab';
import AvatarUploader from '../components/AvatarUploader';
import AppHeader from '../../../shared/components/AppHeader';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import type { Profile } from '../types';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const handleApiError = useApiErrorHandler();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        setProfile(response.data);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [handleApiError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />

      {/* Quay lại Trang chủ — header giống hệt Trang chủ nên đặt link quay lại riêng ở đây */}
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftOutlined /> Quay lại Trang chủ
        </Link>
      </div>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* USER SUMMARY */}
        <Card className="mb-6 shadow-md">
          <div className="flex items-center gap-5">
            <AvatarUploader
              avatarUrl={profile.avatarUrl}
              onUpdated={(avatarUrl) => setProfile((prev) => prev ? { ...prev, avatarUrl } : prev)}
            />

            <div>
              <Title level={3} style={{ margin: 0 }}>
                {profile.fullName}
              </Title>
              <Text type="secondary">{profile.phoneNumber}</Text>
              {profile.email && (
                <>
                  <br />
                  <Text type="secondary">{profile.email}</Text>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="shadow-md">
          <Tabs
            defaultActiveKey="personal"
            items={[
              {
                key: 'personal',
                label: (
                  <span>
                    <UserOutlined /> Thông tin cá nhân
                  </span>
                ),
                children: <PersonalInfoTab profile={profile} onUpdated={setProfile} />,
              },
              {
                key: 'medical',
                label: (
                  <span>
                    <MedicineBoxOutlined /> Hồ sơ sức khỏe
                  </span>
                ),
                children: (
                  <MedicalProfileTab
                    medicalProfile={profile.medicalProfile}
                    onUpdated={(medicalProfile) => setProfile((prev) => prev ? { ...prev, medicalProfile } : prev)}
                  />
                ),
              },
              {
                key: 'password',
                label: (
                  <span>
                    <LockOutlined /> Đổi mật khẩu
                  </span>
                ),
                children: <ChangePasswordTab />,
              },
            ]}
          />
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
