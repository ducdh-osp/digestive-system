# Tập luật nghiệp vụ (Business Rules) - Trang tổng quan CMS (Dashboard)

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Trang tổng quan CMS.

## BR-01: Chỉ số tổng quan không giới hạn theo Role
- 2 thẻ số liệu (`totalCustomers`, `totalAdmins`) hiển thị cho **mọi Admin đã đăng nhập**, không phân biệt Role.
- **Lý do:** Đây là số liệu tổng hợp (aggregate count), không lộ thông tin chi tiết của từng khách hàng/admin cụ thể — không cần siết theo Role như Audit Log (D.4/BR-03).

## BR-02: Khối "Hoạt động gần đây" kế thừa phân quyền của Audit Log (D.4)
- Chỉ Admin có Role **`SUPER_ADMIN`** mới thấy khối "Hoạt động gần đây" trên Trang tổng quan.
- **Lý do:** Khối này hiển thị trực tiếp dữ liệu từ `audit_logs` (D.4/BR-03: log có thể hé lộ hành vi của Admin khác) — Trang tổng quan không được tạo ra một "cửa sau" (backdoor) để Admin không đủ quyền vẫn xem được dữ liệu audit qua đường vòng.
- **Phạm vi áp dụng:** Vì khối này gọi thẳng API `GET /api/v1/admin/audit-logs` sẵn có của D.4 (không có API riêng cho Dashboard), việc phân quyền đã được Backend enforce sẵn ở tầng D.4 — Frontend chỉ ẩn/hiện UI dựa theo `admin.role`, không phải lớp bảo mật duy nhất.

## BR-03: Chỉ hiển thị số liệu tổng hợp, không lộ dữ liệu chi tiết
- Endpoint `GET /api/v1/admin/dashboard/summary` chỉ được trả về các trường dạng đếm (`count`), **không** được mở rộng để trả kèm danh sách/chi tiết bản ghi.
- **Lý do:** Nếu cần xem chi tiết, Admin phải qua đúng màn hình nghiệp vụ tương ứng (vd Audit Log D.4, hoặc màn hình Quản lý Khách hàng/Admin khi được xây dựng) — nơi có kiểm soát phân trang, lọc và phân quyền đầy đủ, tránh Trang tổng quan trở thành lối tắt truy xuất dữ liệu không kiểm soát.

## BR-04: Khung thời gian "gần đây" cố định 7 ngày / 5 bản ghi
- Khối "Hoạt động gần đây" luôn lấy đúng 5 bản ghi audit log mới nhất trong 7 ngày gần nhất (`fromDate` = hôm nay trừ 6 ngày, `toDate` = hôm nay, `size=5`), không cho Admin tuỳ chỉnh khoảng thời gian ngay tại Trang tổng quan.
- **Lý do:** Đây chỉ là bản xem nhanh (preview) — mọi nhu cầu lọc sâu hơn phải điều hướng sang màn hình Audit Log đầy đủ (D.4), tránh trùng lặp UI lọc ở 2 nơi.

## BR-05: Lỗi tải số liệu không được chặn việc vào Trang tổng quan
- Nếu API `summary` hoặc API Audit Log (dùng cho khối "Hoạt động gần đây") lỗi, Admin **vẫn phải đăng nhập và thấy được Sidebar/Header/Layout CMS bình thường** — chỉ riêng phần số liệu bị ảnh hưởng.
- **Hiện trạng cần cải thiện:** Quy tắc này hiện được tuân thủ về mặt "không crash trang", nhưng **chưa có Toast/thông báo lỗi rõ ràng** cho Admin biết số liệu đang tải lỗi (2 thẻ chỉ giữ trạng thái loading vô hạn) — cần bổ sung khi có thời gian, xem ghi chú trong `Trang-tong-quan.md` mục 5.
