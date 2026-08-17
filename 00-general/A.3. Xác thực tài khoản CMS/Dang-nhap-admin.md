# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đăng nhập Quản trị (Admin CMS)

## 1. Thông tin chung
- **Mã chức năng:** A.3.1
- **Tên chức năng:** Đăng nhập Quản trị (Admin Login)
- **Tác nhân (Actor):** Quản trị viên (Admin — bao gồm các Role như `SUPER_ADMIN`, `DOCTOR`, v.v.)
- **Cơ sở dữ liệu:** MySQL

## 2. Mục tiêu
Cho phép Quản trị viên đăng nhập vào hệ thống quản trị (CMS) qua một giao diện độc lập, tách biệt hoàn toàn với luồng đăng nhập của Khách hàng (Customer), để quản lý dữ liệu và vận hành hệ thống Gastro AI.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Trang đăng nhập riêng cho CMS — `/admin/login` (Giao diện chuyên biệt, tách biệt route với App Customer).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│                                          GASTRO AI - CMS QUẢN TRỊ                                      │
│                                                                                                        │
│                                          Username hoặc Email:                                          │
│                                          [ Nhập username hoặc email................................ ] │
│                                                                                                        │
│                                          Mật khẩu:                                                     │
│                                          [ Nhập mật khẩu........................................ ] [👁] │
│                                                                                                        │
│                                          [                   ĐĂNG NHẬP               ]                 │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - Username hoặc Email (Bắt buộc)
  - Mật khẩu (Bắt buộc)
- **Khác biệt so với luồng Customer (module A.1):**
  - Đăng nhập bằng **Username hoặc Email**, không dùng Số điện thoại.
  - **Không** hỗ trợ đăng nhập bằng mã OTP.
  - **Không** có link "Đăng ký" — tài khoản Admin chỉ được tạo bởi `SUPER_ADMIN` khác (không tự đăng ký công khai).
- **Xử lý Logic (Đăng nhập thành công):**
  - Lưu Token vào biến lưu trữ độc lập tại FE (`adminAccessToken`), tách biệt với Token của Customer (`accessToken`) để tránh xung đột phiên làm việc nếu cùng mở trên một trình duyệt.
  - Điều hướng vào trang `/admin/dashboard` chung, hiển thị `role` của Admin như một thông tin văn bản trên giao diện.

> [!WARNING]
> **Khoảng hở giữa tài liệu gốc và hiện trạng code:** Đặc tả ban đầu của UC này (và BR-05 trong `Business-rule.md`) kỳ vọng định tuyến UI khác nhau theo từng Role (`SUPER_ADMIN` → khu vực quản trị toàn hệ thống, `DOCTOR` → khu vực hồ sơ bệnh nhân...). Ở bản hiện tại, code **chưa triển khai** cơ chế này — mọi Role sau khi đăng nhập thành công đều được điều hướng vào **cùng một** route `/admin/dashboard` duy nhất, chưa có phân vùng giao diện hay chặn quyền theo Role ở tầng API. Đây là hạng mục cần lên kế hoạch bổ sung riêng (không thuộc phạm vi sửa nhanh của lần rà soát tài liệu này) — BA cần làm việc với Dev để xác nhận có đưa vào backlog hay không.

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `POST /api/v1/admin/auth/login`
- **Database Migration:**
  - Bảng `admins` (kèm bảng `roles`) được khởi tạo tại `V1__init_mysql_schema.sql` và cập nhật cấu trúc tại `V2__update_admins_table.sql` (MySQL). Không cần tạo file migration mới cho UC này.
- **Công nghệ:** Sử dụng **Hibernate** (JPA) để truy vấn dữ liệu Admin từ MySQL.
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE (Username/Email, Mật khẩu raw).
  2. **Query Admin:** Dùng Hibernate truy vấn bảng `admins` theo `username` hoặc `email`.
     - Nếu không tìm thấy: Trả về lỗi `401 Unauthorized`.
  3. **Verify Hash Password:** Dùng Bcrypt `verify()` so sánh mật khẩu raw với `password_hash` đã lưu trong DB.
     - Nếu không khớp: Trả về lỗi `401 Unauthorized`.
  4. **Kiểm tra Role & trạng thái:** Kiểm tra tài khoản có đang `is_active = TRUE` hay không.
     - Nếu bị khoá: Trả về lỗi `403 Forbidden`.
  5. **Sinh Token:** BE lấy thông tin định danh (`id`, `username`, `role`) để Sign thành JWT, gắn tiền tố `ADMIN:` vào `Subject` (theo BR-08 của module A.1) để `UserDetailsServiceImpl` phân biệt được với luồng Customer.
  6. **Trả kết quả:** Trả về HTTP Status `200 OK` kèm **cả `accessToken` lẫn `refreshToken`** (không chỉ `accessToken`), cùng thông tin Admin (`id`, `username`, `email`, `role`).

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Sai Username/Email hoặc Mật khẩu | "Tài khoản hoặc mật khẩu không chính xác." |
| `403 Forbidden` | Tài khoản Admin bị khóa (`is_active = FALSE`) | "Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập." |
| `500 Internal Error` / lỗi khác | Lỗi server hoặc lỗi kết nối chưa xác định | "Lỗi kết nối tới máy chủ." |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `admins` (Lưu trữ trên MySQL - File V1, cập nhật tại V2)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `INT` | **`PRIMARY KEY`**, `AUTO_INCREMENT` | Khóa chính |
| **`username`** | `VARCHAR(255)` | `NOT NULL`, **`UNIQUE`** | Tên đăng nhập |
| **`email`** | `VARCHAR(255)` | `NOT NULL`, **`UNIQUE`** | Email (có thể dùng thay Username để đăng nhập) |
| **`password_hash`** | `VARCHAR(255)` | `NOT NULL` (bổ sung tại `V2`, mặc định `''` cho các bản ghi cũ nếu có) | Chuỗi mật khẩu đã mã hoá Bcrypt |
| **`role_id`** | `INT` | `NOT NULL`, `FOREIGN KEY -> roles(id)` | Khoá ngoại trỏ tới bảng `roles`, quyết định phạm vi truy cập trên CMS |
| **`is_active`** | `BOOLEAN` | `DEFAULT TRUE` | Trạng thái hoạt động của tài khoản |
| **`last_login`** | `DATETIME` | Nullable | Thời điểm đăng nhập gần nhất (chưa được cập nhật tự động trong luồng đăng nhập hiện tại — xem mục Ngoại lệ/Ghi chú) |

**Bảng: `roles` (Lưu trữ trên MySQL - File V1)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `INT` | **`PRIMARY KEY`**, `AUTO_INCREMENT` | Khóa chính |
| **`role_name`** | `VARCHAR(255)` | `NOT NULL`, **`UNIQUE`** | Tên vai trò (`SUPER_ADMIN`, `DOCTOR`, `CONTENT_CREATOR`) |
| **`description`** | `TEXT` | Nullable | Mô tả vai trò |

> [!NOTE]
> *Tài khoản `admins` không có cơ chế tự đăng ký (self sign-up) như Customer. Tài khoản Admin đầu tiên (`SUPER_ADMIN`, `username='admin'`) được seed sẵn tại `V2__update_admins_table.sql` (không phải V1 — `password_hash` chỉ tồn tại từ V2 trở đi), các tài khoản Admin sau đó do `SUPER_ADMIN` tạo qua chức năng quản lý nội bộ (nằm ngoài phạm vi UC A.3.1). Bảng `admins` **không có cột `created_at`** — chỉ có `last_login` (hiện chưa được service cập nhật khi đăng nhập).*
