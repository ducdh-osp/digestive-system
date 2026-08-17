# Mô tả Luồng hoạt động (Workflow) - Quản lý Log Hệ thống (Audit)

Tài liệu này tổng hợp luồng đi (Flow) khi hệ thống tự động ghi Audit Log, và khi Admin xem/xuất lại log.

## 1. Luồng Ghi log tự động (nền, không phải thao tác trực tiếp của Admin)
**Mục đích:** Mọi hành động Create/Update/Delete trong hệ thống tự động có vết, không cần Developer nhớ gọi API ghi log ở từng nơi.

1. **Bước 1:** Một Admin (hoặc hệ thống) gọi API bất kỳ làm thay đổi dữ liệu (vd `PUT /profile` do Admin thao tác hộ Khách hàng, hoặc các API quản trị khác trong tương lai).
2. **Bước 2 (BE):** Spring AOP Aspect chặn method Service tương ứng (theo Pointcut đã cấu hình, xem D.4.1 Mục 4), lấy thông tin Admin đang đăng nhập từ `SecurityContextHolder`.
3. **Bước 3 (BE):** Aspect `INSERT` 1 bản ghi vào bảng `audit_logs` (admin_id, action, entity_name, entity_id, description, ip_address, created_at). Nếu bước này lỗi, chỉ log cảnh báo, không ảnh hưởng kết quả của Bước 1 (BR-07).

---

## 2. Luồng Xem & Lọc lịch sử hoạt động (D.4.1)
1. **Bước 1 (FE):** Admin (role SUPER_ADMIN) vào màn hình "Nhật ký hệ thống". FE tự gọi API với bộ lọc mặc định (7 ngày gần nhất).
2. **Bước 2 (FE -> BE):** Admin chỉnh bộ lọc (khoảng ngày/hành động/nhân viên), bấm "Lọc". FE gọi `GET /api/v1/admin/audit-logs` kèm query params.
3. **Bước 3 (BE):** Kiểm tra quyền (BR-03) → truy vấn `audit_logs` theo bộ lọc, phân trang.
4. **Bước 4 (FE):** Hiển thị kết quả lên Ant Design Table.

---

## 3. Luồng Xuất file Log (D.4.2)
1. **Bước 1 (FE):** Admin đang xem danh sách đã lọc ở D.4.1, bấm nút "Xuất file" → chọn định dạng (.xlsx hoặc .csv).
2. **Bước 2 (FE -> BE):** Gọi `GET /api/v1/admin/audit-logs/export` kèm đúng bộ lọc hiện tại + định dạng đã chọn.
3. **Bước 3 (BE):** Kiểm tra quyền (BR-03) + kiểm tra khoảng ngày không vượt 90 ngày (BR-04) → truy vấn toàn bộ bản ghi khớp bộ lọc (không phân trang) → build file bằng Apache POI (.xlsx) hoặc ghi CSV thuần (.csv).
4. **Bước 4 (BE -> FE):** Trả file kèm header `Content-Disposition: attachment`. Trình duyệt tự động tải file xuống.
