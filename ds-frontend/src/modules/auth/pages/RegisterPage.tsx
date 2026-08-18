import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { RegisterRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload: RegisterRequest = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        password: values.password
      };

      const response = await authApi.register(payload);
      if (response.success) {
        getMessageApi().success(t('auth.register.success'));
        // Navigate to OTP page and pass state for next step
        navigate('/verify-otp', { state: payload });
      }
    } catch (error: any) {
      if (error.status === 409) {
        form.setFields([
          {
            name: 'phoneNumber',
            errors: [t('auth.register.phoneExists')],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('auth.register.title')}</h2>
        <p className="text-gray-500 dark:text-slate-300">{t('auth.register.subtitle')}</p>
      </div>

      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={onFinish}
        size="large"
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.register.fullNameLabel')}</span>}
          name="fullName"
          rules={[{ required: true, message: t('auth.register.fullNameRequired') }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder={t('auth.register.fullNamePlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.register.phoneLabel')}</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: t('auth.register.phoneRequired') },
            { pattern: /^0[0-9]{9}$/, message: t('auth.register.phoneInvalid') }
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400" />}
            placeholder={t('auth.register.phonePlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.register.passwordLabel')}</span>}
          name="password"
          rules={[
            { required: true, message: t('auth.register.passwordRequired') },
            { min: 8, message: t('auth.register.passwordMin') }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.register.passwordPlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.register.confirmPasswordLabel')}</span>}
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: t('auth.register.confirmPasswordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('auth.register.confirmPasswordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <PrimaryButton htmlType="submit" loading={loading}>
            {t('auth.register.submit')}
          </PrimaryButton>
        </Form.Item>

        <div className="text-center text-gray-600 dark:text-slate-300">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">
            {t('auth.register.loginNow')}
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;
