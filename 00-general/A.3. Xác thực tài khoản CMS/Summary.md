# Mô tả Luồng hoạt động (Workflow) - Xác thực tài khoản CMS

Tài liệu này tổng hợp luồng đi (Flow) của hệ thống khi Quản trị viên (Admin) thực hiện đăng nhập vào khu vực quản trị (CMS).

## 1. Luồng Đăng nhập Quản trị (Admin Login Flow)
**Mục đích:** Cấp quyền truy cập CMS cho Quản trị viên, độc lập hoàn toàn với luồng đăng nhập Customer (module A.1).

1. **Bước 1 (FE):** Admin vào trang đăng nhập riêng `/admin/login`, nhập Username/Email và Mật khẩu.
2. **Bước 2 (FE -> BE):** Gọi API `/api/v1/admin/auth/login`.
3. **Bước 3 (BE):**
   - Dùng Hibernate query bảng `admins` (MySQL, khởi tạo tại V1/V2) theo Username/Email. (Nếu không có -> Lỗi 401).
   - Dùng Bcrypt verify Hash Password. (Nếu sai -> Lỗi 401).
   - Kiểm tra `is_active`. (Nếu bị khoá -> Lỗi 403).
   - Nếu hợp lệ: Generate JWT (Access + Refresh Token) với `Subject` gắn tiền tố `ADMIN:` và thông tin `role`.
4. **Bước 4 (FE):** Nhận Token, lưu riêng vào `adminAccessToken`/`adminRefreshToken` (tách biệt với Token Customer). Điều hướng vào `/admin/dashboard` chung (chưa phân vùng giao diện theo `role` — xem cảnh báo Gap tại BR-05 trong `Business-rule.md`).

> Ghi chú: Đây là luồng độc lập với module **A.1. Xác thực tài khoản người dùng** (dành cho Customer) — hai module chỉ dùng chung cơ chế Prefix Authentication (`ADMIN:` / `CUSTOMER:`) trong JWT để Backend phân luồng dữ liệu đúng Database.
