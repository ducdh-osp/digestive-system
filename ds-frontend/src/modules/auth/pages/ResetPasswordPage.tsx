import React, { useState, useEffect } from 'react';
import { Form, Input, message } from 'antd';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { ResetPasswordRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      message.error('Yêu cầu không hợp lệ. Vui lòng bắt đầu lại.');
      navigate('/forgot-password');
    }
  }, [phoneNumber, navigate]);

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
        message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        navigate('/login');
      }
    } catch (error: any) {
      if (error.status === 400) {
        form.setFields([
          {
            name: 'otpCode',
            errors: ['Mã xác thực không chính xác hoặc đã hết hạn.'],
          },
        ]);
      } else {
        message.error('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo mật khẩu mới</h2>
        <p className="text-gray-500">Mã xác thực 6 số đã được gửi tới {phoneNumber}</p>
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
          label={<span className="font-medium text-gray-700">Mã xác thực OTP</span>}
          name="otpCode"
          rules={[
            { required: true, message: 'Vui lòng nhập mã OTP!' },
            { len: 6, message: 'Mã OTP phải có 6 chữ số!' },
          ]}
        >
          <Input 
            prefix={<SafetyCertificateOutlined className="text-gray-400" />} 
            placeholder="Nhập 6 chữ số OTP" 
            className="rounded-lg tracking-widest text-center text-lg"
            maxLength={6}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Mật khẩu mới</span>}
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-gray-400" />} 
            placeholder="Nhập mật khẩu mới" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Xác nhận mật khẩu mới</span>}
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-gray-400" />} 
            placeholder="Nhập lại mật khẩu mới" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <PrimaryButton htmlType="submit" loading={loading}>
            ĐỔI MẬT KHẨU
          </PrimaryButton>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;
