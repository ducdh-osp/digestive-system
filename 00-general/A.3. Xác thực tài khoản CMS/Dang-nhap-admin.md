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
  - Dựa vào `role` trả về trong Token/Response, FE thực hiện định tuyến (routing) vào đúng khu vực giao diện CMS tương ứng (Ví dụ: `SUPER_ADMIN` → Trang quản trị toàn hệ thống; `DOCTOR` → Trang quản lý hồ sơ bệnh nhân).

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
  6. **Trả kết quả:** Trả về HTTP Status `200 OK` kèm `accessToken`, thông tin Admin (`id`, `username`, `role`) để FE thực hiện định tuyến UI theo Role.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Sai Username/Email hoặc Mật khẩu | "Tài khoản hoặc mật khẩu không chính xác." |
| `403 Forbidden` | Tài khoản Admin bị khóa (`is_active = FALSE`) | "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên cấp cao." |
| `500 Internal Error` | Lỗi server chưa xác định | Toast: "Hệ thống đang bận, vui lòng thử lại sau." |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `admins` (Lưu trữ trên MySQL - File V1, cập nhật tại V2)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `BIGINT` | **`PRIMARY KEY`**, `AUTO_INCREMENT` | Khóa chính, do Hibernate/MySQL tự sinh |
| **`username`** | `VARCHAR(50)` | `NOT NULL`, **`UNIQUE`** | Tên đăng nhập |
| **`email`** | `VARCHAR(100)` | `NOT NULL`, **`UNIQUE`** | Email (có thể dùng thay Username để đăng nhập) |
| **`password_hash`** | `VARCHAR(255)` | `NOT NULL` | Chuỗi mật khẩu đã mã hoá Bcrypt |
| **`role`** | `ENUM('SUPER_ADMIN','DOCTOR', ...)` | `NOT NULL` | Vai trò, quyết định phạm vi truy cập và định tuyến UI trên CMS |
| **`is_active`** | `BOOLEAN` | `DEFAULT TRUE` | Trạng thái hoạt động của tài khoản |
| **`created_at`** | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời gian tạo tài khoản |

> [!NOTE]
> *Tài khoản `admins` không có cơ chế tự đăng ký (self sign-up) như Customer. Tài khoản Admin đầu tiên (`SUPER_ADMIN`) được seed sẵn (mật khẩu mã hoá Bcrypt) trong migration `V1`/`V2`, các tài khoản Admin sau đó do `SUPER_ADMIN` tạo qua chức năng quản lý nội bộ (nằm ngoài phạm vi UC A.3.1). `role` thực tế được chuẩn hoá thành bảng `roles` riêng (quan hệ với `admins`) thay vì cột `ENUM` trực tiếp — tuỳ theo thiết kế cuối cùng của đội Dev.*
