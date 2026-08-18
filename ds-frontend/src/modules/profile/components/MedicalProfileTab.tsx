import { useState } from 'react';
import { Form, InputNumber, Input, Row, Col } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { profileApi } from '../api/profileApi';
import { PrimaryButton } from '../../../shared/components/Button';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import type { MedicalProfile, UpdateMedicalProfileRequest } from '../types';

interface MedicalProfileTabProps {
  medicalProfile: MedicalProfile | null;
  onUpdated: (medicalProfile: MedicalProfile) => void;
}

const MedicalProfileTab = ({ medicalProfile, onUpdated }: MedicalProfileTabProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<UpdateMedicalProfileRequest>();
  const [submitting, setSubmitting] = useState(false);
  const handleApiError = useApiErrorHandler();

  const handleFinish = async (values: UpdateMedicalProfileRequest) => {
    try {
      setSubmitting(true);
      const response = await profileApi.updateMedicalProfile(values);
      onUpdated(response.data);
      getMessageApi().success(t('profile.medical.success'));
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
        heightCm: medicalProfile?.heightCm ?? undefined,
        weightKg: medicalProfile?.weightKg ?? undefined,
        medicalHistory: medicalProfile?.medicalHistory ?? '',
      }}
    >
      <Row gutter={20}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t('profile.medical.heightLabel')}
            name="heightCm"
            rules={[{ type: 'number', min: 1, message: t('profile.medical.heightInvalid') }]}
          >
            <InputNumber size="large" min={1} max={300} style={{ width: '100%' }} placeholder="170" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={t('profile.medical.weightLabel')}
            name="weightKg"
            rules={[{ type: 'number', min: 1, message: t('profile.medical.weightInvalid') }]}
          >
            <InputNumber size="large" min={1} max={500} style={{ width: '100%' }} placeholder="65" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item label={t('profile.medical.historyLabel')} name="medicalHistory">
            <Input.TextArea rows={6} placeholder={t('profile.medical.historyPlaceholder')} />
          </Form.Item>
        </Col>
      </Row>

      <PrimaryButton
        fullWidth={false}
        htmlType="submit"
        icon={<SaveOutlined />}
        loading={submitting}
        className="!bg-gradient-to-r !from-blue-600 !to-teal-500 !border-0 hover:!shadow-lg hover:!shadow-blue-200 dark:hover:!shadow-blue-950/50 hover:!scale-[1.02] transition-all duration-200"
      >
        {t('profile.medical.save')}
      </PrimaryButton>
    </Form>
  );
};

export default MedicalProfileTab;
