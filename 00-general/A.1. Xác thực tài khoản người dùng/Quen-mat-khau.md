# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Quên mật khẩu

## 1. Thông tin chung
- **Mã chức năng:** A.1.4
- **Tên chức năng:** Khôi phục mật khẩu (Forgot Password)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Hỗ trợ khách hàng lấy lại quyền truy cập tài khoản thông qua xác thực OTP SMS khi họ quên mật khẩu đăng nhập.

## 3. Yêu cầu giao diện & Frontend (FE)
Tính năng chia làm 2 màn hình:
1. **Màn hình Nhập Số điện thoại:** Yêu cầu khách hàng nhập SĐT đã đăng ký.
2. **Màn hình Đặt lại Mật khẩu:** Nhập mã OTP và Mật khẩu mới.

### 3.1. Chức năng (Functional)
- **Bước 1 (Gửi yêu cầu):** Khách hàng nhập SĐT hợp lệ. Nếu SĐT tồn tại trong hệ thống, chuyển hướng sang Bước 2.
- **Bước 2 (Xác thực & Đổi mật khẩu):**
  - Nhập OTP 6 số.
  - Nhập Mật khẩu mới và Xác nhận mật khẩu mới.
  - Nếu trùng khớp và OTP đúng, thông báo thành công và chuyển hướng về trang Đăng nhập.

## 4. Yêu cầu Backend (BE)
### 4.1. API Yêu cầu cấp OTP
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Logic:**
  1. Kiểm tra SĐT có tồn tại và trạng thái kích hoạt. Nếu không, trả lỗi `404 Not Found` hoặc `403 Forbidden`.
  2. Áp dụng quy tắc chống Spam (BR-04): Tối đa 5 lần gửi/ngày.
  3. Sinh mã OTP 6 số và lưu vào `otp_logs` (thời hạn 3 phút).
  4. Trả về `200 OK` (Mã đã gửi).

### 4.2. API Đặt lại mật khẩu
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Logic:**
  1. Kiểm tra mã OTP: Phải chưa sử dụng, chưa hết hạn, và đúng với SĐT.
  2. Đánh dấu OTP là đã sử dụng (BR-05).
  3. Mã hóa Mật khẩu mới bằng thuật toán BCrypt.
  4. Cập nhật vào DB (`customers`).
  5. Trả về `200 OK`.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Cảnh báo tương ứng | Xử lý UI |
|---|---|---|
| `404 Not Found` | Số điện thoại không tồn tại | Hiển thị cảnh báo màu đỏ dưới ô nhập SĐT. |
| `429 Too Many Requests` | Vượt quá 5 lần gửi OTP | Thông báo (Toast) yêu cầu thử lại vào hôm sau. |
| `400 Bad Request` | OTP sai hoặc hết hạn | Hiển thị cảnh báo dưới ô nhập OTP. |
