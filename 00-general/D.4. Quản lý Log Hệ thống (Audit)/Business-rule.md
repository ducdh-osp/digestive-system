# Tập luật nghiệp vụ (Business Rules) - Quản lý Log Hệ thống (Audit)

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Audit Log.

## BR-01: Tính bất biến của Log (Immutability)
- Bản ghi trong `audit_logs` **không được phép sửa hoặc xoá** qua bất kỳ API/giao diện nào của ứng dụng — kể cả bởi tài khoản `SUPER_ADMIN`.
- **Lý do:** Log mất tính toàn vẹn (có thể bị chỉnh sửa) thì mất luôn giá trị làm bằng chứng kiểm toán. Backend không được cung cấp bất kỳ endpoint `PUT`/`DELETE` nào cho `audit_logs`.

## BR-02: Phạm vi ghi log
- Chỉ tự động ghi log cho hành động **thay đổi dữ liệu** (Create/Update/Delete). Hành động **Read** (xem/tra cứu) **không** ghi log.
- **Lý do:** Hành động Read xảy ra với tần suất rất cao (mọi lần load trang), ghi log Read sẽ làm bảng `audit_logs` phình to cực nhanh trong khi giá trị kiểm toán thấp so với chi phí lưu trữ/truy vấn.

## BR-03: Phân quyền xem Audit Log
- Chỉ Admin có Role **`SUPER_ADMIN`** được phép truy cập màn hình D.4.1/D.4.2 (xem và xuất log).
- **Lý do:** Nội dung log có thể hé lộ hành vi/thao tác của các Admin khác (vd `DOCTOR`, `CONTENT_CREATOR`) — không nên để mọi Admin đều xem được nhật ký của người khác, tránh xung đột nội bộ hoặc giám sát trái phép.
- **Phạm vi áp dụng:** Backend enforce bằng `@PreAuthorize("hasRole('SUPER_ADMIN')")` (hoặc tương đương) ở tầng Controller — không chỉ ẩn/hiện menu ở Frontend.

## BR-04: Giới hạn khoảng thời gian khi Export
- Một lần xuất file (D.4.2), khoảng cách giữa `fromDate` và `toDate` **không được vượt quá 90 ngày**.
- **Lý do:** Chặn tình huống Admin lọc "từ ngày hệ thống vận hành tới hiện tại" khiến Backend phải build file với hàng triệu dòng trong 1 request, dễ gây timeout hoặc tràn bộ nhớ.

## BR-05: Không lưu dữ liệu nhạy cảm dạng plaintext trong log
- Với các hành động liên quan tới thông tin nhạy cảm (đổi mật khẩu, cấp token...), cột `description` chỉ được ghi mô tả hành vi (vd `"Admin abc đã đổi mật khẩu cho tài khoản xyz"`), **tuyệt đối không** ghi giá trị thật của mật khẩu/token vào log dù đã hash hay chưa.
- **Lý do:** `audit_logs` có thể được nhiều người có quyền SUPER_ADMIN xem/export ra file — giảm thiểu bề mặt rò rỉ dữ liệu nhạy cảm.

## BR-06: Thời gian lưu trữ (Retention)
- Dữ liệu `audit_logs` phải được lưu trữ tối thiểu **12 tháng** kể từ ngày phát sinh trước khi được cân nhắc archive sang kho lưu trữ lạnh (cold storage) hoặc xoá.
- **Phạm vi áp dụng:** Chưa cần xây dựng cơ chế archive/xoá tự động ở giai đoạn này (ngoài phạm vi D.4.1/D.4.2) — BR này chỉ nhằm đảm bảo không ai vô tình dọn dẹp bảng `audit_logs` sớm hơn mốc 12 tháng khi làm các tác vụ bảo trì DB khác.

## BR-07: Ghi log không được chặn luồng nghiệp vụ chính
- Nếu việc ghi Audit Log thất bại (lỗi kết nối DB tạm thời, timeout...), hành động nghiệp vụ chính (vd Admin cập nhật hồ sơ khách hàng) **vẫn phải thành công bình thường** — lỗi ghi log chỉ được log cảnh báo ở tầng hạ tầng (application log), không rollback giao dịch chính, không trả lỗi cho người dùng.
- **Lý do:** Audit Log là chức năng hỗ trợ (secondary concern), không phải một phần bắt buộc của nghiệp vụ chính — không nên để 1 tính năng phụ làm sập cả luồng chính.
