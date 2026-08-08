# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Cập nhật thông tin cá nhân

## 1. Thông tin chung
- **Mã chức năng:** A.2.2
- **Tên chức năng:** Cập nhật thông tin cá nhân (Update Profile)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng chỉnh sửa các thông tin định danh cơ bản (Họ tên, Số điện thoại, Email) của mình, đảm bảo dữ liệu không bị trùng lặp với tài khoản khác trong hệ thống.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Form Chỉnh sửa thông tin cá nhân (Edit Profile).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│                                          CHỈNH SỬA THÔNG TIN                                           │
│                                                                                                        │
│                                          Họ và tên:                                                    │
│                                          [ Nguyễn Văn A............................................ ] │
│                                                                                                        │
│                                          Số điện thoại:                                                │
│                                          [ 0912xxxxxx.............................................. ] │
│                                                                                                        │
│                                          Email:                                                        │
│                                          [ nguyenvana@gmail.com.................................... ] │
│                                                                                                        │
│                                          [                   LƯU THAY ĐỔI            ]                 │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - Họ và tên (Bắt buộc)
  - Số điện thoại (Bắt buộc)
  - Email (Tùy chọn)
- **Quy tắc xác thực (Validation - TS Form):**
  - **Số điện thoại:** Đúng định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0), giống quy tắc BR-01 của module Xác thực.
  - **Email:** Nếu có nhập, phải đúng định dạng email chuẩn (`name@domain.com`).
  - Button "Lưu thay đổi" bị disable nếu form chưa thay đổi gì so với dữ liệu gốc, hoặc dữ liệu chưa thỏa điều kiện validate.

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `PUT /api/v1/customers/profile`
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE gửi lên (Họ tên, SĐT, Email) kèm `customerId` trích từ JWT Token.
  2. **Query DB (Postgres):** Kiểm tra trùng lặp — truy vấn bảng `customers` xem SĐT/Email mới có đang được sử dụng bởi một `id` khác (khác `customerId` hiện tại) hay không.
  3. **Xử lý kết quả:**
     - Nếu trùng: BE trả về HTTP Status `409 Conflict` kèm thông báo lỗi cho trường bị trùng (`"Số điện thoại đã được sử dụng"` hoặc `"Email đã được sử dụng"`).
     - Nếu hợp lệ: Cập nhật (`UPDATE`) bản ghi trong bảng `customers`, trả về HTTP Status `200 OK` kèm dữ liệu mới nhất.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Định dạng dữ liệu gửi lên bị sai (FE lọt Validation) | Toast lỗi: "Dữ liệu không hợp lệ" |
| `409 Conflict` | Số điện thoại/Email đã được dùng bởi tài khoản khác | Text đỏ dưới input tương ứng: "Đã tồn tại" |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |
