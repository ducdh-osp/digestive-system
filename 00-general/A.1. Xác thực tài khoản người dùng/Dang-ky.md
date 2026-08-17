# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đăng ký tài khoản

## 1. Thông tin chung
- **Mã chức năng:** A.1.1
- **Tên chức năng:** Đăng ký tài khoản (Customer Registration)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng mới đăng ký tài khoản vào hệ thống Gastro AI thông qua số điện thoại cá nhân.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Màn hình Đăng ký tài khoản (Sign-up)

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│   [  Hình ảnh minh hoạ  ]               ĐĂNG KÝ TÀI KHOẢN MỚI                                          │
│   [   Gastro AI App     ]                                                                              │
│   [                     ]               Họ và tên:                                                     │
│                                         [ Nhập họ và tên của bạn.................................... ] │
│                                                                                                        │
│                                         Số điện thoại:                                                 │
│                                         [ Nhập số điện thoại........................................ ] │
│                                                                                                        │
│                                         Mật khẩu:                                                      │
│                                         [ Nhập mật khẩu........................................ ] [👁] │
│                                                                                                        │
│                                         Xác nhận mật khẩu:                                             │
│                                         [ Nhập lại mật khẩu.................................... ] [👁] │
│                                                                                                        │
│                                         [                  ĐĂNG KÝ                 ]                   │
│                                                                                                        │
│                                         Đã có tài khoản? [Đăng nhập ngay]                              │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - Họ và tên (Bắt buộc)
  - Số điện thoại (Bắt buộc)
  - Mật khẩu (Bắt buộc)
  - Xác nhận mật khẩu (Bắt buộc)
- **Quy tắc xác thực (Validation - TS Form):**
  - **Số điện thoại:** Chỉ nhận số, đúng định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0).
  - **Mật khẩu:** Độ dài tối thiểu >= 8 ký tự (`Pass >= 8`). Hiển thị lỗi màu đỏ nếu nhập dưới 8 ký tự.
  - **Xác nhận mật khẩu:** Phải trùng khớp tuyệt đối với trường Mật khẩu.
  - Button "Đăng ký" sẽ bị disable (mờ đi) nếu các trường chưa thoả mãn điều kiện validate.

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `POST /api/v1/auth/register`
- **Database Migration:** 
  - Bảng `customers` được khởi tạo tại `V1__init_postgres_schema.sql` và cập nhật cấu trúc (thêm `created_at`, `updated_at`) tại `V2__update_customers_table.sql` (PostgreSQL). Không cần tạo file migration mới cho UC này.
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE gửi lên (Họ tên, SĐT, Mật khẩu).
  2. **Query DB (Postgres):** Truy vấn kiểm tra xem Số điện thoại này đã tồn tại trong bảng `customers` hay chưa (kiểm tra trùng lặp).
  3. **Xử lý kết quả:**
     - Nếu đã tồn tại: BE trả về HTTP Status `409 Conflict` kèm thông báo lỗi `"Số điện thoại đã được đăng ký"`.
     - Nếu chưa tồn tại: BE **chỉ sinh mã OTP và lưu vào bảng `otp_logs`** (chưa tạo bản ghi `customers` ở bước này — Họ tên/Mật khẩu chưa được lưu trữ tạm ở đâu cả), gửi mã về SĐT của khách hàng, và trả về HTTP Status `200 OK` để FE chuyển sang màn hình Xác thực OTP.
- **Lưu ý quan trọng (thiết kế "resend"):** Vì tài khoản `customers` chỉ thực sự được tạo ở bước Xác thực OTP (A.1.2), nút "Gửi lại mã" ở màn OTP gọi lại **chính API `/api/v1/auth/register`** này (không có API resend riêng) — hợp lệ vì SĐT vẫn chưa tồn tại trong `customers` tại thời điểm đó.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Định dạng dữ liệu gửi lên bị sai (FE lọt Validation) | Toast lỗi: "Dữ liệu không hợp lệ" |
| `409 Conflict` | Số điện thoại đã được đăng ký | Text đỏ dưới input SĐT: "Số điện thoại đã tồn tại" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `customers` (Lưu trữ trên PostgreSQL)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính, tự sinh bằng hàm UUID của Postgres |
| **`full_name`** | `TEXT` | `NOT NULL` | Họ và tên khách hàng |
| **`phone_number`** | `TEXT` | `NOT NULL`, **`UNIQUE`** | Số điện thoại (Dùng để đăng nhập) |
| **`email`** | `TEXT` | `UNIQUE` | Email (Có thể cập nhật sau) |
| **`password_hash`**| `TEXT` | `NOT NULL` | Chuỗi mật khẩu đã bị mã hoá Bcrypt |
| **`is_active`** | `BOOLEAN` | `DEFAULT TRUE` | Trạng thái hoạt động của tài khoản |
| **`avatar_url`** | `TEXT` | Nullable | Đường dẫn ảnh đại diện — bổ sung tại `V6__add_avatar_to_customers.sql`, chi tiết xem module **A.2.5** |
| **`created_at`** | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo tài khoản — bổ sung tại `V2__update_customers_table.sql` |
| **`updated_at`** | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật gần nhất — bổ sung tại `V2__update_customers_table.sql` |

> [!NOTE]
> *Đây là cấu trúc đầy đủ, hiện hành của bảng `customers` (tổng hợp qua 3 lần migration: `V1` khởi tạo, `V2` bổ sung `created_at`/`updated_at`, `V6` bổ sung `avatar_url` cho module A.2.5). Cột `email` tồn tại sẵn từ `V1` nhưng không đóng vai trò gì trong luồng A.1 (đăng ký/đăng nhập/quên mật khẩu chỉ dùng SĐT) — dự phòng cho các tính năng hồ sơ ở module A.2.*
