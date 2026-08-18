import { Alert, Input } from 'antd';
import { PaperClipOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CustomerLayout from '../../../shared/layouts/CustomerLayout';

/**
 * Trang chủ Customer — khung "Tư vấn với AI". Chatbot backend chưa có nên khu vực chat chỉ hiển thị
 * bản xem trước giao diện (dữ liệu mẫu, không gửi được tin nhắn thật) kèm thông báo tính năng đang
 * được phát triển, thay vì giả lập một tính năng chưa tồn tại.
 */
const DashboardPage = () => {
  const { t } = useTranslation();
  const quickReplies = [t('dashboard.quickReply1'), t('dashboard.quickReply2'), t('dashboard.quickReply3')];

  return (
    <CustomerLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} fitContent>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <Alert
            type="info"
            showIcon
            message={t('dashboard.wipTitle')}
            description={t('dashboard.wipDescription')}
            className="rounded-lg"
          />

          <div className="text-center text-gray-500 dark:text-slate-300 text-sm">{t('dashboard.sampleTimestamp')}</div>

          <div className="self-end max-w-[70%] bg-blue-600 text-white px-4.5 py-3.5 rounded-2xl rounded-tr-md text-[15px] leading-relaxed">
            {t('dashboard.sampleQuestion')}
          </div>

          <div className="self-start max-w-[80%] flex gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <RobotOutlined />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-tl-md p-5 shadow-sm">
              <p className="text-gray-900 dark:text-slate-100 text-[15px] leading-relaxed m-0">
                {t('dashboard.sampleAnswerIntro')}
              </p>
              <p className="text-gray-900 dark:text-slate-100 font-semibold text-sm mt-3.5 mb-2">
                {t('dashboard.sampleAnswerStepsIntro')}
              </p>
              <ul className="m-0 pl-5 text-gray-700 dark:text-slate-300 text-sm leading-relaxed space-y-1.5">
                <li>{t('dashboard.sampleStep1')}</li>
                <li>{t('dashboard.sampleStep2')}</li>
                <li>{t('dashboard.sampleStep3')}</li>
              </ul>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-300 text-xs">
                {t('dashboard.disclaimer')}
              </div>
            </div>
          </div>

          <div className="self-start ml-12 flex flex-wrap gap-2.5 opacity-60 cursor-not-allowed" aria-disabled>
            {quickReplies.map((label) => (
              <span
                key={label}
                className="bg-white dark:bg-slate-800 border border-blue-600 text-blue-600 dark:text-blue-400 font-semibold text-sm px-4 py-2 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-8 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <Input
            size="large"
            disabled
            placeholder={t('dashboard.inputPlaceholder')}
            prefix={<PaperClipOutlined className="text-gray-400" />}
            suffix={<SendOutlined className="text-gray-400" />}
            className="rounded-lg"
          />
          <p className="text-center text-gray-400 dark:text-slate-400 text-xs m-0">{t('dashboard.inputFooter')}</p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default DashboardPage;
