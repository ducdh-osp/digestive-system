import { useEffect, useState } from 'react';

import { LockOutlined, MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Spin, Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { profileApi } from '../api/profileApi';
import PersonalInfoTab from '../components/PersonalInfoTab';
import MedicalProfileTab from '../components/MedicalProfileTab';
import ChangePasswordTab from '../components/ChangePasswordTab';
import AvatarUploader from '../components/AvatarUploader';
import CustomerLayout from '../../../shared/layouts/CustomerLayout';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import type { Profile } from '../types';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { t } = useTranslation();
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
      <CustomerLayout title={t('profile.title')} fitContent>
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      </CustomerLayout>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <CustomerLayout title={t('profile.title')} subtitle={t('profile.subtitle')}>
      <div className="max-w-6xl mx-auto">
        {/* USER SUMMARY */}
        <div className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="relative h-24 bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div className="px-6 pb-6">
            {/* Chỉ avatar đè lên banner — tách khỏi khối tên/sđt/email để chiều cao text không bao giờ
                ảnh hưởng tới việc avatar (hoặc tên) bị banner che mất.
                `relative z-10`: banner có position:relative (để chứa các khối mờ blur) nên mặc định
                được vẽ đè lên các phần tử tĩnh phía sau nó dù đứng sau trong DOM — phải tự nâng avatar
                lên cùng "lớp" positioned thì mới đè ngược lại lên banner, tránh mất nửa vòng trắng. */}
            <div className="relative z-10 -mt-10 inline-flex rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-lg">
              <AvatarUploader
                avatarUrl={profile.avatarUrl}
                onUpdated={(avatarUrl) => setProfile((prev) => prev ? { ...prev, avatarUrl } : prev)}
              />
            </div>

            <div className="mt-4 min-w-0">
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
        </div>

        <Card bordered={false} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Tabs
            defaultActiveKey="personal"
            items={[
              {
                key: 'personal',
                label: (
                  <span>
                    <UserOutlined /> {t('profile.tabs.personal')}
                  </span>
                ),
                children: <PersonalInfoTab profile={profile} onUpdated={setProfile} />,
              },
              {
                key: 'medical',
                label: (
                  <span>
                    <MedicineBoxOutlined /> {t('profile.tabs.medical')}
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
                    <LockOutlined /> {t('profile.tabs.password')}
                  </span>
                ),
                children: <ChangePasswordTab />,
              },
            ]}
          />
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default ProfilePage;
