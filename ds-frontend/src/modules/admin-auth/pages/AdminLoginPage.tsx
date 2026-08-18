import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAuthApi } from '../api/adminAuthApi';
import type { AdminLoginRequest } from '../../auth/types';
import { PrimaryButton } from '../../../shared/components/Button';
import ThemeToggle from '../../../shared/components/ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher/LanguageSwitcher';
import { STORAGE_KEYS } from '../../../core/constants/storageKeys';

const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: AdminLoginRequest) => {
    try {
      setLoading(true);
      const response = await adminAuthApi.login(values);
      if (response.success && response.data) {
        localStorage.setItem(STORAGE_KEYS.admin.accessToken, response.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.admin.refreshToken, response.data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.admin.info, JSON.stringify(response.data.admin));
        getMessageApi().success(t('adminAuth.success', { username: response.data.admin.username }));
        navigate('/admin/dashboard'); // Hoặc route tương ứng sau này
      }
    } catch (error: any) {
      if (error.status === 401) {
        form.setFields([
          {
            name: 'password',
            errors: [t('adminAuth.invalidCredentials')],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
            <SafetyCertificateOutlined className="text-3xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('adminAuth.title')}</h2>
          <p className="text-slate-500 dark:text-slate-300">{t('adminAuth.subtitle')}</p>
        </div>

        <Form
          form={form}
          name="admin_login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
        >
          <Form.Item
            label={<span className="font-medium text-slate-700 dark:text-slate-300">{t('adminAuth.usernameLabel')}</span>}
            name="username"
            rules={[
              { required: true, message: t('adminAuth.usernameRequired') }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-slate-400" />}
              placeholder={t('adminAuth.usernamePlaceholder')}
              className="rounded-lg bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-slate-700 dark:text-slate-300">{t('adminAuth.passwordLabel')}</span>}
            name="password"
            rules={[{ required: true, message: t('adminAuth.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder={t('adminAuth.passwordPlaceholder')}
              className="rounded-lg bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700"
            />
          </Form.Item>

          <Form.Item className="mt-8 mb-0">
            <PrimaryButton color="indigo" htmlType="submit" loading={loading}>
              {t('adminAuth.submit')}
            </PrimaryButton>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
