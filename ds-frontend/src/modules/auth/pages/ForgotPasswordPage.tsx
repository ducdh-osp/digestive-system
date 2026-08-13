import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { ForgotPasswordRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: ForgotPasswordRequest) => {
    try {
      setLoading(true);
      const response = await authApi.forgotPassword(values);
      if (response.success) {
        message.success('Mã xác thực đã được gửi đến số điện thoại của bạn!');
        // Chuyển sang trang đặt lại mật khẩu và truyền số điện thoại qua state
        navigate('/reset-password', { state: { phoneNumber: values.phoneNumber } });
      }
    } catch (error: any) {
      if (error.status === 404) {
        form.setFields([
          {
            name: 'phoneNumber',
            errors: ['Số điện thoại không tồn tại trong hệ thống.'],
          },
        ]);
      } else if (error.status === 429) {
         message.error('Bạn đã vượt quá số lần nhận mã trong ngày. Vui lòng thử lại sau.');
      } else if (error.status === 403) {
         message.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu</h2>
        <p className="text-gray-500">Nhập số điện thoại để nhận mã xác thực khôi phục</p>
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
          label={<span className="font-medium text-gray-700">Số điện thoại</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ (10 số)!' }
          ]}
        >
          <Input 
            prefix={<UserOutlined className="text-gray-400" />} 
            placeholder="Nhập số điện thoại đã đăng ký" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <PrimaryButton htmlType="submit" loading={loading}>
            NHẬN MÃ XÁC THỰC
          </PrimaryButton>
        </Form.Item>

        <div className="text-center text-gray-600 mt-6">
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
            Quay lại Đăng nhập
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default ForgotPasswordPage;
