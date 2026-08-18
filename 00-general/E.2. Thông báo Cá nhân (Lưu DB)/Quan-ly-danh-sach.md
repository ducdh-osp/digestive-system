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
- **Badge số lượng:** Hiển thị số thông báo có trạng thái `is_read = false` (lấy trực tiếp từ `unreadCount` do BE trả về). Nếu > 99, hiển thị "99+" (cấu hình `overflowCount={99}` trên component Badge của antd — không phải ngưỡng 9 như định hướng ban đầu).
- **Danh sách:** Bấm vào icon chuông mở Dropdown/Panel liệt kê thông báo theo thứ tự mới nhất trước (sắp xếp theo `created_at DESC`), phân trang kiểu "tải thêm" (nút **Xem thêm**, mỗi lần 10 bản ghi) chứ không phải infinite-scroll tự động.
- **Đánh dấu đã đọc:** Khi khách hàng bấm vào 1 thông báo, FE gọi API đánh dấu đã đọc, đồng thời cập nhật giao diện (bỏ chấm tròn màu, giảm số Badge). Nếu thông báo có liên kết tới màn hình khác (Ví dụ: Nhắc thuốc → màn hình chi tiết lịch uống thuốc), điều hướng khách hàng tới đó — **lưu ý:** hành vi điều hướng theo `type` này hiện **chưa được triển khai**, item chỉ đổi trạng thái đã đọc, chưa tự động chuyển màn hình.
- **Đánh dấu tất cả đã đọc:** Nút "Đánh dấu tất cả đã đọc" gọi API cập nhật hàng loạt.
- **Xoá thông báo:** Nút icon thùng rác (không phải ký tự "✕" như wireframe mục 3.1) trên từng item cho phép xoá riêng lẻ khỏi danh sách của khách hàng đó (Soft-delete — xem mục 4).
- **Điều hướng theo `type`:** Khi bấm vào 1 thông báo, nếu `type` đã có màn hình tương ứng trên FE thì điều hướng khách hàng tới đó (hiện tại chỉ `PROFILE_UPDATE → /profile`); các `type` chưa có màn hình thật (`MEDICATION_REMINDER`, `SYSTEM`, ...) chỉ đổi trạng thái đã đọc, không điều hướng — tránh dẫn khách hàng tới URL không tồn tại. Bấm vào thông báo đã đọc mà có `type` khả điều hướng vẫn điều hướng lại được (không bị chặn bởi trạng thái đã đọc).

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V13__create_notifications_table.sql` (PostgreSQL) để khởi tạo bảng `notifications`.
  - Bổ sung cột `type` và `read_at` (bị thiếu ở bản V13 ban đầu) tại `V14__update_notifications_table.sql`.
- **API Endpoints:**
  - `GET /api/v1/notifications` — Lấy danh sách thông báo của khách hàng hiện tại (theo `customerId` trích từ JWT), hỗ trợ phân trang (`page`, `size`) và trả kèm tổng số chưa đọc (`unreadCount`).
  - `PUT /api/v1/notifications/{id}/read` — Đánh dấu 1 thông báo là đã đọc.
  - `PUT /api/v1/notifications/read-all` — Đánh dấu toàn bộ thông báo của khách hàng là đã đọc.
  - `DELETE /api/v1/notifications/{id}` — Xoá 1 thông báo khỏi danh sách của khách hàng.
- **Luồng xử lý Logic:**
  1. Toàn bộ API đều yêu cầu `JWT Token` hợp lệ; BE luôn lọc dữ liệu theo `customer_id` trích từ Token — **tuyệt đối không cho phép truy cập/thao tác thông báo của khách hàng khác** (kể cả biết `id` thông báo).
  2. Khi đánh dấu đã đọc: `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND customer_id = ?`.
  3. Khi xoá: **Soft-delete** — `UPDATE notifications SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ? AND customer_id = ? AND is_deleted = FALSE` (đã triển khai từ `V15__add_soft_delete_to_notifications.sql`, thay cho xoá cứng ở bản đầu) để giữ lịch sử phục vụ thống kê/audit sau này. Toàn bộ query đọc (danh sách, đếm chưa đọc, tìm theo id, đánh dấu đã đọc, đánh dấu tất cả) đều lọc thêm điều kiện `is_deleted = FALSE` nên bản ghi đã xoá không còn hiển thị lại ở bất kỳ API nào.

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
| **`message`** | `TEXT` | `NOT NULL` | Nội dung chi tiết (tên cột thực tế là `message`, không phải `content` như định hướng ban đầu — giữ nguyên tên đã triển khai để tránh đổi tên cột đang có dữ liệu) |
| **`is_read`** | `BOOLEAN` | `DEFAULT FALSE` | Trạng thái đã đọc/chưa đọc |
| **`read_at`** | `TIMESTAMP` | Nullable | Thời điểm được đánh dấu đã đọc |
| **`created_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm thông báo được sinh ra |
| **`updated_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm bản ghi được cập nhật lần cuối (tự sinh bởi `@UpdateTimestamp` — thiếu ở bản đặc tả ban đầu) |
| **`is_deleted`** | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE` | Cờ Soft-delete — bổ sung tại `V15__add_soft_delete_to_notifications.sql` |
| **`deleted_at`** | `TIMESTAMP` | Nullable | Thời điểm khách hàng xoá thông báo — bổ sung tại `V15__add_soft_delete_to_notifications.sql` |

> [!NOTE]
> *Bảng này là nơi lưu trữ chính thức phục vụ cả UC E.2.1 (xem/quản lý danh sách) và UC E.2.2 (đẩy Realtime) — khi hệ thống bắn sự kiện Nhắc thuốc qua SSE/WebSocket (E.2.2), một bản ghi tương ứng cũng phải được `INSERT` vào bảng `notifications` này để khách hàng xem lại được trong danh sách kể cả khi không online tại thời điểm đó.*

---

## 7. Lịch sử cập nhật (Nhật ký triển khai)

### 2026-08-18 — Triển khai Soft-delete và điều hướng theo `type`
- **Bối cảnh:** 2 điểm còn để ngỏ ở lần rà soát trước (mục 7, bản ghi "Rà soát và sửa các điểm tài liệu sai lệch") — chưa soft-delete khi xoá, chưa điều hướng khi bấm vào thông báo — nay được triển khai và chốt hướng đi.
- **Soft-delete (BE):**
  - Thêm migration `V15__add_soft_delete_to_notifications.sql`: bổ sung cột `is_deleted BOOLEAN NOT NULL DEFAULT FALSE` và `deleted_at TIMESTAMP`.
  - `DELETE /api/v1/notifications/{id}` chuyển từ xoá cứng sang `UPDATE ... SET is_deleted = TRUE, deleted_at = NOW()` (điều kiện `is_deleted = FALSE` để tránh soft-delete lặp lại).
  - Toàn bộ query đọc/ghi liên quan (danh sách, đếm tổng, đếm chưa đọc, tìm theo id — dùng cho cả đánh dấu đã đọc lẫn xoá, đánh dấu tất cả đã đọc) đều bổ sung điều kiện `is_deleted = FALSE`, đảm bảo bản ghi đã xoá không còn xuất hiện/thao tác được qua bất kỳ API nào dù vẫn còn trong DB phục vụ audit.
- **Điều hướng theo `type` (FE):**
  - **Quyết định phạm vi:** Rà soát code thực tế cho thấy hệ thống **chưa có bất kỳ nơi nào sinh ra thông báo thật** (chưa có API tạo thông báo, chưa có job nhắc thuốc, chưa có trigger cập nhật hồ sơ) và **FE chưa có route/màn hình cho lịch uống thuốc** — chỉ có `/profile` là màn hình đã tồn tại tương ứng với `type = PROFILE_UPDATE`. Vì vậy chọn hướng đi an toàn: chỉ điều hướng tới những `type` đã có route thật trên FE (hiện tại: `PROFILE_UPDATE → /profile`), các `type` chưa có màn hình (`MEDICATION_REMINDER`, `SYSTEM`) tạm thời chỉ đổi trạng thái đã đọc, **không** điều hướng — tránh đưa khách hàng tới URL không tồn tại. Cơ chế map được viết dạng bảng tra cứu (`type → path`) trong `NotificationBell.tsx` nên chỉ cần thêm 1 dòng khi màn hình lịch uống thuốc được xây dựng, không cần sửa lại luồng.
  - Bấm vào thông báo **đã đọc** mà có `type` khả điều hướng vẫn điều hướng được (trước đây item đã đọc không còn bấm được gì).
- **Chưa/ngoài phạm vi đợt này:** Chưa xây dựng module/route "Lịch uống thuốc" trên FE, chưa có luồng BE sinh thông báo `MEDICATION_REMINDER`/`PROFILE_UPDATE` thật (thuộc phạm vi E.2.2 Realtime và các use-case khác) — khi các phần đó hoàn thiện cần bổ sung thêm entry vào bảng `NOTIFICATION_TYPE_ROUTES`.

### 2026-08-18 — Hoàn thiện phân trang, đếm chưa đọc server-side và đánh dấu tất cả đã đọc
- **Đã làm (hoàn thành mục còn thiếu so với đặc tả gốc):**
  - **BE:** `GET /api/v1/notifications` nhận thêm `page`, `size` và trả về object phân trang (`content`, `page`, `size`, `totalElements`, `totalPages`, `unreadCount`) thay vì trả thẳng `List<NotificationResponse>` như bản đầu — đúng yêu cầu "có phân trang hoặc infinite-scroll" ở mục 3.2. `unreadCount` được tính bằng query `COUNT` riêng (`countByCustomer_IdAndReadFalse`) trên toàn bộ dữ liệu của khách hàng, không phụ thuộc trang đang tải.
  - **BE:** Bổ sung endpoint `PUT /api/v1/notifications/read-all` (đã có trong đặc tả mục 4 nhưng chưa triển khai) — dùng `@Modifying @Query` cập nhật hàng loạt `is_read = true, read_at = NOW()` cho toàn bộ thông báo chưa đọc của khách hàng trong 1 lần gọi DB.
  - **BE:** `NotificationResponse`/`Notification` (domain + entity) bổ sung field `type` và `readAt` vào response trả cho FE — hai cột này đã tồn tại trong DB từ `V14__update_notifications_table.sql` nhưng trước đó chưa được expose qua API.
  - **FE:** `NotificationBell` chuyển từ tải toàn bộ danh sách 1 lần sang tải theo trang (`PAGE_SIZE = 10`) kèm nút "Xem thêm"; thêm nút "Đánh dấu tất cả đã đọc" gọi API `read-all` và cập nhật lại Badge/danh sách tương ứng.
- **Đã sửa (lỗi/sai lệch so với hành vi mong muốn):**
  - **FE:** Badge số thông báo chưa đọc trước đây tính bằng cách đếm (`filter`) trên danh sách thông báo đã tải về trên client — sai khi danh sách được phân trang (chỉ đúng cho trang đầu). Sửa thành lấy trực tiếp `unreadCount` do BE trả về, luôn phản ánh đúng tổng số trên toàn bộ dữ liệu của khách hàng.
- **Chưa/ngoài phạm vi đợt này:** Cơ chế Soft-delete cho hành động xoá thông báo (mục 4.3) hiện vẫn là xoá cứng (`DELETE`) — chưa đổi theo khuyến nghị.

### 2026-08-18 — Rà soát và sửa các điểm tài liệu sai lệch so với source code thực tế
- Mục 3.2: Ngưỡng hiển thị Badge sửa từ "> 9 → 9+" thành đúng "> 99 → 99+" (theo `overflowCount={99}` đang cấu hình trên `Badge` của antd trong `NotificationBell.tsx`).
- Mục 3.2: Ghi chú lại phần "phân trang" là kiểu nút **Xem thêm** (tải thêm theo trang, `PAGE_SIZE = 10`), không phải infinite-scroll tự động như mô tả ban đầu.
- Mục 3.2: Bổ sung ghi chú hành vi điều hướng theo `type` khi bấm vào thông báo (VD: Nhắc thuốc → màn hình lịch uống thuốc) **chưa được triển khai** trên FE — hiện tại bấm vào chỉ đổi trạng thái đã đọc.
- Mục 3.2: Sửa mô tả nút xoá từ ký tự "✕" thành đúng nút icon thùng rác (`DeleteOutlined` của antd).
- Mục 6: Bổ sung cột `updated_at` (có trong `V13__create_notifications_table.sql` và entity qua `@UpdateTimestamp`) nhưng trước đó bị thiếu trong bảng cấu trúc DB của tài liệu.
