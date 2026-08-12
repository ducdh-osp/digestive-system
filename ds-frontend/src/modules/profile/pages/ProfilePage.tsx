import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeftOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Spin,
  Tabs,
  Typography,
} from 'antd';

import axios from 'axios';

import { profileApi } from '../api/profileApi';

import type {
  ChangePasswordRequest,
  Profile,
  UpdateMedicalProfileRequest,
  UpdateProfileRequest,
} from '../types';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileForm] = Form.useForm<UpdateProfileRequest>();
  const [passwordForm] = Form.useForm<ChangePasswordRequest>();
  const [medicalForm] =
    Form.useForm<UpdateMedicalProfileRequest>();

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await profileApi.getProfile();

      setProfile(data);

      profileForm.setFieldsValue({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email ?? '',
      });

      medicalForm.setFieldsValue({
        heightCm: data.medicalProfile?.heightCm ?? undefined,
        weightKg: data.medicalProfile?.weightKg ?? undefined,
        medicalHistory:
          data.medicalProfile?.medicalHistory ?? '',
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      const serverMessage =
        error.response?.data?.message;

      if (status === 401 || status === 403) {
        message.error('Phiên đăng nhập đã hết hạn');

        localStorage.clear();

        navigate('/login', {
          replace: true,
        });

        return;
      }

      message.error(
        serverMessage || 'Có lỗi xảy ra',
      );

      return;
    }

    message.error('Có lỗi xảy ra');
  };

  const handleUpdateProfile = async (
    values: UpdateProfileRequest,
  ) => {
    try {
      const result =
        await profileApi.updateProfile(values);

      setProfile(result.profile);

      message.success(
        'Cập nhật thông tin cá nhân thành công',
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleChangePassword = async (
    values: ChangePasswordRequest,
  ) => {
    try {
      await profileApi.changePassword(values);

      message.success('Đổi mật khẩu thành công');

      passwordForm.resetFields();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateMedicalProfile = async (
    values: UpdateMedicalProfileRequest,
  ) => {
    try {
      const medicalProfile =
        await profileApi.updateMedicalProfile(values);

      setProfile((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          medicalProfile,
        };
      });

      message.success(
        'Cập nhật hồ sơ sức khỏe thành công',
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
            />

            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: '#1e3a8a',
                }}
              >
                Gastro AI
              </Title>

              <Text type="secondary">
                Quản lý hồ sơ cá nhân
              </Text>
            </div>
          </div>

          <Button
            danger
            onClick={() => {
              localStorage.clear();
              navigate('/login', {
                replace: true,
              });
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* USER SUMMARY */}
        <Card className="mb-6 shadow-sm">
          <div className="flex items-center gap-5">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <UserOutlined
                style={{
                  fontSize: 30,
                  color: '#2563eb',
                }}
              />
            </div>

            <div>
              <Title
                level={3}
                style={{ margin: 0 }}
              >
                {profile?.fullName}
              </Title>

              <Text type="secondary">
                {profile?.phoneNumber}
              </Text>

              {profile?.email && (
                <>
                  <br />
                  <Text type="secondary">
                    {profile.email}
                  </Text>
                </>
              )}
            </div>

          </div>
        </Card>

        <Card className="shadow-sm">
          <Tabs
            defaultActiveKey="personal"
            items={[
              {
                key: 'personal',

                label: (
                  <span>
                    <UserOutlined />
                    Thông tin cá nhân
                  </span>
                ),

                children: (
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                  >
                    <Row gutter={20}>

                      <Col
                        xs={24}
                        md={12}
                      >
                        <Form.Item
                          label="Họ và tên"
                          name="fullName"
                          rules={[
                            {
                              required: true,
                              message:
                                'Vui lòng nhập họ tên',
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Nhập họ và tên"
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        xs={24}
                        md={12}
                      >
                        <Form.Item
                          label="Số điện thoại"
                          name="phoneNumber"
                          rules={[
                            {
                              required: true,
                              message:
                                'Vui lòng nhập số điện thoại',
                            },
                            {
                              pattern: /^0\d{9}$/,
                              message:
                                'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0',
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="0987654321"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            {
                              type: 'email',
                              message:
                                'Email không hợp lệ',
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="example@gmail.com"
                          />
                        </Form.Item>
                      </Col>

                    </Row>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      Lưu thay đổi
                    </Button>
                  </Form>
                ),
              },

              {
                key: 'medical',

                label: (
                  <span>
                    <MedicineBoxOutlined />
                    Hồ sơ sức khỏe
                  </span>
                ),

                children: (
                  <Form
                    form={medicalForm}
                    layout="vertical"
                    onFinish={
                      handleUpdateMedicalProfile
                    }
                  >
                    <Row gutter={20}>

                      <Col
                        xs={24}
                        md={12}
                      >
                        <Form.Item
                          label="Chiều cao (cm)"
                          name="heightCm"
                          rules={[
                            {
                              type: 'number',
                              min: 1,
                              message:
                                'Chiều cao phải lớn hơn 0',
                            },
                          ]}
                        >
                          <InputNumber
                            size="large"
                            min={1}
                            max={300}
                            style={{
                              width: '100%',
                            }}
                            placeholder="170"
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        xs={24}
                        md={12}
                      >
                        <Form.Item
                          label="Cân nặng (kg)"
                          name="weightKg"
                          rules={[
                            {
                              type: 'number',
                              min: 1,
                              message:
                                'Cân nặng phải lớn hơn 0',
                            },
                          ]}
                        >
                          <InputNumber
                            size="large"
                            min={1}
                            max={500}
                            style={{
                              width: '100%',
                            }}
                            placeholder="65"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item
                          label="Tiền sử bệnh"
                          name="medicalHistory"
                        >
                          <Input.TextArea
                            rows={6}
                            placeholder="Ví dụ: Viêm dạ dày, trào ngược dạ dày..."
                          />
                        </Form.Item>
                      </Col>

                    </Row>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      Lưu hồ sơ sức khỏe
                    </Button>
                  </Form>
                ),
              },

              {
                key: 'password',

                label: (
                  <span>
                    <LockOutlined />
                    Đổi mật khẩu
                  </span>
                ),

                children: (
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={
                      handleChangePassword
                    }
                    style={{
                      maxWidth: 600,
                    }}
                  >
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="oldPassword"
                      rules={[
                        {
                          required: true,
                          message:
                            'Vui lòng nhập mật khẩu hiện tại',
                        },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Mật khẩu mới"
                      name="newPassword"
                      rules={[
                        {
                          required: true,
                          message:
                            'Vui lòng nhập mật khẩu mới',
                        },
                        {
                          min: 8,
                          message:
                            'Mật khẩu phải có ít nhất 8 ký tự',
                        },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu mới"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Xác nhận mật khẩu mới"
                      name="confirmPassword"
                      dependencies={[
                        'newPassword',
                      ]}
                      rules={[
                        {
                          required: true,
                          message:
                            'Vui lòng xác nhận mật khẩu mới',
                        },

                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue(
                                'newPassword',
                              ) === value
                            ) {
                              return Promise.resolve();
                            }

                            return Promise.reject(
                              new Error(
                                'Mật khẩu xác nhận không khớp',
                              ),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<LockOutlined />}
                      size="large"
                    >
                      Đổi mật khẩu
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;