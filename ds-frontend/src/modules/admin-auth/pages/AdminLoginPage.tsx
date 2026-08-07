import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../api/adminAuthApi';
import type { AdminLoginRequest } from '../../auth/types';

const AdminLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: AdminLoginRequest) => {
    try {
      setLoading(true);
      const response = await adminAuthApi.login(values);
      if (response.success && response.data) {
        localStorage.setItem('adminAccessToken', response.data.accessToken);
        localStorage.setItem('adminRefreshToken', response.data.refreshToken);
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
        message.success(`Đăng nhập CMS thành công! Xin chào ${response.data.admin.username}`);
        navigate('/admin/dashboard'); // Hoặc route tương ứng sau này
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
         message.error('Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.');
      } else {
         message.error('Lỗi kết nối tới máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <SafetyCertificateOutlined className="text-3xl text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Gastro AI CMS</h2>
          <p className="text-slate-500">Hệ thống quản trị nội bộ</p>
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
            label={<span className="font-medium text-slate-700">Tên đăng nhập / Email</span>}
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tài khoản!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-slate-400" />} 
              placeholder="Nhập admin hoặc email..." 
              className="rounded-lg bg-slate-50 border-slate-200 focus:bg-white"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-slate-700">Mật khẩu</span>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-slate-400" />} 
              placeholder="Nhập mật khẩu..." 
              className="rounded-lg bg-slate-50 border-slate-200 focus:bg-white"
            />
          </Form.Item>

          <Form.Item className="mt-8 mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 rounded-lg font-bold text-base transition-all shadow-md hover:shadow-lg border-0"
            >
              ĐĂNG NHẬP HỆ THỐNG
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
