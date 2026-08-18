# Mô tả Luồng hoạt động (Workflow) - Thông báo Cá nhân cho Admin

Tài liệu này tổng hợp luồng đi (Flow) của hệ thống khi Admin quản lý danh sách thông báo cá nhân của mình. Về nghiệp vụ, luồng này song song với module **E.2** (Customer) — chỉ khác tác nhân (Admin) và CSDL (MySQL thay vì PostgreSQL).

## 1. Luồng Quản lý danh sách thông báo (Admin Notification List Flow)
**Mục đích:** Cho phép Admin xem lại, đánh dấu đã đọc, và xoá thông báo gửi riêng cho tài khoản mình.

1. **Bước 1 (FE):** Admin đăng nhập CMS, `AdminLayout` render, FE gọi API `/api/v1/admin/notifications` (GET, `page=0&size=20`) để lấy danh sách và `unreadCount`, hiển thị Badge trên icon chuông (tông tím) ở header.
2. **Bước 2 (FE):** Admin bấm vào icon chuông, mở Popover danh sách thông báo.
3. **Bước 3 (FE -> BE):** Admin bấm vào 1 thông báo chưa đọc. FE gọi API `/api/v1/admin/notifications/{id}/read` (PUT).
4. **Bước 4 (BE):** Cập nhật `is_read = TRUE`, `read_at = NOW()` cho đúng bản ghi thuộc `admin_id` đó (BR-01/BR-03 của `Business-rule.md`).
5. **Bước 5 (FE):** Cập nhật lại giao diện (bỏ chấm tròn, giảm Badge). **Chưa có** điều hướng sang màn hình khác theo `type` (khác kỳ vọng ban đầu tương tự E.2).

---

## 2. Luồng Đánh dấu tất cả đã đọc
1. **Bước 1 (FE):** Admin bấm nút "Đánh dấu tất cả đã đọc" (chỉ bật khi `unreadCount > 0`).
2. **Bước 2 (FE -> BE):** Gọi `PUT /api/v1/admin/notifications/read-all`.
3. **Bước 3 (BE):** Chạy 1 câu lệnh `UPDATE` hàng loạt cho toàn bộ thông báo chưa đọc thuộc `admin_id` đó (`is_read = true, read_at = NOW()`), không lặp `UPDATE` từng dòng.
4. **Bước 4 (FE):** Đặt lại toàn bộ item về trạng thái đã đọc trên giao diện, Badge về 0.

---

## 3. Luồng Xoá thông báo
1. **Bước 1 (FE):** Admin bấm icon thùng rác trên 1 item.
2. **Bước 2 (FE -> BE):** Gọi `DELETE /api/v1/admin/notifications/{id}`.
3. **Bước 3 (BE):** Kiểm tra bản ghi thuộc đúng `admin_id` (BR-01) rồi xoá cứng — chưa có Soft-delete.
4. **Bước 4 (FE):** Gỡ item khỏi danh sách; nếu item vừa xoá đang ở trạng thái chưa đọc thì giảm Badge tương ứng.

---

## 4. Luồng phát sinh thông báo mới — hiện CHƯA tồn tại
Khác với E.2 (đã có nguồn phát sinh dự kiến từ Nhắc thuốc — xem `Nhac-thuoc-realtime.md`), module E.5 tại thời điểm viết tài liệu **chưa có bất kỳ nghiệp vụ nào ghi (`INSERT`) bản ghi mới** vào `admin_notifications` (xem BR-05). 3 luồng ở trên (xem/đọc/xoá) chỉ thao tác trên dữ liệu đã có sẵn trong DB — cần chèn tay hoặc script để có dữ liệu test.
