# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Xem thông tin cá nhân

## 1. Thông tin chung
- **Mã chức năng:** A.2.1
- **Tên chức năng:** Xem thông tin cá nhân (View Profile)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng đã đăng nhập xem lại toàn bộ thông tin cá nhân và thông tin hồ sơ bệnh lý đã khai báo trong hệ thống.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Màn hình Hồ sơ cá nhân (Profile).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│   [  Ảnh đại diện    ]                  HỒ SƠ CÁ NHÂN                                                  │
│   [   Gastro AI App  ]                                                                                │
│   [                  ]                  Họ và tên:      Nguyễn Văn A                                   │
│                                          Số điện thoại:  0912xxxxxx                                    │
│                                          Email:          nguyenvana@gmail.com                          │
│                                                                                                        │
│                                          Chiều cao / Cân nặng:  170 cm / 65 kg                         │
│                                          Tiền sử bệnh lý:       Dạ dày, IBS                             │
│                                                                                                        │
│                                          [        CHỈNH SỬA THÔNG TIN        ]                         │
│                                          [        ĐỔI MẬT KHẨU               ]                         │
│                                          [        CẬP NHẬT HỒ SƠ BỆNH LÝ      ]                        │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trigger:** FE tự động gọi API lấy dữ liệu ngay khi khách hàng vào màn hình Profile (không cần thao tác thêm).
- **Hiển thị:** Render thông tin cá nhân (Họ tên, SĐT, Email) và thông tin bệnh lý (nếu đã từng khai báo). Nếu chưa có hồ sơ bệnh lý, hiển thị placeholder "Chưa cập nhật" kèm nút mời khách hàng bổ sung.
- **Điều hướng:** Từ màn hình này, khách hàng có thể bấm sang các chức năng con: Cập nhật thông tin (A.2.2), Đổi mật khẩu (A.2.3), Cập nhật hồ sơ bệnh lý (A.2.4).

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `GET /api/v1/customers/profile`
- **Luồng xử lý Logic:**
  1. BE trích xuất thông tin định danh (`customerId`) từ `JWT Token` được đính kèm trong Header `Authorization: Bearer <token>`.
  2. **Query DB (Postgres):** Truy vấn bảng `customers` theo `id`, kết hợp (LEFT JOIN) với bảng `medical_profiles` theo `customer_id` để lấy đồng thời thông tin bệnh lý (nếu có).
  3. Trả về HTTP Status `200 OK` kèm dữ liệu tổng hợp của khách hàng.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `404 Not Found` | Không tìm thấy User tương ứng với Token (dữ liệu bị xoá) | Toast lỗi: "Không tìm thấy thông tin tài khoản" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |
