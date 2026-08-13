# Mô tả Luồng hoạt động (Workflow) - Thông báo Cá nhân

Tài liệu này tổng hợp luồng đi (Flow) của hệ thống khi khách hàng (Customer) quản lý danh sách thông báo và khi hệ thống đẩy thông báo nhắc thuốc theo thời gian thực.

## 1. Luồng Quản lý danh sách thông báo (Notification List Flow)
**Mục đích:** Cho phép khách hàng xem lại, đánh dấu đã đọc, và xoá thông báo.

1. **Bước 1 (FE):** Khách hàng vào ứng dụng, FE gọi API `/api/v1/notifications` (GET) để lấy danh sách và `unreadCount`, hiển thị Badge trên icon chuông.
2. **Bước 2 (FE):** Khách hàng bấm vào icon chuông, mở panel danh sách thông báo.
3. **Bước 3 (FE -> BE):** Khách hàng bấm vào 1 thông báo. FE gọi API `/api/v1/notifications/{id}/read` (PUT).
4. **Bước 4 (BE):** Cập nhật `is_read = TRUE`, `read_at = NOW()` cho đúng bản ghi thuộc khách hàng đó.
5. **Bước 5 (FE):** Cập nhật lại giao diện (bỏ chấm xanh, giảm Badge). Nếu thông báo có điều hướng liên quan, chuyển khách hàng tới màn hình tương ứng.

---

## 2. Luồng Nhận thông báo Realtime — Nhắc thuốc (Realtime Push Flow)
**Mục đích:** Đẩy thông báo nhắc uống thuốc tới đúng khách hàng ngay khi đến giờ, không cần khách hàng chủ động tải lại trang.

1. **Bước 1 (BE):** Scheduler (chạy định kỳ mỗi phút) quét lịch uống thuốc, phát hiện khách hàng X đến giờ uống thuốc.
2. **Bước 2 (BE):** Ghi bản ghi mới vào bảng `notifications` (`type = MEDICATION_REMINDER`).
3. **Bước 3 (BE):** Tra cứu Registry kết nối Realtime (SSE/WebSocket) theo `customerId` của khách hàng X.
   - Nếu đang có kết nối mở: Đẩy sự kiện ngay qua kênh đó.
   - Nếu không: Bỏ qua bước đẩy — thông báo vẫn nằm sẵn trong DB.
4. **Bước 4 (FE):** Component lắng nghe nhận được sự kiện, hiển thị Toast/Popup nhắc nhở (tái sử dụng cơ chế Toast của module **E.1**), đồng thời cập nhật Badge và chèn thêm item mới vào danh sách thông báo mà không cần gọi lại API GET.

> Ghi chú: Luồng Realtime này cần dùng chung hạ tầng SSE/WebSocket với tính năng AI Chat (nếu được xây dựng), do tại thời điểm viết tài liệu, hạ tầng đó **chưa tồn tại** trong source code — xem chi tiết ghi chú kỹ thuật tại `Nhac-thuoc-realtime.md`.
