# Mô tả Luồng hoạt động (Workflow) - Nhắc nhở Tiện ích

Tài liệu này tổng hợp luồng đi (Flow) của module C.2 — nơi khách hàng khai báo lịch uống thuốc, và hệ thống tự động sinh thông báo nhắc nhở đúng giờ.

> [!NOTE]
> *Module C (Theo dõi Bệnh lý) hiện chưa có code trong source. Luồng số 2 dưới đây (Scheduler) là phần nối tiếp trực tiếp với **E.2.2 — Nhận thông báo Realtime (Nhắc thuốc)**, xem chi tiết ranh giới trách nhiệm tại mục 2 của `Dat-lich-uong-thuoc.md`.*

## 1. Luồng Đặt lịch uống thuốc (C.2.1 — chủ động, khách hàng thao tác)
**Mục đích:** Cho phép khách hàng khai báo/sửa/tắt/xoá phác đồ uống thuốc cá nhân.

1. **Bước 1 (FE):** Khách hàng mở màn "Lịch uống thuốc", bấm "Thêm lịch", nhập tên thuốc, liều lượng, liên quan bữa ăn, giờ nhắc, thời hạn (tuỳ chọn).
2. **Bước 2 (FE -> BE):** FE gọi `POST /api/v1/tracking/medication-reminders`.
3. **Bước 3 (BE):** Validate dữ liệu (bắt buộc tên thuốc + giờ nhắc, `end_date >= start_date` nếu có), `INSERT` vào bảng `medication_reminders` kèm `customer_id` từ JWT.
4. **Bước 4 (FE):** Toast thành công, thêm dòng mới vào danh sách. Khách hàng có thể bấm Sửa/Xoá/Bật-Tắt bất kỳ lúc nào (gọi `PUT`/`DELETE` tương ứng).

---

## 2. Luồng Scheduler tự động sinh thông báo (C.2.1 → E.2.2 — hệ thống tự kích hoạt)
**Mục đích:** Đẩy nhắc nhở tới đúng khách hàng khi tới giờ uống thuốc theo lịch đã khai báo.

1. **Bước 1 (BE — Job nền):** Scheduler (`@Scheduled`, chạy mỗi phút) quét bảng `medication_reminders`, tìm các bản ghi có `is_active = TRUE`, `reminder_time` khớp giờ:phút hiện tại, và còn trong khoảng `start_date`/`end_date` hiệu lực.
2. **Bước 2 (BE):** Với mỗi bản ghi khớp, `INSERT` 1 thông báo mới vào bảng `notifications` (dùng lại `NotificationService` của **E.2**, `type = MEDICATION_REMINDER`).
3. **Bước 3 (BE — thuộc phạm vi E.2.2):** Tra Registry kết nối Realtime theo `customerId` — nếu đang mở, đẩy sự kiện ngay; nếu không, bỏ qua bước đẩy (thông báo vẫn nằm sẵn trong DB, khách hàng xem lại được qua **E.2.1**).
4. **Bước 4 (FE — thuộc phạm vi E.2.2):** Nếu có kết nối Realtime, Component lắng nghe hiển thị Toast/Popup nhắc nhở ngay lập tức, cập nhật Badge thông báo.

> Ghi chú: Bước 1–2 thuộc trách nhiệm của **C.2.1** (bảng dữ liệu + Job quét); Bước 3–4 thuộc trách nhiệm của **E.2.2** (tầng đẩy Realtime) — 2 UC có thể triển khai song song, không chặn nhau, miễn Bước 2 luôn đảm bảo dữ liệu được lưu DB trước (BR-04 tại `Business-rule.md`).
