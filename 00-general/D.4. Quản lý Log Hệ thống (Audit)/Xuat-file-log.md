# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Xuất file Log (Export)

## 1. Thông tin chung
- **Mã chức năng:** D.4.2
- **Tên chức năng:** Xuất file Log (Export Audit Log)
- **Tác nhân (Actor):** Admin (cùng điều kiện quyền với D.4.1 — xem BR-03)
- **Cơ sở dữ liệu:** MySQL (đọc từ bảng `audit_logs` — không tạo migration mới)

## 2. Mục tiêu
Cho phép Quản trị viên xuất lịch sử hoạt động (theo đúng bộ lọc đang xem ở D.4.1) ra file `.xlsx`/`.csv` để lưu trữ ngoài hệ thống, làm báo cáo định kỳ, hoặc cung cấp cho bên kiểm toán/đối tác khi được yêu cầu.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Vị trí:** Nút "Xuất file" đặt ngay cạnh nút "Lọc" ở màn hình D.4.1 (xem wireframe tại `Xem-loc-lich-su.md`, Mục 3.1).

### 3.1. Chức năng (Functional)
- Nút Export là Dropdown-Button gồm 2 lựa chọn: **Xuất Excel (.xlsx)** và **Xuất CSV (.csv)**.
- File xuất ra **tuân theo đúng bộ lọc (fromDate/toDate/action/adminId) đang áp dụng trên bảng** tại thời điểm bấm — không phải xuất toàn bộ log trong hệ thống. Nếu chưa lọc gì, mặc định lấy đúng khoảng ngày mặc định 7 ngày gần nhất (khớp mặc định ở D.4.1).
- Trong lúc chờ file tạo xong (dữ liệu lớn có thể mất vài giây), nút Export chuyển trạng thái loading, disable để tránh bấm xuất trùng nhiều lần.
- Sau khi nhận file, trình duyệt tự động tải xuống (không mở tab mới).

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `GET /api/v1/admin/audit-logs/export?format=xlsx|csv&fromDate=&toDate=&action=&adminId=`
  - Dùng chung bộ lọc và quy tắc phân quyền với API `GET /api/v1/admin/audit-logs` ở D.4.1 (BR-03).
- **Xử lý theo định dạng:**
  - `xlsx`: Dùng thư viện **Apache POI** (`XSSFWorkbook`) build file Excel — dòng đầu là header tiếng Việt (Thời gian, Admin thực hiện, Hành động, Đối tượng, Mô tả, Địa chỉ IP), mỗi dòng tiếp theo là 1 bản ghi log khớp bộ lọc.
  - `csv`: Build trực tiếp bằng `StringBuilder`/`OutputStreamWriter` (không cần Apache POI cho CSV — POI chỉ cần thiết cho định dạng nhị phân `.xlsx`), phân cách dấu phẩy, escape đúng chuẩn nếu `description` chứa dấu phẩy/xuống dòng.
- **Response:** Trả file dạng `ResponseEntity<byte[]>` hoặc `StreamingResponseBody`, header `Content-Disposition: attachment; filename="audit-log_<fromDate>_<toDate>.xlsx"` và `Content-Type` tương ứng (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` hoặc `text/csv`).
- **Giới hạn khoảng thời gian xuất (BR-04):** Nếu khoảng `fromDate` → `toDate` vượt quá giới hạn cho phép, trả lỗi ngay từ Backend, không cố xử lý rồi timeout giữa chừng.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Tham số lọc sai, hoặc khoảng ngày vượt giới hạn export (BR-04) | Toast lỗi: "Khoảng thời gian xuất file tối đa là 90 ngày, vui lòng thu hẹp bộ lọc" |
| `401 Unauthorized` | Token không hợp lệ/hết hạn | Tự động đăng xuất |
| `403 Forbidden` | Không đủ quyền | Toast lỗi: "Bạn không có quyền xuất dữ liệu này" |
| `404 Not Found` | Không có bản ghi log nào khớp bộ lọc | Toast: "Không có dữ liệu để xuất" (chặn ngay ở FE trước khi gọi API nếu bảng đang rỗng) |
| `500 Internal Error` | Lỗi khi build file (Apache POI lỗi, hết bộ nhớ với dữ liệu quá lớn) | Toast lỗi: "Xuất file thất bại, vui lòng thử lại sau" |

> [!TIP]
> *Nên xây dựng file Excel theo kiểu **streaming** (`SXSSFWorkbook` của Apache POI thay vì `XSSFWorkbook` thường) nếu lượng log trong 1 lần export có thể lên tới hàng chục nghìn dòng trở lên — tránh load toàn bộ dữ liệu vào RAM cùng lúc gây tràn bộ nhớ server.*
