import { useState } from 'react';
import { Form, Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { profileApi } from '../api/profileApi';
import { PrimaryButton } from '../../../shared/components/Button';
import { useApiErrorHandler } from '../../../shared/hooks/useApiErrorHandler';
import type { ChangePasswordRequest } from '../types';

const ChangePasswordTab = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ChangePasswordRequest>();
  const [submitting, setSubmitting] = useState(false);
  const handleApiError = useApiErrorHandler();

  const handleFinish = async (values: ChangePasswordRequest) => {
    try {
      setSubmitting(true);
      await profileApi.changePassword(values);
      getMessageApi().success(t('profile.password.success'));
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
        label={t('profile.password.oldLabel')}
        name="oldPassword"
        rules={[{ required: true, message: t('profile.password.oldRequired') }]}
      >
        <Input.Password size="large" placeholder={t('profile.password.oldPlaceholder')} />
      </Form.Item>

      <Form.Item
        label={t('profile.password.newLabel')}
        name="newPassword"
        rules={[
          { required: true, message: t('profile.password.newRequired') },
          { min: 8, message: t('profile.password.newMin') },
        ]}
      >
        <Input.Password size="large" placeholder={t('profile.password.newPlaceholder')} />
      </Form.Item>

      <Form.Item
        label={t('profile.password.confirmLabel')}
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: t('profile.password.confirmRequired') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t('profile.password.confirmMismatch')));
            },
          }),
        ]}
      >
        <Input.Password size="large" placeholder={t('profile.password.confirmPlaceholder')} />
      </Form.Item>

      <PrimaryButton
        fullWidth={false}
        htmlType="submit"
        icon={<LockOutlined />}
        loading={submitting}
        className="!bg-gradient-to-r !from-blue-600 !to-teal-500 !border-0 hover:!shadow-lg hover:!shadow-blue-200 dark:hover:!shadow-blue-950/50 hover:!scale-[1.02] transition-all duration-200"
      >
        {t('profile.password.submit')}
      </PrimaryButton>
    </Form>
  );
};

export default ChangePasswordTab;
