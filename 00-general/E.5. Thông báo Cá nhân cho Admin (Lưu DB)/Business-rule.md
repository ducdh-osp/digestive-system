# Tập luật nghiệp vụ (Business Rules) - Thông báo Cá nhân cho Admin

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Thông báo Cá nhân cho Admin (E.5). Các BR này song song với BR của module tương đương phía Customer (**E.2**), chỉ khác tác nhân và CSDL.

## BR-01: Sở hữu dữ liệu theo Admin (Data Ownership)
- Mỗi thông báo (`admin_notifications`) chỉ thuộc về đúng 1 Admin (`admin_id`).
- **Quy tắc:** Mọi API (GET/PUT/DELETE) bắt buộc phải lọc và kiểm tra theo `admin_id` trích từ JWT Token của người gọi. Không cho phép một Admin xem/sửa/xoá thông báo của Admin khác dù biết chính xác `id` bản ghi (trả `404 Not Found` thay vì `403 Forbidden`, cùng nguyên tắc với BR-01 của E.2).

## BR-02: Không phân quyền theo Role — khác Audit Log (D.4)
- Mọi Admin đã đăng nhập (bất kể Role: `SUPER_ADMIN`, `DOCTOR`, `CONTENT_CREATOR`...) đều được xem/quản lý thông báo cá nhân của chính mình.
- **Lý do:** Đây là thông báo cá nhân, không phải dữ liệu nhạy cảm cần giới hạn theo Role như Audit Log (D.4/BR-03) — mọi tài khoản đều cần biết thông báo gửi riêng cho mình.
- **Lưu ý triển khai:** `AdminNotificationController` hiện chưa gắn `@PreAuthorize` cụ thể — chỉ đăng nhập hợp lệ (JWT hợp lệ, prefix `ADMIN:`) là gọi được, cần rà soát nếu sau này có yêu cầu siết chặt hơn.

## BR-03: Trạng thái Đã đọc chỉ thay đổi 1 chiều
- Một thông báo khi đã được đánh dấu `is_read = TRUE` thì không tự động quay lại trạng thái chưa đọc.
- **Quy tắc:** Cột `read_at` chỉ được ghi nhận lần đầu tiên chuyển trạng thái — giống BR-02 của E.2.

## BR-04: Tách biệt hoàn toàn dữ liệu với Customer (E.2)
- `admin_notifications` (MySQL) và `notifications` (PostgreSQL, E.2) là 2 bảng độc lập, không dùng chung khoá, không JOIN chéo CSDL.
- **Lý do:** `admins` và `customers` vốn đã sống ở 2 CSDL khác nhau (xem `Architecture-and-Codebase.md`) — tách bảng thông báo theo đúng ranh giới đó, tránh phát sinh nhu cầu Distributed Transaction giữa Postgres và MySQL.

## BR-05: Nguồn phát sinh thông báo (Producer) phải tự chịu trách nhiệm ghi DB
- Bất kỳ nghiệp vụ nào trong tương lai cần cảnh báo tới Admin (vd cảnh báo hệ thống, tổng hợp Audit Log nghiêm trọng...) bắt buộc phải tự `INSERT` bản ghi vào `admin_notifications`, không có cơ chế tự động nào sinh thông báo hộ.
- **Hiện trạng:** Tính tới thời điểm viết tài liệu, **chưa có Service nào** trong hệ thống ghi bản ghi mới vào bảng này — module E.5 mới chỉ có chiều đọc/quản lý (list, đọc, đánh dấu đã đọc, xoá).
