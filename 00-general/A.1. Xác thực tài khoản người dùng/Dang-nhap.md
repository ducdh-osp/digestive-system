# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đăng nhập hệ thống

## 1. Thông tin chung
- **Mã chức năng:** A.1.3
- **Tên chức năng:** Đăng nhập hệ thống (Customer Login)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng đã có tài khoản (đã hoàn tất đăng ký và xác thực) đăng nhập vào ứng dụng để sử dụng các tính năng cá nhân.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Màn hình Đăng nhập (Login).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│   [  Hình ảnh minh hoạ  ]               CHÀO MỪNG TRỞ LẠI GASTRO AI                                    │
│   [   Gastro AI App     ]                                                                              │
│   [                     ]               Số điện thoại:                                                 │
│                                         [ Nhập số điện thoại........................................ ] │
│                                                                                                        │
│                                         Mật khẩu:                                                      │
│                                         [ Nhập mật khẩu........................................ ] [👁] │
│                                                                                                        │
│                                                                                     [Quên mật khẩu?]   │
│                                                                                                        │
│                                         [                 ĐĂNG NHẬP                ]                   │
│                                                                                                        │
│                                         Chưa có tài khoản? [Đăng ký ngay]                              │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - Số điện thoại (Bắt buộc)
  - Mật khẩu (Bắt buộc)
- **Xử lý Logic (Đăng nhập thành công):**
  - **Lưu Token:** Sau khi nhận được HTTP Status 200 kèm Token từ Server, FE có trách nhiệm bóc tách và lưu trữ Token (sử dụng `localStorage`, `sessionStorage` hoặc `Secure Cookie` tùy theo thiết kế bảo mật của dự án).
  - Điều hướng khách hàng vào màn hình Trang chủ hệ thống.
  - Xử lý các request tiếp theo: FE cần đính kèm JWT Token vào Header của các API gửi lên BE (`Authorization: Bearer <token>`).

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `POST /api/v1/auth/login`
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE (Số điện thoại, Mật khẩu raw).
  2. **Query User:** Tìm kiếm trong bảng `customers` (Postgres) theo `phone_number`.
     - Nếu không tìm thấy: Trả về lỗi User không tồn tại (`401 Unauthorized` hoặc `404 Not Found`).
  3. **Verify Hash Password:** Nếu tìm thấy User, BE sử dụng thư viện BCrypt để thực hiện hàm `verify()` (so sánh chuỗi mật khẩu raw của FE truyền lên với chuỗi Password đã bị mã hóa lưu trong DB).
  4. **Xử lý kết quả kiểm tra:**
     - Nếu Password không khớp: Trả về lỗi `401 Unauthorized`.
     - Nếu Password khớp: BE lấy các thông tin định danh (ID, Phone, Role) để nén (Sign) thành một **JWT (JSON Web Token)**.
  5. **Trả kết quả:** Trả về HTTP Status `200 OK` kèm theo:
     - Dữ liệu User (Ví dụ: `id`, `fullName`, `phone`).
     - Chuỗi Token: `accessToken` (thời hạn ngắn, vd 1h) và `refreshToken` (thời hạn dài, vd 7 ngày).

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Sai SĐT hoặc Mật khẩu | "Tài khoản hoặc mật khẩu không chính xác." |
| `403 Forbidden` | Tài khoản bị khóa (Banned) | "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH." |
| `500 Internal Error` | Lỗi server chưa xác định | Toast: "Hệ thống đang bận, vui lòng thử lại sau." |

## 6. Luồng Đăng nhập Quản trị (Admin CMS)
- **API Endpoint:** `POST /api/v1/admin/auth/login`
- **Màn hình Frontend:** `/admin/login` (Giao diện chuyên biệt)
- **Cơ sở dữ liệu:** MySQL (bảng `admins`)

### 6.1. Xử lý Logic khác biệt
1. Admin đăng nhập bằng **Username hoặc Email** thay vì Số điện thoại.
2. Không hỗ trợ tính năng đăng nhập bằng mã OTP.
3. Backend sử dụng kỹ thuật **Prefix Authentication** (`ADMIN:<username>`) để phân biệt luồng dữ liệu Admin và Customer trong `UserDetailsServiceImpl`.
4. Token sau khi cấp phát phải chứa thông tin Role của Admin (`SUPER_ADMIN`, `DOCTOR`, v.v.) và được lưu trữ độc lập tại Frontend (`adminAccessToken`) để không xung đột với phiên làm việc của Customer.
