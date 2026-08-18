import { useState } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import { profileApi } from '../api/profileApi';
import { PrimaryButton } from '../../../shared/components/Button';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import { STORAGE_KEYS } from '../../../core/constants/storageKeys';
import type { Profile, UpdateProfileRequest } from '../types';

interface PersonalInfoTabProps {
  profile: Profile;
  onUpdated: (profile: Profile) => void;
}

const PersonalInfoTab = ({ profile, onUpdated }: PersonalInfoTabProps) => {
  const [form] = Form.useForm<UpdateProfileRequest>();
  const [submitting, setSubmitting] = useState(false);
  const handleApiError = useApiErrorHandler();

  const handleFinish = async (values: UpdateProfileRequest) => {
    try {
      setSubmitting(true);
      const response = await profileApi.updateProfile(values);
      const result = response.data;

      onUpdated(result.profile);

      // SĐT nằm trong JWT subject (CUSTOMER:<phone>) — đổi SĐT thì token cũ hết hiệu lực,
      // phải lưu token mới BE trả về ngay, nếu không request tiếp theo sẽ bị 401.
      localStorage.setItem(STORAGE_KEYS.customer.accessToken, result.accessToken);
      localStorage.setItem(STORAGE_KEYS.customer.refreshToken, result.refreshToken);
      localStorage.setItem(STORAGE_KEYS.customer.user, JSON.stringify({
        id: result.profile.id,
        fullName: result.profile.fullName,
        phoneNumber: result.profile.phoneNumber,
      }));

      message.success('Cập nhật thông tin cá nhân thành công');
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        email: profile.email ?? '',
      }}
    >
      <Row gutter={20}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input size="large" placeholder="Nhập họ và tên" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0' },
            ]}
          >
            <Input size="large" placeholder="0987654321" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input size="large" placeholder="example@gmail.com" />
          </Form.Item>
        </Col>
      </Row>

      <PrimaryButton
        fullWidth={false}
        htmlType="submit"
        icon={<SaveOutlined />}
        loading={submitting}
        className="!bg-gradient-to-r !from-blue-600 !to-teal-500 !border-0 hover:!shadow-lg hover:!shadow-blue-200 hover:!scale-[1.02] transition-all duration-200"
      >
        Lưu thay đổi
      </PrimaryButton>
    </Form>
  );
};

export default PersonalInfoTab;
