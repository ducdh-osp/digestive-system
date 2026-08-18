# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Trang tổng quan CMS (Admin Dashboard)

## 1. Thông tin chung
- **Mã chức năng:** D.5.1
- **Tên chức năng:** Trang tổng quan CMS (Admin Dashboard Summary)
- **Tác nhân (Actor):** Admin (số liệu tổng quan — mọi Role đều xem được; khối "Hoạt động gần đây" chỉ hiện với `SUPER_ADMIN`, theo BR-03 của Audit Log D.4)
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** PostgreSQL (đếm `customers`) + MySQL (đếm `admins`, đọc `audit_logs`) — trang này là điểm tổng hợp dữ liệu từ cả 2 CSDL của hệ thống

## 2. Mục tiêu
Cho Admin một cái nhìn tổng quan ngay khi đăng nhập CMS: tổng số Khách hàng, tổng số tài khoản Admin trong hệ thống, và (với SUPER_ADMIN) danh sách rút gọn các hoạt động Create/Update/Delete gần nhất — thay vì màn hình chào mừng trống như trước.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** CMS → Trang tổng quan (`/admin/dashboard`), là màn hình mặc định sau khi Admin đăng nhập, dùng chung khung `AdminLayout` (sidebar + header có `AdminNotificationBell` — xem E.5).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [Sidebar CMS]  │  Trang tổng quan                                                        🔔(2)         │
│                 │  ────────────────────────────────────────────────────────────────────────────────────│
│                 │   ┌───────────────────────────┐   ┌───────────────────────────┐                       │
│                 │   │ 👥 Tổng số Khách hàng      │   │ 🛡  Tổng số Admin          │                       │
│                 │   │     128                    │   │     5                      │                       │
│                 │   └───────────────────────────┘   └───────────────────────────┘                       │
│                 │                                                                                        │
│                 │   ┌────────────────────────────────────────────────────────────────────────────────┐ │
│                 │   │ Hoạt động gần đây                                          Xem tất cả →          │ │
│                 │   │ ─────────────────────────────────────────────────────────────────────────────── │ │
│                 │   │ ● admin — Cập nhật hồ sơ khách hàng           15/08/2026 09:12   [UPDATE]         │ │
│                 │   │ ● bacsi_A — Tạo hồ sơ bệnh lý                 15/08/2026 08:45   [CREATE]         │ │
│                 │   │ ● admin — Xoá thông báo                       14/08/2026 17:03   [DELETE]         │ │
│                 │   └────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
*(Khối "Hoạt động gần đây" chỉ hiển thị nếu `admin.role === 'SUPER_ADMIN'`; các Role khác chỉ thấy 2 thẻ số liệu.)*

### 3.2. Chức năng (Functional)
- **2 thẻ số liệu (Statistic Card):** "Tổng số Khách hàng" và "Tổng số Admin", gọi 1 API duy nhất khi vào trang. Hiển thị skeleton loading khi chưa có dữ liệu.
- **Khối "Hoạt động gần đây":** chỉ render với `SUPER_ADMIN`. **Không gọi API riêng** — tái sử dụng thẳng API đã có của D.4 (`GET /api/v1/admin/audit-logs`) với tham số `fromDate` = 6 ngày trước, `toDate` = hôm nay, `page=0&size=5` (5 bản ghi gần nhất trong 7 ngày). Nút "Xem tất cả" điều hướng sang màn hình Audit Log đầy đủ (D.4).
- Nếu Admin không phải `SUPER_ADMIN`, mục "Nhật ký hệ thống" cũng bị ẩn khỏi Sidebar (đã áp dụng từ D.4/BR-03), nhất quán với việc ẩn khối "Hoạt động gần đây" ở đây.

## 4. Yêu cầu Backend (BE)
- **Database Migration:** Không có migration riêng — chỉ dùng lại các bảng `customers` (PostgreSQL) và `admins` (MySQL) đã tồn tại.
- **API Endpoint:**
  - `GET /api/v1/admin/dashboard/summary` — Trả về `{ totalCustomers, totalAdmins }`.
- **Luồng xử lý Logic:**
  1. Yêu cầu `JWT Token` hợp lệ với username có prefix Admin — **không giới hạn theo Role cụ thể** (khác BR-03 của Audit Log), mọi Admin đăng nhập đều gọi được endpoint này.
  2. `totalCustomers` = `COUNT(*)` trên bảng `customers` (PostgreSQL, qua `CustomerRepository.count()` — bổ sung mới, dùng `JpaRepository.count()` có sẵn).
  3. `totalAdmins` = kích thước danh sách trả về từ `AdminRepository.findAll()` (MySQL) — **đếm bằng cách load toàn bộ bản ghi `admins` rồi lấy `.size()`**, chưa dùng `COUNT(*)` tối ưu như phía Customer; do bảng `admins` dự kiến rất nhỏ (vài chục bản ghi) nên chưa phải vấn đề hiệu năng ở quy mô hiện tại, nhưng cần đổi sang `count()` nếu bảng phình to.
  4. Không trả về dữ liệu chi tiết/danh sách — chỉ số tổng hợp, tránh lộ thông tin cá nhân qua trang tổng quan.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `401 Unauthorized` | Token không hợp lệ, đã hết hạn, hoặc không phải tài khoản Admin | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập CMS |
| `500 Internal Error` | Lỗi kết nối DB (Postgres hoặc MySQL) | FE **không hiện Toast lỗi** — 2 thẻ số liệu chỉ ở trạng thái loading vô hạn (`summary` giữ `null`); khối "Hoạt động gần đây" hiển thị rỗng nếu API Audit Log lỗi. **Đây là điểm nên cải thiện:** hiện chưa có thông báo lỗi rõ ràng cho người dùng khi API tổng quan thất bại. |

---

## 6. Cấu trúc Database (Trực quan)

Không có bảng mới — trang này chỉ tổng hợp (aggregate) dữ liệu từ 2 bảng đã tồn tại:

| Nguồn dữ liệu | CSDL | Trường dùng |
| :--- | :--- | :--- |
| `customers` | PostgreSQL | `COUNT(*)` toàn bảng → `totalCustomers` |
| `admins` | MySQL | `COUNT(*)` (qua `findAll().size()`) toàn bảng → `totalAdmins` |
| `audit_logs` | MySQL | 5 bản ghi mới nhất trong 7 ngày gần nhất (tái sử dụng API D.4) → khối "Hoạt động gần đây" |

---

## 7. Lịch sử cập nhật (Nhật ký triển khai)

### 2026-08-18 — Khởi tạo tài liệu dựa trên source code đã triển khai
- Tài liệu này được soạn **sau khi** code đã hoàn thiện (`AdminDashboardController/Service`, FE `AdminDashboardPage` + `AdminLayout`), nhằm bổ sung đặc tả BA còn thiếu cho tính năng — không phải tài liệu định hướng viết trước.
- Ghi nhận 1 điểm cần cải thiện: `AdminDashboardService.summary()` đếm `totalAdmins` bằng `findAll().size()` thay vì `COUNT(*)` — chưa tối ưu, xem mục 4.3.
- Ghi nhận 1 điểm cần cải thiện khác: chưa có xử lý lỗi/Toast rõ ràng khi API `summary` thất bại (xem mục 5).
