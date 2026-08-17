import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { RegisterRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';

const RegisterPage: React.FC = () => {
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
        message.success('Đăng ký thành công, vui lòng xác thực OTP');
        // Navigate to OTP page and pass state for next step
        navigate('/verify-otp', { state: payload });
      }
    } catch (error: any) {
      if (error.status === 409) {
        form.setFields([
          {
            name: 'phoneNumber',
            errors: ['Số điện thoại đã tồn tại'],
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản mới</h2>
        <p className="text-gray-500">Tạo tài khoản để trải nghiệm Gastro AI</p>
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
          label={<span className="font-medium text-gray-700">Họ và tên</span>}
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />} 
            placeholder="Nhập họ và tên của bạn" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Số điện thoại</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại bắt đầu bằng 0 và gồm 10 số!' }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined className="text-gray-400" />} 
            placeholder="Nhập số điện thoại" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Mật khẩu</span>}
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 8, message: 'Mật khẩu phải dài tối thiểu 8 ký tự!' }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-gray-400" />} 
            placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Xác nhận mật khẩu</span>}
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-gray-400" />} 
            placeholder="Nhập lại mật khẩu" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <PrimaryButton htmlType="submit" loading={loading}>
            ĐĂNG KÝ
          </PrimaryButton>
        </Form.Item>

        <div className="text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;
