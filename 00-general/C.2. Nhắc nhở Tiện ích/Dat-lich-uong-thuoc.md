# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đặt lịch uống thuốc

> [!NOTE]
> *Tính năng **chưa có code** tại thời điểm viết tài liệu (không có migration/entity/route nào tên `medication` trong source). Tài liệu này là đặc tả cho tính năng **sắp xây dựng**.*

## 1. Thông tin chung
- **Mã chức năng:** C.2.1
- **Tên chức năng:** Đặt lịch uống thuốc (Medication Reminder Scheduling)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Mức độ ưu tiên:** Khó
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng khai báo phác đồ/lịch uống thuốc cá nhân (tên thuốc, liều lượng, giờ uống) làm **dữ liệu nguồn** để Backend Scheduler tự động quét và sinh thông báo nhắc nhở đúng giờ.

> [!IMPORTANT]
> *Liên kết trực tiếp với module **E.2.2 — Nhận thông báo Realtime (Nhắc thuốc)**: tài liệu `Nhac-thuoc-realtime.md` của E.2.2 đã ghi nhận rằng hệ thống "chưa có lịch uống thuốc/phác đồ thật" và "Scheduler chỉ là thành phần dự kiến, chưa có bảng dữ liệu để quét". **UC C.2.1 chính là phần bổ sung bảng dữ liệu và màn hình đó** — hoàn thiện UC này là điều kiện tiên quyết để Scheduler của E.2.2 có dữ liệu thật để quét. Ranh giới trách nhiệm giữa 2 UC: **C.2.1** chịu trách nhiệm màn hình khai báo lịch + bảng `medication_reminders` + Job Scheduler quét bảng này và `INSERT` vào `notifications`; **E.2.2** chịu trách nhiệm tầng đẩy Realtime (SSE/WebSocket) sau khi bản ghi `notifications` đã được tạo — hạ tầng SSE đó, theo ghi chú của E.2.2, **cũng chưa được xây dựng** tại thời điểm viết tài liệu. Đội Dev cần xác nhận thứ tự triển khai: C.2.1 (bảng + Job ghi `notifications`) có thể làm độc lập trước; phần đẩy Realtime của E.2.2 làm sau, không chặn nhau — nếu SSE chưa xong, khách hàng vẫn thấy nhắc thuốc khi mở lại danh sách thông báo (E.2.1).*

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Danh sách "Lịch uống thuốc" + Form thêm/sửa lịch, truy cập từ menu Theo dõi Bệnh lý (module C — sidebar `CustomerLayout.tsx` cần bổ sung mục này).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          LỊCH UỐNG THUỐC                                                │
│                                                                                          [+ Thêm lịch]  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐                  │
│  │ 💊 Omeprazol 20mg — 1 viên, sau ăn sáng — 07:30              [Bật ●─]  [Sửa] [Xoá] │                  │
│  │ 💊 Vitamin C — 1 viên, không liên quan bữa ăn — 20:00        [Tắt ─○]  [Sửa] [Xoá] │                  │
│  └──────────────────────────────────────────────────────────────────────────────────┘                  │
│                                                                                                        │
│  ── Form thêm/sửa lịch ──────────────────────────────────────────────────────────────                  │
│  Tên thuốc:        [ Omeprazol 20mg....................... ]                                           │
│  Liều lượng:       [ 1 viên............................... ] (tuỳ chọn)                                 │
│  Liên quan bữa ăn: ( ) Trước ăn   (•) Sau ăn   ( ) Không liên quan                                       │
│  Giờ nhắc:         [ 07:30 ] (chọn giờ, lặp lại hàng ngày)                                               │
│  Thời hạn:         [ 21/08/2026 → .......... ] (tuỳ chọn, để trống = không giới hạn)                     │
│                                          [ 💾 LƯU LỊCH UỐNG THUỐC ]                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Tên thuốc** (`medication_name`): bắt buộc, văn bản tự do.
- **Liều lượng** (`dosage`): tuỳ chọn, văn bản tự do (VD: "1 viên", "5ml").
- **Liên quan bữa ăn** (`meal_relation`): tuỳ chọn, 1 trong 3 — Trước ăn / Sau ăn / Không liên quan (`BEFORE_MEAL`/`AFTER_MEAL`/`NONE`). Không bắt buộc chọn — nếu bỏ trống, hệ thống lưu `NONE`.
- **Giờ nhắc** (`reminder_time`): bắt buộc, chọn 1 mốc giờ trong ngày, **lặp lại hàng ngày**. Nếu 1 loại thuốc cần uống nhiều lần/ngày (VD: sáng và tối), khách hàng tạo **2 bản ghi riêng** — mỗi bản ghi ứng với đúng 1 giờ nhắc (không hỗ trợ nhiều giờ trong 1 bản ghi ở phạm vi MVP).
- **Thời hạn** (`start_date`/`end_date`): tuỳ chọn — để trống nghĩa là nhắc vô thời hạn cho tới khi khách hàng tự tắt/xoá. Nếu nhập, `end_date` phải `>= start_date`.
- **Bật/Tắt** (`is_active`): mỗi lịch có công tắc bật/tắt riêng — tắt nghĩa là **tạm dừng nhắc mà không xoá dữ liệu**, khác với xoá hẳn (xem BR-05 tại `Business-rule.md`).
- **Sửa/Xoá:** mỗi dòng trong danh sách có nút Sửa (mở lại form với dữ liệu cũ) và Xoá (xoá hẳn, có xác nhận trước khi xoá).

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V19__create_medication_reminders.sql` (PostgreSQL) để khởi tạo bảng `medication_reminders`.
  - *Ghi chú:* backlog gốc đề xuất `V9__create_medication_reminders.sql` — đổi thành `V19` cùng lý do đã nêu ở C.1.1/C.1.2 (đối chiếu thực tế, migration Postgres mới nhất trong source đã tới `V16`; V17/V18 dành cho C.1.1/C.1.2).
- **API Endpoints:**
  - `POST /api/v1/tracking/medication-reminders` — Tạo mới 1 lịch uống thuốc.
  - `GET /api/v1/tracking/medication-reminders` — Lấy danh sách lịch của khách hàng hiện tại.
  - `PUT /api/v1/tracking/medication-reminders/{id}` — Cập nhật lịch (bao gồm cả bật/tắt `is_active`).
  - `DELETE /api/v1/tracking/medication-reminders/{id}` — Xoá hẳn 1 lịch.
- **Thành phần Scheduler (Job nền — `Config @Scheduled`):**
  - Job chạy định kỳ **mỗi phút** (Spring `@Scheduled(cron = "0 * * * * *")`), quét bảng `medication_reminders` với điều kiện: `is_active = TRUE` AND `reminder_time` khớp giờ:phút hiện tại AND (`start_date IS NULL OR start_date <= CURRENT_DATE`) AND (`end_date IS NULL OR end_date >= CURRENT_DATE`).
  - Với mỗi bản ghi khớp: gọi lại đúng cơ chế đã có ở **`NotificationService`** (module E.2) để `INSERT` 1 bản ghi mới vào bảng `notifications` (`type = 'MEDICATION_REMINDER'`, `title`/`message` dựng từ `medication_name` + `dosage` + `meal_relation`, VD: "Omeprazol 20mg — 1 viên sau ăn sáng"), sau đó (nếu hạ tầng Realtime của E.2.2 đã sẵn sàng) đẩy sự kiện qua Registry `customerId -> SseEmitter`.
  - **Múi giờ:** so khớp `reminder_time` theo múi giờ hệ thống của Server (giả định `Asia/Ho_Chi_Minh`, UTC+7) — hệ thống hiện **chưa hỗ trợ đa múi giờ theo từng khách hàng** (không có cột timezone ở `customers`), ghi nhận đây là giả định cần Đội Dev xác nhận nếu về sau có khách hàng ở múi giờ khác.
- **Luồng xử lý Logic (API CRUD):**
  1. Toàn bộ API yêu cầu `JWT Token` hợp lệ, lọc/kiểm tra theo `customer_id` trích từ Token (BR-01, đồng nhất với C.1/E.2).
  2. Khi tạo/sửa: validate `end_date >= start_date` (nếu cả 2 đều có giá trị).
  3. Khi xoá: kiểm tra `customer_id` khớp Token — không khớp/không tồn tại → `404 Not Found`.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Thiếu `medication_name`/`reminder_time`, hoặc `end_date < start_date` | Text đỏ dưới field tương ứng |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `404 Not Found` | Lịch không tồn tại hoặc không thuộc về khách hàng hiện tại | Toast lỗi: "Không tìm thấy lịch uống thuốc" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |
| Scheduler quét đến khách hàng đang offline | Không có kết nối Realtime nào mở cho `customerId` đó | Không đẩy Realtime — thông báo vẫn đã `INSERT` vào `notifications`, khách hàng thấy khi mở lại danh sách thông báo (E.2.1), đúng hành vi đã mô tả ở E.2.2 |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `medication_reminders` (Lưu trữ trên PostgreSQL - File V19)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính, tự sinh bằng hàm UUID của Postgres |
| **`customer_id`** | `UUID` | `NOT NULL`, `FOREIGN KEY -> customers(id) ON DELETE CASCADE` | Khách hàng sở hữu lịch uống thuốc |
| **`medication_name`** | `VARCHAR(255)` | `NOT NULL` | Tên thuốc |
| **`dosage`** | `VARCHAR(100)` | Nullable | Liều lượng (VD: "1 viên", "5ml") |
| **`meal_relation`** | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'NONE'`, `CHECK IN ('BEFORE_MEAL','AFTER_MEAL','NONE')` | Quan hệ với bữa ăn |
| **`reminder_time`** | `TIME` | `NOT NULL` | Giờ nhắc trong ngày, lặp lại hàng ngày |
| **`start_date`** | `DATE` | Nullable | Ngày bắt đầu hiệu lực (trống = ngay từ khi tạo) |
| **`end_date`** | `DATE` | Nullable, `CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)` | Ngày kết thúc hiệu lực (trống = vô thời hạn) |
| **`is_active`** | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Bật/tắt nhắc — tắt để tạm dừng mà không xoá dữ liệu |
| **`created_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo |
| **`updated_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật gần nhất |

> [!NOTE]
> *Bảng này là nguồn dữ liệu đầu vào cho Job Scheduler mô tả ở Mục 4 — khi Job phát hiện `reminder_time` khớp giờ hiện tại, kết quả cuối cùng là 1 bản ghi mới ở bảng `notifications` (V13, module E.2), **không** phải bản ghi ở chính bảng `medication_reminders` này bị thay đổi.*
