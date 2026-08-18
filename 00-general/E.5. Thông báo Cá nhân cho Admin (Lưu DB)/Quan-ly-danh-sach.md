# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Quản lý danh sách thông báo cho Admin

## 1. Thông tin chung
- **Mã chức năng:** E.5.1
- **Tên chức năng:** Quản lý danh sách thông báo cho Admin (Admin Notification List)
- **Tác nhân (Actor):** Admin — **mọi Role đều xem được** (SUPER_ADMIN lẫn các Role khác), vì đây là thông báo cá nhân của riêng từng tài khoản, không áp dụng phân quyền BR-03 như Audit Log (D.4)
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** MySQL (bảng `admin_notifications`, cùng CSDL với `admins` — **khác** với E.2 dùng PostgreSQL cho Customer)

## 2. Mục tiêu
Cho phép Admin xem lại lịch sử các thông báo hệ thống gửi riêng tới tài khoản mình, quản lý trạng thái Đã đọc/Chưa đọc, và xoá thông báo không cần thiết — về nghiệp vụ tương đương chức năng E.2 (Customer) nhưng tách bảng/CSDL riêng vì `admins` sống ở MySQL còn `customers` sống ở PostgreSQL (xem `Architecture-and-Codebase.md`).

## 3. Yêu cầu giao diện & Frontend (FE)
- **Vị trí:** Icon chuông thông báo (🔔) đặt tại Header của `AdminLayout` (khung sườn dùng chung cho toàn bộ khu vực CMS đã đăng nhập), hiển thị Badge đếm số lượng thông báo **chưa đọc**. Tông màu tím (`purple`/`fuchsia`) để phân biệt trực quan với chuông thông báo tím-xanh của Customer (E.2).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [Sidebar CMS]  │  Trang tổng quan                                                        🔔(2)         │
│                 │  ──────────────────────────────────────────────────────┬───────────────────────────── │
│                 │                                                        │ THÔNG BÁO                     │
│                 │                                                        │ [Đánh dấu tất cả đã đọc]  ⟳  │
│                 │                                                        ├───────────────────────────────│
│                 │                                                        │ ● Cảnh báo hệ thống       🗑 │
│                 │                                                        │   Dung lượng lưu trữ...       │
│                 │                                                        │   5 phút trước                 │
│                 │                                                        ├───────────────────────────────│
│                 │                                                        │   Thông báo chung          🗑 │
│                 │                                                        │   Bản cập nhật CMS...         │
│                 │                                                        │   Hôm qua                      │
│                 │                                                        ├───────────────────────────────│
│                 │                                                        │       [ Xem thêm ]             │
│                 │                                                        └───────────────────────────────┘
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
*(● = chấm tròn màu tím đánh dấu thông báo chưa đọc; 🗑 = nút xoá icon thùng rác)*

### 3.2. Chức năng (Functional)
- **Badge số lượng:** Hiển thị `unreadCount` do BE trả về (tính trên toàn bộ dữ liệu, không phụ thuộc trang đang tải). Ngưỡng hiển thị `overflowCount={99}` → quá 99 hiện "99+".
- **Danh sách:** Bấm vào icon chuông mở Popover liệt kê thông báo mới nhất trước (`created_at DESC`), tải theo trang kiểu "tải thêm" — nút **Xem thêm** load thêm 10 bản ghi/lần, không phải infinite-scroll tự động.
- **Đánh dấu đã đọc:** Bấm vào 1 thông báo chưa đọc → gọi API đánh dấu đã đọc, cập nhật lại giao diện (bỏ chấm tròn, giảm Badge). **Chưa có** cơ chế điều hướng sang màn hình khác theo `type` (khác với kỳ vọng ban đầu tương tự E.2 — hiện tại `type` chỉ mang tính phân loại hiển thị, chưa dùng để routing).
- **Đánh dấu tất cả đã đọc:** Nút "Đánh dấu tất cả đã đọc" gọi API cập nhật hàng loạt, chỉ bật khi còn thông báo chưa đọc (`unreadCount > 0`).
- **Xoá thông báo:** Nút icon thùng rác trên từng item, xoá cứng khỏi danh sách của Admin đó.

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V4__create_admin_notifications_table.sql` (MySQL) để khởi tạo bảng `admin_notifications`.
- **API Endpoints:** (đều dưới `/api/v1/admin/notifications`, chưa gắn `@PreAuthorize` theo Role cụ thể — chỉ yêu cầu đã đăng nhập với vai trò Admin nói chung, xem mục "Luồng xử lý Logic")
  - `GET /api/v1/admin/notifications` — Lấy danh sách thông báo của Admin hiện tại (theo `adminId` trích từ JWT), hỗ trợ phân trang (`page`, mặc định 0; `size`, mặc định 20) và trả kèm tổng số chưa đọc (`unreadCount`).
  - `PUT /api/v1/admin/notifications/{id}/read` — Đánh dấu 1 thông báo là đã đọc.
  - `PUT /api/v1/admin/notifications/read-all` — Đánh dấu toàn bộ thông báo của Admin là đã đọc.
  - `DELETE /api/v1/admin/notifications/{id}` — Xoá 1 thông báo khỏi danh sách của Admin.
- **Luồng xử lý Logic:**
  1. Toàn bộ API đều yêu cầu `JWT Token` hợp lệ với username có prefix Admin (`SecurityConstants.ADMIN_PREFIX`); BE luôn lọc dữ liệu theo `admin_id` trích từ Token — **tuyệt đối không cho phép truy cập/thao tác thông báo của Admin khác** (kể cả biết `id` thông báo) — cùng nguyên tắc bảo mật với E.2.
  2. Khi đánh dấu đã đọc: cập nhật `is_read = TRUE`, `read_at = NOW()` cho đúng bản ghi thuộc `admin_id` đó.
  3. Khi xoá: xoá cứng (`DELETE`) — chưa có cơ chế Soft-delete (giống hiện trạng của E.2, xem mục 4.3 tài liệu đó).
- **Nguồn phát sinh thông báo (Producer):** hiện **chưa có bất kỳ Service nào trong hệ thống ghi (`INSERT`) bản ghi mới vào bảng `admin_notifications`** — mọi API ở mục này chỉ phục vụ đọc/quản lý thông báo đã có sẵn trong DB. Khi đội Dev xây các nghiệp vụ cần cảnh báo tới Admin (vd cảnh báo hệ thống, thông báo từ Audit Log nghiêm trọng...), cần tự bổ sung logic `INSERT` vào bảng này ở Service tương ứng.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Token không hợp lệ, đã hết hạn, hoặc không phải tài khoản Admin | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập CMS |
| `404 Not Found` | Thông báo không tồn tại hoặc không thuộc về Admin hiện tại | Toast lỗi: "Không tìm thấy thông báo" |
| `500 Internal Error` | Lỗi kết nối MySQL / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `admin_notifications` (Lưu trữ trên MySQL - File V4)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `BIGINT` | **`PRIMARY KEY`**, `AUTO_INCREMENT` | Khóa chính (kiểu số tự tăng — khác với `UUID` của `notifications` bên PostgreSQL ở E.2) |
| **`admin_id`** | `INT` | `NOT NULL`, `FOREIGN KEY -> admins(id)` | Admin nhận thông báo (khớp kiểu `INT` của `admins.id`, xem A.3/D.4) |
| **`type`** | `VARCHAR(50)` | `NOT NULL` | Loại thông báo — hiện chỉ mang tính phân loại hiển thị, **chưa** dùng để định tuyến khi bấm vào (xem mục 3.2) |
| **`title`** | `VARCHAR(200)` | `NOT NULL` | Tiêu đề thông báo |
| **`message`** | `TEXT` | `NOT NULL` | Nội dung chi tiết |
| **`is_read`** | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE` | Trạng thái đã đọc/chưa đọc |
| **`read_at`** | `DATETIME` | Nullable | Thời điểm được đánh dấu đã đọc |
| **`created_at`** | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm thông báo được sinh ra |

> [!NOTE]
> *Bảng này **không có** cột `updated_at` (khác với `notifications` của E.2 bên PostgreSQL) vì entity `AdminNotificationEntity` chỉ khai báo `@CreationTimestamp`, không có `@UpdateTimestamp`.*
> *Index: `idx_admin_notifications_admin_created (admin_id, created_at)` và `idx_admin_notifications_admin_unread (admin_id, is_read)` phục vụ đúng 2 truy vấn chính: lấy danh sách theo trang và đếm số chưa đọc.*

---

## 7. Lịch sử cập nhật (Nhật ký triển khai)

### 2026-08-18 — Khởi tạo tài liệu dựa trên source code đã triển khai
- Tài liệu này được soạn **sau khi** code đã hoàn thiện (migration `V4`, `AdminNotificationController/Service/Repository`, FE `AdminNotificationBell`), nhằm bổ sung đặc tả BA còn thiếu cho tính năng — không phải tài liệu định hướng viết trước như E.2.
- Bổ sung `Business-rule.md` và `Summary.md` riêng cho module — xem 2 file trong cùng thư mục.

### 2026-08-18 — Đổi mã module từ E.3 sang E.5
- Đổi mã chức năng và tên thư mục từ `E.3` thành `E.5` (giữ nguyên nội dung nghiệp vụ) để tránh trùng/chừa chỗ đánh số cho các module E.3/E.4 khác theo định hướng của đội BA.
