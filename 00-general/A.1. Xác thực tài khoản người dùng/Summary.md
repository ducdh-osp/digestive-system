# Mô tả Luồng hoạt động (Workflow) - Xác thực tài khoản

Tài liệu này tổng hợp luồng đi (Flow) của hệ thống khi người dùng (Customer) thực hiện quá trình Đăng ký và Đăng nhập.

## 1. Luồng Đăng ký tài khoản (Sign-up Flow)
**Mục đích:** Đảm bảo khách hàng đăng ký bằng số điện thoại chính chủ.

1. **Bước 1 (FE):** Khách hàng vào trang Đăng ký, nhập Họ tên, Số điện thoại, và Mật khẩu.
2. **Bước 2 (FE):** FE validate dữ liệu hợp lệ (Pass >= 8, SĐT đúng chuẩn). Bấm "Đăng ký".
3. **Bước 3 (BE):** API `/api/v1/auth/register` tiếp nhận. Query DB kiểm tra SĐT. 
   - Nếu đã tồn tại: Báo lỗi 409.
   - Nếu chưa tồn tại: BE sinh ngẫu nhiên mã OTP 6 số, gọi dịch vụ SMS (hoặc giả lập) để gửi mã tới SĐT.
4. **Bước 4 (FE):** Nhận HTTP 200, chuyển khách hàng sang trang Nhập OTP. Kích hoạt đồng hồ 180s.
5. **Bước 5 (FE -> BE):** Khách hàng nhập OTP. FE gọi API `/api/v1/auth/verify-otp`, gửi kèm lại toàn bộ Họ tên/Mật khẩu đã nhập ở Bước 1 (Backend không lưu tạm dữ liệu này ở Bước 3).
6. **Bước 6 (BE):** BE kiểm tra bảng `otp_logs`.
   - Nếu OTP hợp lệ: Mã hoá Mật khẩu (Bcrypt), lưu thông tin tài khoản vào bảng `customers`. Cập nhật trạng thái OTP là đã dùng. Sinh `JWT Token`.
7. **Bước 7 (FE):** Nhận JWT Token, tự động đăng nhập và chuyển hướng khách hàng vào Trang chủ.

---

## 2. Luồng Đăng nhập (Login Flow)
**Mục đích:** Cấp quyền truy cập cho khách hàng đã có tài khoản.

1. **Bước 1 (FE):** Khách hàng nhập SĐT và Mật khẩu tại màn hình Đăng nhập.
2. **Bước 2 (FE -> BE):** Gọi API `/api/v1/auth/login`.
3. **Bước 3 (BE):** 
   - Query DB lấy User theo SĐT. (Nếu không có -> Lỗi 401).
   - Dùng Bcrypt verify Hash Password. (Nếu sai -> Lỗi 401).
   - Nếu đúng: Generate Access Token (JWT) và Refresh Token.
4. **Bước 4 (FE):** Nhận Token, lưu vào Local Storage hoặc Cookie. Đính kèm Token vào Header (`Authorization: Bearer <token>`) cho mọi API request sau này. Chuyển hướng vào Trang chủ.
