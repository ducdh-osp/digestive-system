# Tập luật nghiệp vụ (Business Rules) - Xác thực tài khoản CMS

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Xác thực CMS (Admin).

## BR-01: Độc lập cơ sở dữ liệu với Customer
- Dữ liệu Quản trị viên (Admin) lưu trữ hoàn toàn tách biệt tại **MySQL** (bảng `admins`), không dùng chung Database PostgreSQL với Customer (module A.1/A.2).
- **Phạm vi áp dụng:** Backend — mọi Repository/Service xử lý Admin phải trỏ tới `DataSource` của MySQL.

## BR-02: Phương thức đăng nhập
- Admin đăng nhập bằng **Username hoặc Email** kèm Mật khẩu. Không hỗ trợ đăng nhập bằng Số điện thoại hoặc mã OTP (khác với Customer ở BR-04/BR-05 của module A.1).
- Không có chức năng tự đăng ký (Self Sign-up) công khai cho Admin.

## BR-03: Mã hoá mật khẩu
- Mật khẩu Admin tuyệt đối không được lưu dạng plaintext, bắt buộc mã hoá bằng **Bcrypt** trước khi lưu vào cột `password_hash` (áp dụng cùng chuẩn BR-02 của module A.1).

## BR-04: Tiền tố định danh Token (Prefix Authentication)
- Khi cấp phát JWT cho Admin, Backend bắt buộc gắn tiền tố `ADMIN:` vào `Subject` của Token để `UserDetailsServiceImpl` phân biệt luồng dữ liệu Admin/Customer, ngăn chặn leo quyền (Privilege Escalation).
- Quy tắc này là quy tắc dùng chung với module A.1 — xem BR-08 tại `Business-rule.md` của A.1.

## BR-05: Phân quyền theo Role (Role-based Access Control)
- Mỗi Admin có đúng 1 Role (`SUPER_ADMIN`, `DOCTOR`, ...). Role quyết định phạm vi dữ liệu được truy cập và khu vực giao diện CMS được định tuyến tới sau khi đăng nhập thành công.
- Backend phải kiểm tra Role ở tầng API (Authorization), không chỉ ẩn/hiện ở Frontend.

## BR-06: Lưu trữ Token độc lập tại Frontend
- Token của Admin (`adminAccessToken`) phải được lưu trữ độc lập, tách biệt hoàn toàn với Token của Customer (`accessToken`) tại Frontend, tránh xung đột phiên làm việc khi cùng truy cập trên một trình duyệt.
