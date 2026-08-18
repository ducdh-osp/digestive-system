# Mô tả Luồng hoạt động (Workflow) - Trang tổng quan CMS (Dashboard)

Tài liệu này tổng hợp luồng đi (Flow) khi Admin vào Trang tổng quan sau khi đăng nhập CMS.

## 1. Luồng hiển thị số liệu tổng quan (mọi Role)
**Mục đích:** Cho Admin cái nhìn nhanh về quy mô hệ thống ngay khi vào CMS.

1. **Bước 1 (FE):** Admin đăng nhập CMS thành công, được điều hướng vào `/admin/dashboard` (mặc định sau đăng nhập).
2. **Bước 2 (FE -> BE):** `AdminDashboardPage` gọi `GET /api/v1/admin/dashboard/summary` ngay khi mount.
3. **Bước 3 (BE):** `AdminDashboardService.summary()` xác thực Admin đã đăng nhập (BR-01, không yêu cầu Role cụ thể) → đếm `COUNT(*)` bảng `customers` (PostgreSQL) và đếm bảng `admins` (MySQL, hiện qua `findAll().size()`) → trả `{ totalCustomers, totalAdmins }`.
4. **Bước 4 (FE):** Render 2 `Statistic Card`. Trong lúc chờ phản hồi, card ở trạng thái `loading` (dựa vào `summary === null`).

---

## 2. Luồng hiển thị "Hoạt động gần đây" (chỉ SUPER_ADMIN)
**Mục đích:** Giúp SUPER_ADMIN nắm nhanh vài thao tác Create/Update/Delete mới nhất mà không cần rời Trang tổng quan.

1. **Bước 1 (FE):** Sau khi xác định `admin.role === 'SUPER_ADMIN'` (BR-02), `AdminDashboardPage` gọi `auditLogApi.list({ fromDate: hôm nay - 6 ngày, toDate: hôm nay, page: 0, size: 5 })` — **tái sử dụng thẳng API của D.4**, không có endpoint riêng cho Dashboard (BR-04).
2. **Bước 2 (BE):** `AuditLogController`/`AuditLogService` xử lý y hệt luồng D.4.1 (đã enforce `SUPER_ADMIN` ở tầng Backend).
3. **Bước 3 (FE):** Render kết quả (tối đa 5 bản ghi) vào `Timeline`, mỗi dòng gồm Admin thực hiện, mô tả hành động, thời gian, và Tag màu theo `action` (`CREATE` xanh lá / `UPDATE` xanh dương / `DELETE` đỏ — đồng bộ màu với bảng ở D.4.1).
4. **Bước 4 (FE):** Nếu không có hoạt động nào trong 7 ngày → hiển thị `Empty`. Admin bấm "Xem tất cả" → điều hướng sang `/admin/audit-logs` (màn hình đầy đủ của D.4.1) để lọc sâu hơn.

---

## 3. Luồng lỗi (khi API thất bại)
1. Nếu `GET /summary` lỗi: `summary` giữ nguyên `null` → 2 thẻ số liệu giữ trạng thái loading vô hạn, không có Toast báo lỗi (xem BR-05, cần cải thiện).
2. Nếu API Audit Log lỗi (SUPER_ADMIN): `recentActivity` được set về mảng rỗng → khối "Hoạt động gần đây" hiển thị y hệt trạng thái "không có hoạt động nào", **không phân biệt được** với trường hợp thật sự không có log — cùng một điểm cần cải thiện với BR-05.
