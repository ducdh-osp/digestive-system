# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đổi mật khẩu

## 1. Thông tin chung
- **Mã chức năng:** A.2.3
- **Tên chức năng:** Đổi mật khẩu (Change Password)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng đã đăng nhập tự thay đổi mật khẩu của mình sau khi xác thực đúng mật khẩu hiện tại, đảm bảo an toàn tài khoản.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Form Đổi mật khẩu (Change Password).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│                                          ĐỔI MẬT KHẨU                                                  │
│                                                                                                        │
│                                          Mật khẩu hiện tại:                                            │
│                                          [ Nhập mật khẩu hiện tại.............................. ] [👁] │
│                                                                                                        │
│                                          Mật khẩu mới:                                                 │
│                                          [ Nhập mật khẩu mới................................... ] [👁] │
│                                                                                                        │
│                                          Xác nhận mật khẩu mới:                                        │
│                                          [ Nhập lại mật khẩu mới............................... ] [👁] │
│                                                                                                        │
│                                          [                   XÁC NHẬN ĐỔI MẬT KHẨU   ]                 │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - Mật khẩu hiện tại (Bắt buộc)
  - Mật khẩu mới (Bắt buộc)
  - Xác nhận mật khẩu mới (Bắt buộc)
- **Quy tắc xác thực (Validation - TS Form):**
  - **Mật khẩu mới:** Độ dài tối thiểu >= 8 ký tự (`Pass >= 8`), giống quy tắc BR-02 của module Xác thực.
  - **Xác nhận mật khẩu mới:** Phải trùng khớp tuyệt đối với trường Mật khẩu mới.
  - Button "Xác nhận đổi mật khẩu" bị disable nếu các trường chưa thoả điều kiện validate.

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `PUT /api/v1/customers/change-password`
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE (Mật khẩu hiện tại, Mật khẩu mới) kèm `customerId` trích từ JWT Token.
  2. **Verify Pass cũ:** BE lấy `password_hash` hiện tại của user từ bảng `customers`, dùng Bcrypt thực hiện hàm `verify()` so sánh với Mật khẩu hiện tại do FE gửi lên.
  3. **Xử lý kết quả kiểm tra:**
     - Nếu Mật khẩu hiện tại không khớp: Trả về `400 Bad Request` (hoặc `401 Unauthorized`).
     - Nếu khớp: Mã hoá (Hash) Mật khẩu mới bằng Bcrypt, `UPDATE` cột `password_hash` trong bảng `customers`.
  4. Trả về HTTP Status `200 OK`. Không cần thu hồi Token hiện tại (khách hàng vẫn giữ phiên đăng nhập).

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Mật khẩu hiện tại không đúng | Text đỏ dưới ô "Mật khẩu hiện tại": "Mật khẩu hiện tại không chính xác" |
| `400 Bad Request` | Mật khẩu mới không đạt chuẩn (< 8 ký tự) hoặc Xác nhận không khớp | Text đỏ dưới ô tương ứng |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |
