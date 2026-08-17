# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Xem & Lọc lịch sử hoạt động (Audit Log)

## 1. Thông tin chung
- **Mã chức năng:** D.4.1
- **Tên chức năng:** Xem & Lọc lịch sử hoạt động (View & Filter Audit Log)
- **Tác nhân (Actor):** Admin (giới hạn theo Role — xem BR-03)
- **Cơ sở dữ liệu:** MySQL (cùng CSDL với `admins`/`roles`)

## 2. Mục tiêu
Cho phép Quản trị viên tra cứu lại toàn bộ lịch sử các thao tác **thay đổi dữ liệu** (Create/Update/Delete) đã diễn ra trong hệ thống — phục vụ truy vết trách nhiệm, điều tra sự cố, và đáp ứng yêu cầu kiểm toán (audit) nội bộ.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** CMS → Nhật ký hệ thống (Audit Log), chỉ hiển thị trong menu điều hướng với Admin có quyền (BR-03).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  NHẬT KÝ HỆ THỐNG (AUDIT LOG)                                                                            │
│                                                                                                        │
│  Từ ngày: [ 01/08/2026 ▾ ]   Đến ngày: [ 15/08/2026 ▾ ]   Hành động: [ Tất cả      ▾ ]                  │
│  Nhân viên: [ Tất cả              ▾ ]                          [   LỌC   ]   [ ⭳ XUẤT FILE ▾ ]          │
│  ──────────────────────────────────────────────────────────────────────────────────────────────────── │
│  Thời gian          │ Admin thực hiện │ Hành động │ Đối tượng          │ Mô tả                          │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  15/08/2026 09:12:05 │ admin (SUPER)  │ UPDATE    │ customers#a1b2c3   │ Cập nhật hồ sơ khách hàng       │
│  15/08/2026 08:45:20 │ bacsi_A (DOCTOR)│ CREATE   │ medical_profiles#.. │ Tạo hồ sơ bệnh lý               │
│  14/08/2026 17:03:11 │ admin (SUPER)  │ DELETE    │ notifications#a9f2 │ Xoá thông báo                   │
│                                                                                                        │
│                                          [ ‹ Trang trước ]  1 / 24  [ Trang sau › ]                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Bảng dữ liệu:** Dùng Ant Design `Table`, phân trang server-side (không load hết log về FE một lần — bảng log tăng liên tục theo thời gian).
- **Cột hiển thị:** Thời gian (`createdAt`, định dạng `dd/MM/yyyy HH:mm:ss`), Admin thực hiện (username + role), Hành động (badge màu: `CREATE` xanh lá, `UPDATE` xanh dương, `DELETE` đỏ), Đối tượng tác động (`entityName#entityId`), Mô tả chi tiết.
- **Form lọc:**
  - Khoảng ngày (`fromDate`, `toDate`) — DatePicker range, mặc định 7 ngày gần nhất khi mới vào trang.
  - Hành động — dropdown `Tất cả / CREATE / UPDATE / DELETE`.
  - Nhân viên thực hiện — dropdown load danh sách Admin (từ bảng `admins`).
  - Bấm "Lọc" mới gọi API (không tự động lọc theo từng keystroke, tránh spam request).
- **Click vào 1 dòng log:** mở rộng/hiện chi tiết đầy đủ nội dung `description` nếu bị cắt ngắn ở cột (dữ liệu dài).

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V3__create_audit_logs_table.sql` (MySQL) khởi tạo bảng `audit_logs`. (MySQL của dự án tại thời điểm triển khai UC này mới chỉ có `V1`/`V2` — không phải `V12` như dự kiến ban đầu khi viết tài liệu.)
- **Cơ chế ghi log tự động — Spring AOP:**
  - Cấu hình 1 `@Aspect` (Around/AfterReturning Advice) đặt Pointcut chặn các method Service thực hiện **Create/Update/Delete** (ví dụ: các method `save()`/`delete()` gọi xuống tầng `domain/repositories`, hoặc đơn giản hơn — đánh dấu annotation tự định nghĩa `@Auditable(action = ..., entity = ...)` lên từng method Service cần ghi log).
  - Aspect tự động lấy: Admin đang đăng nhập (từ `SecurityContextHolder`), tên hành động, tên/])ID đối tượng bị tác động, rồi `INSERT` 1 bản ghi vào `audit_logs` — **Developer không cần tự viết code ghi log thủ công ở từng Service**.
  - Việc ghi log phải **không được làm luồng nghiệp vụ chính thất bại** — nếu ghi log lỗi (vd mất kết nối MySQL tạm thời), chỉ log cảnh báo ở tầng hạ tầng, không rollback hay trả lỗi cho người dùng (xem BR-07).

> [!NOTE]
> **Hiện trạng khi triển khai:** Hệ thống hiện tại **chưa có nghiệp vụ Admin CRUD nào khác** ngoài Đăng nhập (A.3.1, chỉ Read) — chưa có Service nào thực sự đánh dấu `@Auditable` trong code production. Cơ chế AOP (annotation `@Auditable` + `AuditLogAspect`) đã được xây dựng đầy đủ và **xác minh hoạt động đúng qua test tích hợp thật với MySQL** (`AuditLogAspectTest`, chèn 1 bản ghi `demo` giả lập qua Spring AOP proxy). Khi đội Dev xây các UC quản trị Create/Update/Delete tiếp theo (vd Quản lý Admin, Quản lý nội dung...), chỉ cần đánh dấu `@Auditable(action=..., entityName=...)` lên method Service tương ứng — không cần viết thêm code ghi log.
- **API Endpoint:** `GET /api/v1/admin/audit-logs?fromDate=&toDate=&action=&adminId=&page=&size=`
  - Yêu cầu quyền theo BR-03.
  - Trả về danh sách phân trang + tổng số bản ghi khớp bộ lọc.
- **API Endpoint phụ trợ:** `GET /api/v1/admin/audit-logs/admins` — trả danh sách gọn `{id, username, roleName}` của toàn bộ Admin, phục vụ dropdown lọc "Nhân viên" ở Mục 3.2 (không có sẵn API "danh sách Admin" nào khác trong hệ thống tính tới thời điểm này).

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Tham số lọc sai định dạng (vd `fromDate` > `toDate`) | Toast lỗi: "Khoảng thời gian lọc không hợp lệ" |
| `401 Unauthorized` | Token không hợp lệ/hết hạn | Tự động đăng xuất, chuyển hướng Đăng nhập |
| `403 Forbidden` | Admin không đủ quyền xem Audit Log (không phải SUPER_ADMIN) | Toast lỗi: "Bạn không có quyền truy cập chức năng này" |
| `500 Internal Error` | Lỗi truy vấn CSDL | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `audit_logs` (Lưu trữ trên MySQL - File V3)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `BIGINT` | **`PRIMARY KEY`**, `AUTO_INCREMENT` | Khóa chính |
| **`admin_id`** | `INT` | `NOT NULL`, `FOREIGN KEY -> admins(id)` | Admin thực hiện hành động (khớp kiểu `INT` của `admins.id`, xem A.3) |
| **`action`** | `ENUM('CREATE','UPDATE','DELETE')` | `NOT NULL` | Loại hành động |
| **`entity_name`** | `VARCHAR(100)` | `NOT NULL` | Tên đối tượng/bảng bị tác động (vd `customers`, `notifications`) |
| **`entity_id`** | `VARCHAR(100)` | Nullable | ID bản ghi bị tác động (UUID hoặc số, lưu dạng chuỗi cho linh hoạt) |
| **`description`** | `TEXT` | Nullable | Mô tả chi tiết hành động (không lưu dữ liệu nhạy cảm — xem BR-05) |
| **`ip_address`** | `VARCHAR(45)` | Nullable | IP nguồn thực hiện request (hỗ trợ điều tra) |
| **`created_at`** | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP`, **Index** | Thời điểm ghi log — đánh index để lọc theo khoảng ngày nhanh |

> [!NOTE]
> *Cột `created_at` và `admin_id` nên tạo composite index `(admin_id, created_at)` vì đây là 2 tiêu chí lọc chính (bộ lọc "Nhân viên" + "Khoảng ngày" ở Mục 3.2), tránh full table scan khi bảng log phình to theo thời gian.*
