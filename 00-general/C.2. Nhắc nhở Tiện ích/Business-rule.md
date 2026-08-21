# Tập luật nghiệp vụ (Business Rules) - Nhắc nhở Tiện ích

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Nhắc nhở Tiện ích (C.2).

## BR-01: Sở hữu dữ liệu theo Khách hàng (Data Ownership)
- Mỗi lịch uống thuốc (`medication_reminders`) chỉ thuộc về đúng 1 khách hàng (`customer_id`).
- **Quy tắc:** Mọi API (GET/POST/PUT/DELETE) bắt buộc lọc và kiểm tra theo `customer_id` trích từ JWT Token — trả `404 Not Found` (không phải `403`) khi truy cập lịch không thuộc về mình, đồng nhất nguyên tắc với BR-01 module **E.2**/**C.1**.

## BR-02: Mỗi bản ghi tương ứng đúng 1 giờ nhắc/ngày
- Một bản ghi `medication_reminders` chỉ mang đúng 1 giá trị `reminder_time`, lặp lại hàng ngày trong khoảng `start_date`–`end_date`.
- **Quy tắc:** Thuốc cần uống nhiều lần/ngày phải được khai báo thành **nhiều bản ghi riêng biệt**, không gộp nhiều giờ vào 1 bản ghi (tránh mô hình dữ liệu phức tạp không cần thiết ở phạm vi MVP).

## BR-03: Scheduler chỉ quét lịch đang hiệu lực
- Job quét mỗi phút chỉ xét các bản ghi thoả cả 3 điều kiện: `is_active = TRUE`, `reminder_time` khớp giờ:phút hiện tại, và ngày hiện tại nằm trong khoảng `[start_date, end_date]` (coi `NULL` là không giới hạn ở đầu tương ứng).
- **Lý do:** Tránh nhắc nhầm cho lịch đã bị tạm tắt hoặc đã hết thời hạn dùng thuốc.

## BR-04: Phải ghi DB trước khi đẩy Realtime
- Bất kỳ thông báo `MEDICATION_REMINDER` nào do Scheduler sinh ra đều bắt buộc `INSERT` vào bảng `notifications` **trước hoặc đồng thời** với việc đẩy sự kiện Realtime (kế thừa nguyên văn BR-03 của module **E.2**).
- **Lý do:** Đảm bảo khách hàng không mất thông báo nếu đang offline tại đúng thời điểm phát sinh — vẫn xem lại được sau qua **E.2.1**.

## BR-05: Tắt (is_active = false) khác với Xoá
- Công tắc Bật/Tắt trên mỗi lịch chỉ đổi cờ `is_active`, **không xoá** bản ghi khỏi DB — khách hàng có thể bật lại bất kỳ lúc nào mà không cần khai báo lại từ đầu.
- **Quy tắc:** Chỉ hành động "Xoá" (nút riêng, có xác nhận) mới `DELETE` bản ghi khỏi `medication_reminders`.

## BR-06: Giờ nhắc theo múi giờ Server, chưa hỗ trợ đa múi giờ khách hàng
- Toàn bộ so khớp `reminder_time` trong Job Scheduler dùng múi giờ hệ thống của Server (giả định `Asia/Ho_Chi_Minh`, UTC+7).
- **Quy tắc:** Không tự suy diễn múi giờ theo vị trí khách hàng — nếu về sau cần hỗ trợ đa múi giờ, phải bổ sung cột timezone riêng ở `customers` và cập nhật lại logic so khớp của Job, đây **không** thuộc phạm vi hiện tại.
