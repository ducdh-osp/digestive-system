import React, { useState, useEffect } from 'react';
import { Form, Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { ResetPasswordRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      getMessageApi().error(t('auth.resetPassword.invalidRequest'));
      navigate('/forgot-password');
    }
  }, [phoneNumber, navigate, t]);

  const onFinish = async (values: { otpCode: string, newPassword: string }) => {
    if (!phoneNumber) return;

    try {
      setLoading(true);
      const request: ResetPasswordRequest = {
        phoneNumber,
        otpCode: values.otpCode,
        newPassword: values.newPassword
      };

      const response = await authApi.resetPassword(request);
      if (response.success) {
        getMessageApi().success(t('auth.resetPassword.success'));
        navigate('/login');
      }
    } catch (error: any) {
      if (error.status === 400) {
        form.setFields([
          {
            name: 'otpCode',
            errors: [t('auth.resetPassword.otpInvalid')],
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('auth.resetPassword.title')}</h2>
        <p className="text-gray-500 dark:text-slate-300">{t('auth.resetPassword.subtitlePrefix')} {phoneNumber}</p>
      </div>

      <Form
        form={form}
        name="reset_password"
        layout="vertical"
        onFinish={onFinish}
        size="large"
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.resetPassword.otpLabel')}</span>}
          name="otpCode"
          rules={[
            { required: true, message: t('auth.resetPassword.otpRequired') },
            { len: 6, message: t('auth.resetPassword.otpLength') },
          ]}
        >
          <Input
            prefix={<SafetyCertificateOutlined className="text-gray-400" />}
            placeholder={t('auth.resetPassword.otpPlaceholder')}
            className="rounded-lg tracking-widest text-center text-lg"
            maxLength={6}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.resetPassword.newPasswordLabel')}</span>}
          name="newPassword"
          rules={[
            { required: true, message: t('auth.resetPassword.newPasswordRequired') },
            { min: 8, message: t('auth.resetPassword.newPasswordMin') }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.resetPassword.confirmPasswordLabel')}</span>}
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: t('auth.resetPassword.confirmPasswordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('auth.resetPassword.confirmPasswordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <PrimaryButton htmlType="submit" loading={loading}>
            {t('auth.resetPassword.submit')}
          </PrimaryButton>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;
