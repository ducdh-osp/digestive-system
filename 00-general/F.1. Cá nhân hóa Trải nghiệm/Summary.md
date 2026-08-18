# Mô tả Luồng hoạt động (Workflow) - Cá nhân hóa Trải nghiệm

Tài liệu này tổng hợp luồng đi (Flow) của 2 tính năng thuộc module Cá nhân hóa Trải nghiệm: chuyển đổi Giao diện Tối/Sáng (Dark Mode) và chuyển đổi Ngôn ngữ (Việt - Anh). Cả 2 đều là tuỳ chọn cá nhân, áp dụng chung cho cả Customer và Admin, ưu tiên xử lý ở Frontend, Backend chỉ hỗ trợ ở mức tối thiểu.

## 1. Luồng chuyển đổi Giao diện (Dark Mode Flow)
**Mục đích:** Cho phép người dùng chọn giao diện Sáng/Tối theo sở thích, ghi nhớ lựa chọn cho lần truy cập sau.

1. **Bước 1 (FE):** Khi ứng dụng khởi động, FE đọc giá trị theme đã lưu trong `localStorage` của thiết bị và áp class `dark` lên thẻ `<html>` trước khi React render (tránh nháy giao diện sai màu).
2. **Bước 2 (FE):** Nếu thiết bị chưa từng lưu theme nhưng người dùng đã đăng nhập, FE lấy giá trị `theme` đồng bộ từ Backend (trả kèm trong API lấy hồ sơ) và ghi lại vào `localStorage` của thiết bị hiện tại.
3. **Bước 3 (FE):** Người dùng bấm nút Toggle trên Header. FE đổi class `dark` ngay lập tức (không loading) và ghi đè giá trị mới vào `localStorage`.
4. **Bước 4 (FE -> BE, tuỳ chọn):** Nếu người dùng đã đăng nhập, FE gọi ngầm API `PUT /api/v1/profile/theme` để đồng bộ lựa chọn lên Backend, không chặn thao tác đổi giao diện, không hiển thị loading/toast.
5. **Bước 5 (BE):** Cập nhật cột `theme` của khách hàng tương ứng (`customer_id` trích từ JWT Token) trong bảng `customers`.

---

## 2. Luồng chuyển đổi Ngôn ngữ (Language Flow)
**Mục đích:** Cho phép người dùng chọn hiển thị giao diện bằng Tiếng Việt hoặc Tiếng Anh, áp dụng ngay không cần tải lại trang.

1. **Bước 1 (FE):** Khi ứng dụng khởi động, `react-i18next` (kết hợp `i18next-browser-languagedetector`) đọc ngôn ngữ đã lưu trong `localStorage`; nếu chưa có, tự phát hiện theo ngôn ngữ trình duyệt, mặc định Tiếng Việt nếu không khớp `vi`/`en`.
2. **Bước 2 (FE):** Người dùng bấm nút cờ chọn ngôn ngữ trên Header. FE gọi `i18n.changeLanguage()`, mọi text đã bọc qua hook `t()` cập nhật ngay lập tức, đồng thời ghi lại lựa chọn vào `localStorage`.
3. **Bước 3 (FE):** Axios Interceptor (dùng chung tầng với module **E.1**) tự động đính kèm header `Accept-Language` theo ngôn ngữ hiện tại vào mọi request gửi lên Backend.
4. **Bước 4 (BE):** Khi trả lỗi (qua `GlobalExceptionHandler`), Backend đọc header `Accept-Language`, tra cứu đúng nội dung theo mã lỗi (message code) trong file tài nguyên `messages_vi.properties`/`messages_en.properties` tương ứng, trả về đúng ngôn ngữ FE đang dùng.

> Ghi chú: Khác với Dark Mode (có tuỳ chọn đồng bộ đa thiết bị qua DB), lựa chọn ngôn ngữ **chỉ lưu tại `localStorage` của từng thiết bị**, không đồng bộ qua Backend — xem BR-04 tại `Business-rule.md`.
