import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { ForgotPasswordRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: ForgotPasswordRequest) => {
    try {
      setLoading(true);
      const response = await authApi.forgotPassword(values);
      if (response.success) {
        getMessageApi().success(t('auth.forgotPassword.success'));
        // Chuyển sang trang đặt lại mật khẩu và truyền số điện thoại qua state
        navigate('/reset-password', { state: { phoneNumber: values.phoneNumber } });
      }
    } catch (error: any) {
      if (error.status === 404) {
        form.setFields([
          {
            name: 'phoneNumber',
            errors: [t('auth.forgotPassword.phoneNotFound')],
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('auth.forgotPassword.title')}</h2>
        <p className="text-gray-500 dark:text-slate-300">{t('auth.forgotPassword.subtitle')}</p>
      </div>

      <Form
        form={form}
        name="forgot_password"
        layout="vertical"
        onFinish={onFinish}
        size="large"
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-slate-300">{t('auth.forgotPassword.phoneLabel')}</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: t('auth.forgotPassword.phoneRequired') },
            { pattern: /^[0-9]{10}$/, message: t('auth.forgotPassword.phoneInvalid') }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder={t('auth.forgotPassword.phonePlaceholder')}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <PrimaryButton htmlType="submit" loading={loading}>
            {t('auth.forgotPassword.submit')}
          </PrimaryButton>
        </Form.Item>

        <div className="text-center text-gray-600 dark:text-slate-300 mt-6">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default ForgotPasswordPage;
