# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Quản lý danh sách thông báo

## 1. Thông tin chung
- **Mã chức năng:** E.2.1
- **Tên chức năng:** Quản lý danh sách thông báo (Notification List)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng xem lại lịch sử các thông báo hệ thống đã gửi tới mình (nhắc lịch uống thuốc, thông báo hệ thống, v.v.), quản lý trạng thái Đã đọc/Chưa đọc, và xoá thông báo không cần thiết.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Vị trí:** Icon chuông thông báo (🔔) đặt tại Header, hiển thị Badge đếm số lượng thông báo **chưa đọc**.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Gastro AI                                                                    🔔(3)   👤 Nguyễn Văn A   │
│  ─────────────────────────────────────────────────────────────────────────────┬─────────────────────── │
│                                                                                │ THÔNG BÁO               │
│                                                                                │ [Đánh dấu tất cả đã đọc]│
│                                                                                ├─────────────────────────│
│                                                                                │ ● Nhắc uống thuốc    ✕ │
│                                                                                │   Đã đến giờ uống...    │
│                                                                                │   5 phút trước           │
│                                                                                ├─────────────────────────│
│                                                                                │   Cập nhật hồ sơ     ✕ │
│                                                                                │   Hồ sơ của bạn đã...   │
│                                                                                │   Hôm qua                │
│                                                                                └─────────────────────────┘
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
*(● = chấm xanh đánh dấu thông báo chưa đọc; item đã đọc hiển thị chữ màu xám nhạt hơn)*

### 3.2. Chức năng (Functional)
- **Badge số lượng:** Hiển thị số thông báo có trạng thái `is_read = false`. Nếu > 9, hiển thị "9+".
- **Danh sách:** Bấm vào icon chuông mở Dropdown/Panel liệt kê thông báo theo thứ tự mới nhất trước (sắp xếp theo `created_at DESC`), có phân trang hoặc infinite-scroll.
- **Đánh dấu đã đọc:** Khi khách hàng bấm vào 1 thông báo, FE gọi API đánh dấu đã đọc, đồng thời cập nhật giao diện (bỏ chấm xanh, giảm số Badge). Nếu thông báo có liên kết tới màn hình khác (Ví dụ: Nhắc thuốc → màn hình chi tiết lịch uống thuốc), điều hướng khách hàng tới đó.
- **Đánh dấu tất cả đã đọc:** Nút "Đánh dấu tất cả đã đọc" gọi API cập nhật hàng loạt.
- **Xoá thông báo:** Nút "✕" trên từng item cho phép xoá riêng lẻ khỏi danh sách của khách hàng đó.

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V13__create_notifications_table.sql` (PostgreSQL) để khởi tạo bảng `notifications`.
- **API Endpoints:**
  - `GET /api/v1/notifications` — Lấy danh sách thông báo của khách hàng hiện tại (theo `customerId` trích từ JWT), hỗ trợ phân trang (`page`, `size`) và trả kèm tổng số chưa đọc (`unreadCount`).
  - `PUT /api/v1/notifications/{id}/read` — Đánh dấu 1 thông báo là đã đọc.
  - `PUT /api/v1/notifications/read-all` — Đánh dấu toàn bộ thông báo của khách hàng là đã đọc.
  - `DELETE /api/v1/notifications/{id}` — Xoá 1 thông báo khỏi danh sách của khách hàng.
- **Luồng xử lý Logic:**
  1. Toàn bộ API đều yêu cầu `JWT Token` hợp lệ; BE luôn lọc dữ liệu theo `customer_id` trích từ Token — **tuyệt đối không cho phép truy cập/thao tác thông báo của khách hàng khác** (kể cả biết `id` thông báo).
  2. Khi đánh dấu đã đọc: `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND customer_id = ?`.
  3. Khi xoá: Xoá cứng (`DELETE`) hoặc đánh dấu ẩn (Soft-delete bằng cột `is_deleted`) tuỳ quyết định cuối cùng của đội Dev; khuyến nghị Soft-delete để giữ lịch sử phục vụ thống kê/audit sau này.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `404 Not Found` | Thông báo không tồn tại hoặc không thuộc về khách hàng hiện tại | Toast lỗi: "Không tìm thấy thông báo" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `notifications` (Lưu trữ trên PostgreSQL - File V13)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính, tự sinh bằng hàm UUID của Postgres |
| **`customer_id`** | `UUID` | `NOT NULL`, `FOREIGN KEY -> customers(id)` | Khách hàng nhận thông báo |
| **`type`** | `VARCHAR(50)` | `NOT NULL` | Loại thông báo (Ví dụ: `MEDICATION_REMINDER`, `SYSTEM`, `PROFILE_UPDATE`) — dùng để định tuyến khi bấm vào thông báo |
| **`title`** | `TEXT` | `NOT NULL` | Tiêu đề thông báo |
| **`content`** | `TEXT` | Nullable | Nội dung chi tiết |
| **`is_read`** | `BOOLEAN` | `DEFAULT FALSE` | Trạng thái đã đọc/chưa đọc |
| **`read_at`** | `TIMESTAMP` | Nullable | Thời điểm được đánh dấu đã đọc |
| **`created_at`** | `TIMESTAMP` | `DEFAULT NOW()` | Thời điểm thông báo được sinh ra |

> [!NOTE]
> *Bảng này là nơi lưu trữ chính thức phục vụ cả UC E.2.1 (xem/quản lý danh sách) và UC E.2.2 (đẩy Realtime) — khi hệ thống bắn sự kiện Nhắc thuốc qua SSE/WebSocket (E.2.2), một bản ghi tương ứng cũng phải được `INSERT` vào bảng `notifications` này để khách hàng xem lại được trong danh sách kể cả khi không online tại thời điểm đó.*
