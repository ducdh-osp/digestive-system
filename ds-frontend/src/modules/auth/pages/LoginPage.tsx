import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';
import { STORAGE_KEYS } from '../../../core/constants/storageKeys';

const LoginPage: React.FC = () => {
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
        message.success('Đăng nhập thành công!');
        navigate('/');
      }
    } catch (error: any) {
      if (error.status === 401) {
        form.setFields([
          {
            name: 'password',
            errors: ['Tài khoản hoặc mật khẩu không chính xác.'],
          },
        ]);
      } else if (error.status === 403) {
         message.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
        <p className="text-gray-500">Chào mừng bạn trở lại Gastro AI</p>
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
          label={<span className="font-medium text-gray-700">Số điện thoại</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ (10 số)!' }
          ]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />} 
            placeholder="Nhập số điện thoại" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Mật khẩu</span>}
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-gray-400" />} 
            placeholder="Nhập mật khẩu" 
            className="rounded-lg"
          />
        </Form.Item>

        <div className="flex justify-end mb-6">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium text-sm transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item>
          <PrimaryButton htmlType="submit" loading={loading}>
            ĐĂNG NHẬP
          </PrimaryButton>
        </Form.Item>

        <div className="text-center text-gray-600 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
            Đăng ký ngay
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;
