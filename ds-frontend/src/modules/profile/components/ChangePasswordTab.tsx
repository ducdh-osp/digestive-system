import { useState } from 'react';
import { Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';

import { profileApi } from '../api/profileApi';
import { PrimaryButton } from '../../../shared/components/Button';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import type { ChangePasswordRequest } from '../types';

const ChangePasswordTab = () => {
  const [form] = Form.useForm<ChangePasswordRequest>();
  const [submitting, setSubmitting] = useState(false);
  const handleApiError = useApiErrorHandler();

  const handleFinish = async (values: ChangePasswordRequest) => {
    try {
      setSubmitting(true);
      await profileApi.changePassword(values);
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 600 }}>
      <Form.Item
        label="Mật khẩu hiện tại"
        name="oldPassword"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
      >
        <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
      </Form.Item>

      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu mới' },
          { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
        ]}
      >
        <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu mới"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
            },
          }),
        ]}
      >
        <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
      </Form.Item>

      <PrimaryButton
        fullWidth={false}
        htmlType="submit"
        icon={<LockOutlined />}
        loading={submitting}
        className="!bg-gradient-to-r !from-blue-600 !to-teal-500 !border-0 hover:!shadow-lg hover:!shadow-blue-200 hover:!scale-[1.02] transition-all duration-200"
      >
        Đổi mật khẩu
      </PrimaryButton>
    </Form>
  );
};

export default ChangePasswordTab;
