# Tập luật nghiệp vụ (Business Rules) - Nhật ký & Biểu đồ

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Nhật ký & Biểu đồ (C.1).

## BR-01: Sở hữu dữ liệu theo Khách hàng (Data Ownership)
- Mỗi bản ghi (`meal_logs`, `bristol_logs`) chỉ thuộc về đúng 1 khách hàng (`customer_id`).
- **Quy tắc:** Mọi API (GET/POST/DELETE) bắt buộc phải lọc và kiểm tra theo `customer_id` trích từ JWT Token của người gọi. Không cho phép một khách hàng xem/xoá/xem biểu đồ tổng hợp của khách hàng khác dù biết chính xác `id` bản ghi — trả `404 Not Found` thay vì `403 Forbidden` để tránh lộ thông tin tồn tại của bản ghi (đồng nhất nguyên tắc với BR-01 module **E.2**).

## BR-02: Không giới hạn số lượng bản ghi trong ngày
- Khách hàng có thể ghi nhiều nhật ký ăn uống và nhiều đánh giá Bristol trong cùng 1 ngày, không có ràng buộc "1 bản ghi/ngày" ở tầng DB hay Service.
- **Lý do:** Số bữa ăn và số lần đi vệ sinh khác nhau theo từng người, không thể chuẩn hoá thành 1 lần cố định/ngày.

## BR-03: Không cho phép ghi log ở thời điểm tương lai
- Cả `meal_time` (`meal_logs`) và `log_time` (`bristol_logs`) đều không được lớn hơn thời điểm hiện tại (`NOW()`).
- **Quy tắc:** Validate ở cả FE (chặn chọn ngày/giờ tương lai trên DatePicker) và BE (kiểm tra lại trước khi `INSERT`, trả `400 Bad Request` nếu vi phạm) — không tin tưởng hoàn toàn vào validate phía Client.

## BR-04: Xoá là xoá cứng, không cần lưu vết
- Khác với `notifications` (E.2, dùng Soft-delete để phục vụ audit thông báo hệ thống), việc xoá `meal_logs`/`bristol_logs` là **hành động sửa lỗi nhập liệu cá nhân** của khách hàng, không phục vụ mục đích audit.
- **Quy tắc:** `DELETE` thẳng khỏi DB (Hard-delete), không cần cột `is_deleted`/`deleted_at`.

## BR-05: Giới hạn khoảng thời gian truy vấn biểu đồ
- API tổng hợp cho Biểu đồ sức khỏe (C.1.3) chỉ chấp nhận khoảng `[from, to]` tối đa **90 ngày** cho 1 lần gọi.
- **Lý do:** Tránh query `GROUP BY` quét toàn bộ lịch sử nhiều năm của 1 khách hàng trong 1 request, ảnh hưởng hiệu năng khi dữ liệu tích luỹ lâu dài.
