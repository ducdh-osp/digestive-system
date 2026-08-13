# Tập luật nghiệp vụ (Business Rules) - Thông báo Cá nhân

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Thông báo Cá nhân (E.2).

## BR-01: Sở hữu dữ liệu theo Khách hàng (Data Ownership)
- Mỗi thông báo (`notifications`) chỉ thuộc về đúng 1 khách hàng (`customer_id`).
- **Quy tắc:** Mọi API (GET/PUT/DELETE) bắt buộc phải lọc và kiểm tra theo `customer_id` trích từ JWT Token của người gọi. Không cho phép một khách hàng xem/sửa/xoá thông báo của khách hàng khác dù biết chính xác `id` bản ghi (trả `404 Not Found` thay vì `403 Forbidden` để tránh lộ thông tin tồn tại của bản ghi).

## BR-02: Trạng thái Đã đọc chỉ thay đổi 1 chiều
- Một thông báo khi đã được đánh dấu `is_read = TRUE` thì không tự động quay lại trạng thái chưa đọc.
- **Quy tắc:** Cột `read_at` chỉ được ghi nhận **lần đầu tiên** chuyển trạng thái; các lần gọi API đánh dấu đã đọc sau đó (nếu có) không ghi đè lại giá trị `read_at` cũ.

## BR-03: Nguồn phát sinh thông báo phải ghi DB trước khi đẩy Realtime
- Bất kỳ thông báo nào (kể cả loại `MEDICATION_REMINDER` được đẩy Realtime ở E.2.2) đều bắt buộc phải được `INSERT` vào bảng `notifications` **trước hoặc đồng thời** với việc đẩy sự kiện Realtime.
- **Lý do:** Đảm bảo khách hàng không mất thông báo nếu đang offline tại thời điểm phát sinh — xem lại được sau trong danh sách (E.2.1).

## BR-04: Định danh kênh Realtime theo Khách hàng
- Kênh kết nối Realtime (SSE/WebSocket) phải được ánh xạ (map) chính xác 1-1 theo `customerId`, xác thực qua JWT Token khi khởi tạo kết nối.
- **Quy tắc:** Không đẩy sự kiện broadcast toàn hệ thống cho tính năng Nhắc thuốc — chỉ đẩy đúng tới kết nối của khách hàng sở hữu lịch uống thuốc đó.

## BR-05: Dọn dẹp kết nối Realtime
- Khi khách hàng đăng xuất, đóng tab, hoặc kết nối timeout, Backend phải chủ động gỡ bỏ (remove) kết nối khỏi Registry đang quản lý, tránh rò rỉ bộ nhớ (Memory Leak) khi số lượng khách hàng tăng lên.
