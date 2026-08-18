import { Alert, Input } from 'antd';
import { PaperClipOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';
import CustomerLayout from '../../../shared/layouts/CustomerLayout';

const QUICK_REPLIES = ['Triệu chứng đau dạ dày', 'Chế độ ăn cho người đau bao tử', 'Khi nào cần đi khám?'];

/**
 * Trang chủ Customer — khung "Tư vấn với AI". Chatbot backend chưa có nên khu vực chat chỉ hiển thị
 * bản xem trước giao diện (dữ liệu mẫu, không gửi được tin nhắn thật) kèm thông báo tính năng đang
 * được phát triển, thay vì giả lập một tính năng chưa tồn tại.
 */
const DashboardPage = () => {
  return (
    <CustomerLayout title="Tư vấn với Gastro AI" subtitle="Chuyên khoa Tiêu hóa · Hỗ trợ bởi AI" fitContent>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <Alert
            type="info"
            showIcon
            message="Tính năng tư vấn AI đang được phát triển"
            description="Bên dưới là bản xem trước giao diện với dữ liệu mẫu. Bạn sẽ sớm có thể trò chuyện trực tiếp với Gastro AI để được tư vấn về các vấn đề tiêu hóa."
            className="rounded-lg"
          />

          <div className="text-center text-gray-500 text-sm">Ví dụ, 10:24</div>

          <div className="self-end max-w-[70%] bg-blue-600 text-white px-4.5 py-3.5 rounded-2xl rounded-tr-md text-[15px] leading-relaxed">
            Tôi bị đau dạ dày sau khi ăn đồ cay, tôi nên làm gì?
          </div>

          <div className="self-start max-w-[80%] flex gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <RobotOutlined />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 shadow-sm">
              <p className="text-gray-900 text-[15px] leading-relaxed m-0">
                Chào bạn, đau dạ dày sau khi ăn cay có thể là dấu hiệu của viêm loét hoặc trào ngược. Đồ cay
                chứa capsaicin có thể gây kích ứng niêm mạc dạ dày vốn đã nhạy cảm.
              </p>
              <p className="text-gray-900 font-semibold text-sm mt-3.5 mb-2">
                Bạn nên thực hiện các bước sau để giảm nhẹ:
              </p>
              <ul className="m-0 pl-5 text-gray-700 text-sm leading-relaxed space-y-1.5">
                <li>Uống một ít sữa tươi lạnh hoặc nước ấm để làm dịu dạ dày.</li>
                <li>Tránh nằm ngay sau khi ăn để ngăn ngừa trào ngược.</li>
                <li>Theo dõi cơn đau: nếu đau dữ dội, nôn mửa hoặc kéo dài, hãy đến cơ sở y tế ngay lập tức.</li>
              </ul>
              <div className="mt-4 pt-3 border-t border-gray-100 text-gray-500 text-xs">
                AI chỉ hỗ trợ tham khảo, không thay thế chẩn đoán hoặc điều trị của bác sĩ chuyên khoa.
              </div>
            </div>
          </div>

          <div className="self-start ml-12 flex flex-wrap gap-2.5 opacity-60 cursor-not-allowed" aria-disabled>
            {QUICK_REPLIES.map((label) => (
              <span
                key={label}
                className="bg-white border border-blue-600 text-blue-600 font-semibold text-sm px-4 py-2 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <Input
            size="large"
            disabled
            placeholder="Tính năng đang được phát triển..."
            prefix={<PaperClipOutlined className="text-gray-400" />}
            suffix={<SendOutlined className="text-gray-400" />}
            className="rounded-lg"
          />
          <p className="text-center text-gray-400 text-xs m-0">Tính năng tư vấn AI sẽ sớm được ra mắt.</p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default DashboardPage;
