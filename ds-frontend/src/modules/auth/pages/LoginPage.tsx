import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';
import { STORAGE_KEYS } from '../../../core/constants/storageKeys';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authApi.login(values);
      if (response.success && response.data) {
        localStorage.setItem(STORAGE_KEYS.customer.accessToken, response.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.customer.refreshToken, response.data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.customer.user, JSON.stringify(response.data.user));
        getMessageApi().success(t('auth.login.success'));
        navigate('/');
      }
    } catch (error: any) {
      if (error.status === 401) {
        form.setFields([
          {
            name: 'password',
            errors: [t('auth.login.invalidCredentials')],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('auth.login.title')}</h2>
        <p className="text-gray-500 dark:text-slate-300">{t('auth.login.subtitle')}</p>
      </div>

      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onFinish}
        size="large"
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.login.phoneLabel')}</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: t('auth.login.phoneRequired') },
            { pattern: /^[0-9]{10}$/, message: t('auth.login.phoneInvalid') }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder={t('auth.login.phonePlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.login.passwordLabel')}</span>}
          name="password"
          rules={[{ required: true, message: t('auth.login.passwordRequired') }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.login.passwordPlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <div className="flex justify-end mb-6">
          <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium text-sm transition-colors">
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        <Form.Item>
          <PrimaryButton htmlType="submit" loading={loading}>
            {t('auth.login.submit')}
          </PrimaryButton>
        </Form.Item>

        <div className="text-center text-gray-600 dark:text-slate-300 mt-6">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">
            {t('auth.login.registerNow')}
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;
