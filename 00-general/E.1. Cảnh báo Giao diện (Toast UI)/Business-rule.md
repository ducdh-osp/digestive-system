# Tập luật nghiệp vụ (Business Rules) - Cảnh báo Giao diện (Toast UI)

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend cho module Toast UI.

## BR-01: Xử lý lỗi tập trung (Centralized Error Handling)
- Toàn bộ lỗi API (`4xx`, `5xx`) bắt buộc phải được bắt tập trung tại 1 nơi duy nhất (Axios Response Interceptor), không cho phép từng màn hình/component tự viết `try/catch` riêng lẻ để hiển thị Toast lỗi.
- **Lý do:** Đảm bảo mọi lỗi trên toàn hệ thống đều được xử lý nhất quán (cùng vị trí, cùng thời gian hiển thị, cùng hành vi), tránh sót lỗi do quên xử lý ở một màn hình cụ thể.

## BR-02: Không lưu trữ (Stateless)
- Toast không được lưu vào Database và không có API riêng để truy vấn lại lịch sử.
- **Quy tắc:** Nếu nghiệp vụ yêu cầu người dùng xem lại lịch sử thông báo, phải sử dụng module **E.2. Thông báo Cá nhân (Lưu DB)**, không mở rộng phạm vi lưu trữ cho Toast.

## BR-03: Thời gian hiển thị chuẩn hoá
- Mọi Toast (trừ trường hợp đặc biệt như `401 Unauthorized` cần thao tác Logout) phải tự động biến mất (Auto-dismiss) trong khoảng **3-5 giây**, đảm bảo tính nhất quán và không gây khó chịu khi Toast tồn đọng quá lâu trên màn hình.

## BR-04: Ưu tiên xử lý riêng cho lỗi `401 Unauthorized`
- Khi gặp lỗi `401`, ngoài việc hiển thị Toast, Frontend bắt buộc phải thực hiện thêm hành động **Tự động đăng xuất** (xoá Token đang lưu) và **chuyển hướng về màn hình Đăng nhập**, không chỉ đơn thuần hiển thị thông báo.

## BR-05: Chuẩn hoá cấu trúc lỗi từ Backend
- Backend bắt buộc trả về lỗi theo cấu trúc thống nhất (Ví dụ: `{ "code": "...", "message": "..." }`) kèm đúng mã HTTP Status tương ứng bản chất lỗi.
- **Quy tắc:** Không dùng `200 OK` kèm cờ `success: false` trong body cho trường hợp lỗi — vì Interceptor xử lý dựa trên HTTP Status Code.
