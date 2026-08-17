# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đổi ảnh đại diện

## 1. Thông tin chung
- **Mã chức năng:** A.2.5
- **Tên chức năng:** Đổi ảnh đại diện (Update Avatar)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL (bảng `customers`, cột `avatar_url`)

## 2. Mục tiêu
Cho phép khách hàng tải lên hoặc thay đổi ảnh đại diện hiển thị trên hồ sơ cá nhân, giúp tài khoản có tính cá nhân hoá.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Vị trí:** Icon ảnh đại diện dạng tròn ở đầu màn hình Hồ sơ cá nhân (xem A.2.1), có icon 📷 nhỏ đè góc dưới-phải làm điểm bấm để đổi ảnh.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│    ┌──────┐                                                                                            │
│    │      │  ← Ảnh đại diện hiện tại (hoặc icon người mặc định nếu chưa từng đổi)                       │
│    │      │                                                                                            │
│    └───📷─┘  ← Bấm vào đây để mở hộp thoại chọn file ảnh từ máy                                          │
│                                                                                                        │
│    Nguyễn Văn A                                                                                        │
│    0912xxxxxx                                                                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- Bấm vào icon 📷 → mở hộp thoại chọn file ảnh của hệ điều hành (`<input type="file" accept="image/jpeg,image/png,image/webp">`).
- **Validate ngay phía Frontend** trước khi gửi lên Backend (tránh tốn băng thông upload file chắc chắn bị từ chối):
  - Định dạng: chỉ nhận `.jpg/.jpeg`, `.png`, `.webp`.
  - Kích thước: tối đa **2MB**.
  - Sai định dạng/quá dung lượng → Toast lỗi ngay tại Frontend, **không gọi API**.
- Trong lúc tải lên, icon ảnh hiển thị vòng xoay loading (spinner) đè lên vị trí icon camera, khách hàng không bấm đổi ảnh lần 2 được cho tới khi lần trước hoàn tất.
- Ảnh mới thay thế ảnh cũ ngay trên giao diện sau khi Backend phản hồi thành công, không cần tải lại trang.

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V6__add_avatar_to_customers.sql` (PostgreSQL) — thêm cột `avatar_url` vào bảng `customers` đã có sẵn (không tạo bảng mới).
- **API Endpoint:** `POST /api/v1/profile/avatar` — nhận dữ liệu dạng `multipart/form-data`, field `file`.
- **Luồng xử lý Logic:**
  1. Validate lại phía Backend (không tin tưởng hoàn toàn validate Frontend): định dạng phải là `image/jpeg`, `image/png` hoặc `image/webp`; dung lượng file tối đa **2MB** — sai → `400 Bad Request`.
  2. Lưu file ảnh mới vào hệ thống lưu trữ (hiện tại: đĩa cục bộ của server, thư mục `uploads/avatars/`, đặt tên file ngẫu nhiên không trùng — tránh lộ thông tin qua tên file gốc và tránh ghi đè nhầm file của người khác).
  3. Cập nhật cột `avatar_url` của khách hàng trong bảng `customers` trỏ tới đường dẫn ảnh mới.
  4. **Xoá file ảnh cũ** (nếu khách hàng đã từng có ảnh trước đó) khỏi hệ thống lưu trữ — thực hiện **sau khi** bước 3 đã lưu DB thành công, tránh mất ảnh nếu bước cập nhật DB lỗi giữa chừng.
  5. Trả về HTTP Status `200 OK` kèm thông tin hồ sơ mới nhất (bao gồm `avatarUrl` mới).
- **Phục vụ ảnh:** Ảnh đại diện được truy cập công khai qua đường dẫn tĩnh (không yêu cầu đăng nhập) vì thẻ `<img>` trên trình duyệt không thể tự đính kèm Token xác thực.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Sai định dạng ảnh (không phải JPEG/PNG/WEBP) | Toast lỗi: "Chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WEBP" |
| `400 Bad Request` | Ảnh vượt quá 2MB | Toast lỗi: "Kích thước ảnh tối đa 2MB" |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `500 Internal Error` | Lỗi lưu file (hết dung lượng đĩa, lỗi ghi file...) | Toast lỗi: "Không thể lưu ảnh, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Cột bổ sung vào bảng `customers` (PostgreSQL - File V6)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`avatar_url`** | `TEXT` | Nullable | Đường dẫn tương đối tới ảnh đại diện (vd `/uploads/avatars/<uuid>.jpg`); `NULL` nếu khách hàng chưa từng đổi ảnh |

> [!NOTE]
> *Ảnh được lưu trên **đĩa cục bộ của server** ở giai đoạn hiện tại — chấp nhận được cho quy mô hiện tại nhưng có giới hạn: không nhân bản (scale) được ra nhiều server cùng lúc vì mỗi server sẽ có bộ ảnh khác nhau trên đĩa riêng. Khi hệ thống cần chạy nhiều instance Backend song song, cần chuyển sang lưu trữ tập trung (S3 hoặc tương đương) — phần code lưu file đã được tách riêng thành 1 lớp duy nhất, thay đổi sau này không ảnh hưởng tới các phần còn lại.*
