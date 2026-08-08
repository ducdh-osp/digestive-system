# Tập luật nghiệp vụ (Business Rules) - Quản lý Hồ sơ Cá nhân & Bệnh lý

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Quản lý Hồ sơ.

## BR-01: Xác thực bắt buộc (Authentication Required)
- Toàn bộ API thuộc nhóm A.2 (Xem, Cập nhật thông tin, Đổi mật khẩu, Hồ sơ bệnh lý) bắt buộc phải đính kèm `JWT Token` hợp lệ trong Header `Authorization: Bearer <token>`.
- **Phạm vi áp dụng:** Backend. Nếu thiếu hoặc Token hết hạn, trả về `401 Unauthorized`, không cho phép truy cập.

## BR-02: Tính duy nhất của Số điện thoại/Email khi cập nhật
- Khi khách hàng cập nhật SĐT hoặc Email mới, hệ thống phải đảm bảo giá trị mới không trùng với bất kỳ tài khoản nào khác (ngoại trừ chính tài khoản đang thao tác).
- **Quy tắc:** Nếu phát hiện trùng lặp, Backend chặn lại và trả ngay mã lỗi `409 Conflict` (kế thừa cùng nguyên tắc BR-03 của module Xác thực).

## BR-03: Xác thực mật khẩu cũ khi đổi mật khẩu
- Khách hàng bắt buộc phải cung cấp đúng Mật khẩu hiện tại thì mới được phép đặt Mật khẩu mới.
- **Quy tắc:** Backend dùng Bcrypt `verify()` để so khớp. Mật khẩu mới phải đạt chuẩn tối thiểu 8 ký tự (BR-02 của module Xác thực) và được mã hoá bằng Bcrypt trước khi lưu, tuyệt đối không lưu dạng plaintext.

## BR-04: Quan hệ 1-1 giữa Tài khoản và Hồ sơ bệnh lý
- Mỗi tài khoản khách hàng chỉ được phép sở hữu **duy nhất 01 hồ sơ bệnh lý**.
- **Quy tắc:** Cột `customer_id` trong bảng `medical_profiles` phải có ràng buộc `UNIQUE`. Thao tác lưu hồ sơ bệnh lý luôn là Upsert (Insert nếu chưa có, Update nếu đã tồn tại), không tạo bản ghi trùng.

## BR-05: Đơn vị đo lường chuẩn hoá
- Chiều cao lưu trữ và hiển thị theo đơn vị **centimet (cm)**; Cân nặng theo đơn vị **kilogam (kg)**.
- **Quy tắc:** Giá trị nhập phải là số dương, nằm trong khoảng hợp lý (Chiều cao: 50–250 cm; Cân nặng: 10–300 kg), áp dụng validate ở cả Frontend và Backend.

## BR-06: Toàn vẹn dữ liệu khi cập nhật thông tin cá nhân
- Yêu cầu cập nhật (`PUT /profile`) chỉ được thực hiện khi toàn bộ trường bắt buộc (Họ tên, Số điện thoại) hợp lệ; nếu chỉ một phần dữ liệu sai, toàn bộ request bị từ chối (không cập nhật một phần).
