# Tập luật nghiệp vụ (Business Rules) - Cá nhân hóa Trải nghiệm

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Cá nhân hóa Trải nghiệm (F.1), gồm Dark Mode (F.1.1) và Đa ngôn ngữ (F.1.2).

## BR-01: Giá trị mặc định của Giao diện
- Nếu thiết bị chưa từng lưu lựa chọn Theme (`localStorage` rỗng) và người dùng chưa đăng nhập (không có giá trị đồng bộ từ server), giao diện mặc định là **Light**.
- **Lý do:** Đảm bảo trải nghiệm nhất quán, dự đoán được cho người dùng lần đầu truy cập, không phụ thuộc `prefers-color-scheme` của hệ điều hành (tránh Admin/Customer thắc mắc vì sao mỗi máy hiện màu khác nhau dù chưa từng tự chọn).

## BR-02: Thứ tự ưu tiên khi tải Theme
- Khi tải trang, thứ tự ưu tiên áp dụng Theme là: (1) `localStorage` của thiết bị hiện tại nếu có → (2) giá trị `theme` đồng bộ từ Backend nếu người dùng đã đăng nhập và thiết bị chưa từng lưu gì → (3) mặc định Light (BR-01).
- **Lý do:** `localStorage` của thiết bị hiện tại luôn phản ánh đúng ý định gần nhất của người dùng trên chính thiết bị đó, chỉ dùng giá trị đồng bộ từ server cho thiết bị mới/lần đăng nhập đầu.

## BR-03: Thao tác đổi giao diện không chờ Backend
- Khi người dùng bấm Toggle Dark Mode, FE phải đổi giao diện và ghi `localStorage` **ngay lập tức**; việc gọi API đồng bộ lên Backend (F.1.1, Mục 4) chỉ chạy ngầm, không hiển thị loading, không chặn thao tác, và không rollback giao diện nếu API đồng bộ thất bại.
- **Lý do:** Đổi giao diện là thao tác thị giác tức thời, không phải hành động nghiệp vụ quan trọng — không nên để lỗi mạng/API ảnh hưởng tới trải nghiệm đổi màu ngay của người dùng.

## BR-04: Ngôn ngữ chỉ đồng bộ theo thiết bị, không đồng bộ đa thiết bị
- Khác với Theme (BR-02), lựa chọn ngôn ngữ **chỉ lưu tại `localStorage` của trình duyệt/thiết bị hiện tại**, không lưu DB, không đồng bộ khi đăng nhập ở thiết bị khác.
- **Lý do:** Ngôn ngữ hiển thị gắn với sở thích đọc của người dùng tại từng thiết bị/trình duyệt (vd dùng máy công ty bằng tiếng Anh, máy cá nhân bằng tiếng Việt) hơn là một thuộc tính cần đồng nhất theo tài khoản; giữ phạm vi tối giản đúng yêu cầu ban đầu.

## BR-05: Phạm vi áp dụng Đa ngôn ngữ
- Đa ngôn ngữ chỉ áp dụng cho **nội dung tĩnh của giao diện** (label, tiêu đề, nút bấm, thông báo Toast — tái sử dụng module **E.1**) và **thông báo lỗi/thành công hệ thống trả về từ Backend**.
- Dữ liệu nghiệp vụ do người dùng/Admin tự nhập (họ tên, hồ sơ bệnh lý, nội dung chat AI...) **không được** tự động dịch.
- **Lý do:** Dịch tự động dữ liệu do người dùng nhập nằm ngoài phạm vi tính năng này, đòi hỏi tích hợp dịch máy riêng và có rủi ro sai lệch thông tin y tế.

## BR-06: Ngôn ngữ mặc định phía Backend
- Nếu request lên Backend không có header `Accept-Language`, hoặc giá trị gửi lên khác `vi`/`en`, Backend mặc định trả thông báo lỗi bằng **Tiếng Việt**.
- **Lý do:** Giữ hành vi nhất quán với toàn bộ các module trước đó (đang hardcode message tiếng Việt), tránh việc các API/service nội bộ khác (không đi qua FE, ví dụ gọi trực tiếp từ Postman/service khác) nhận về lỗi ở ngôn ngữ không xác định.
