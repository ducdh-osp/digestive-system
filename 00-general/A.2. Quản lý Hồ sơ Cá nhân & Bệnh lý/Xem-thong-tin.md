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
│  Gastro AI                                                                    🔔      👤 Nguyễn Văn A   │
│  ─────────────────────────────────────────────────────────────────────────────────────────────────────  │
│   ( 📷 )  Nguyễn Văn A                                                                                  │
│   [Ảnh]   0912xxxxxx                                                                                    │
│           nguyenvana@gmail.com                                                                          │
│  ──────────────────────────────────────────────────────────────────────────────────────────────────── │
│   Thông tin cá nhân │  Hồ sơ sức khỏe  │  Đổi mật khẩu                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────────── │
│   (Nội dung tab đang chọn — xem chi tiết ở A.2.2/A.2.3/A.2.4)                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trigger:** FE tự động gọi API lấy dữ liệu ngay khi khách hàng vào màn hình Profile (không cần thao tác thêm).
- **Hiển thị:** Card tóm tắt gồm Ảnh đại diện (bấm vào icon camera để đổi — xem A.2.5), Họ tên, SĐT, Email; bên dưới là 3 tab: "Thông tin cá nhân" (A.2.2), "Hồ sơ sức khỏe" (A.2.4), "Đổi mật khẩu" (A.2.3) — cả 3 tab cùng mount song song (Ant Design `Tabs`), không phải 3 màn hình điều hướng riêng.
- **Nếu chưa có hồ sơ bệnh lý:** tab "Hồ sơ sức khỏe" hiển thị form trống (không có placeholder mời riêng), khách hàng nhập và lưu như bình thường.

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `GET /api/v1/profile`
- **Luồng xử lý Logic:**
  1. BE trích xuất thông tin định danh (`customerId`) từ `JWT Token` được đính kèm trong Header `Authorization: Bearer <token>`.
  2. Truy vấn bảng `customers` theo `id`, kết hợp với bảng `medical_profiles` theo `customer_id` để lấy đồng thời thông tin bệnh lý (nếu có).
  3. Trả về HTTP Status `200 OK` kèm dữ liệu tổng hợp: Họ tên, SĐT, Email, `avatarUrl` (đường dẫn ảnh đại diện, `null` nếu chưa từng đổi ảnh — xem A.2.5), và thông tin bệnh lý.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `404 Not Found` | Không tìm thấy User tương ứng với Token (dữ liệu bị xoá) | Toast lỗi: "Không tìm thấy thông tin tài khoản" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |
