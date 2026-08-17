# Tập luật nghiệp vụ (Business Rules) - Xác thực tài khoản

Dưới đây là danh sách các quy tắc nghiệp vụ (BR) bắt buộc phải tuân thủ trong toàn bộ quá trình thiết kế, lập trình Frontend và Backend cho module Xác thực.

## BR-01: Định dạng Số điện thoại
- Số điện thoại hợp lệ phải là số điện thoại Việt Nam.
- **Quy tắc:** Bắt buộc bắt đầu bằng số `0`, có độ dài đúng `10` chữ số. Chỉ chứa ký tự số (0-9).
- **Phạm vi áp dụng thực tế:** Chỉ được validate đầy đủ (cả FE lẫn BE, `@Pattern(regexp = "^0\\d{9}$")`) ở 2 màn **Đăng ký (A.1.1)** và **Xác thực OTP (A.1.2)**. Ở màn **Đăng nhập (A.1.3)** và **Quên mật khẩu (A.1.4)**, Backend chỉ validate `@NotBlank` (không kiểm tra định dạng), Frontend dùng pattern lỏng hơn `/^[0-9]{10}$/` (10 số, không bắt buộc bắt đầu bằng 0) — đây là khoảng hở cần đội Dev xem xét đồng bộ lại nếu muốn áp dụng BR-01 nhất quán trên toàn module.

## BR-02: Quy tắc Mật khẩu
- Mật khẩu phải có độ dài tối thiểu **8 ký tự** (`Pass >= 8`).
- Bắt buộc phải có trường "Xác nhận mật khẩu" trên UI. Hai trường này phải so khớp tuyệt đối.
- **Bảo mật:** Backend tuyệt đối không lưu mật khẩu dạng rõ (plaintext). Bắt buộc mã hoá bằng thuật toán **Bcrypt** trước khi lưu vào cột `password_hash`.

## BR-03: Tính duy nhất của Tài khoản
- Một số điện thoại chỉ được phép liên kết với **duy nhất 01 tài khoản**.
- **Quy tắc:** Khi đăng ký, nếu BE phát hiện SĐT đã tồn tại trong DB, hệ thống chặn lại và trả ngay mã lỗi `409 Conflict`. Cột `phone_number` trong DB phải có ràng buộc `UNIQUE`.

## BR-04: Quy tắc sinh và hạn dùng mã OTP
- Độ dài mã OTP là **6 chữ số** (sinh ngẫu nhiên).
- **Thời gian hiệu lực (TTL):** Đúng **180 giây (3 phút)** kể từ thời điểm BE sinh ra mã.
- **Giới hạn spam:** Một số điện thoại chỉ được yêu cầu gửi lại mã OTP tối đa **5 lần / ngày**. Nếu vượt quá, trả lỗi `429 Too Many Requests`.
- **Lưu ý:** Bảng `otp_logs` không phân biệt "mục đích" tạo OTP (Đăng ký hay Quên mật khẩu) — hạn mức 5 lần/ngày này là **hạn mức dùng chung** giữa 2 luồng A.1.1 và A.1.4 cho cùng một SĐT, không phải 5 lần riêng cho mỗi luồng.

## BR-05: Thu hồi và trạng thái OTP
- Mã OTP chỉ được sử dụng thành công **đúng 1 lần**. 
- Sau khi xác thực thành công, trạng thái OTP trong bảng `otp_logs` bắt buộc phải cập nhật thành `is_used = TRUE` để ngăn chặn hành vi dùng lại mã cũ (Replay attack).

## BR-06: Quy tắc bảo mật Phiên làm việc (Token)
- Mọi giao tiếp sau khi đăng nhập thành công phải dùng **JSON Web Token (JWT)**.
- **Access Token:** Dùng để gọi API, thời gian sống (Expiration) ngắn: **1 giờ**.
- **Refresh Token:** Dùng để cấp lại Access Token khi hết hạn, thời gian sống dài: **7 ngày**.
- Khi người dùng đăng xuất (Logout), hệ thống phải xoá/vô hiệu hoá Token ở cả Client và Server.

## BR-07: Luồng Quên mật khẩu
- Khi người dùng chọn quên mật khẩu, hệ thống sinh ra một mã OTP 6 số và gửi qua SMS (tuân thủ BR-04 và BR-05 về giới hạn spam và tính năng sử dụng 1 lần).
- Chỉ cho phép thay đổi mật khẩu khi người dùng cung cấp chính xác Số điện thoại, Mã OTP hợp lệ, và Mật khẩu mới đạt chuẩn (tuân thủ BR-02).
- Nếu mã OTP sai hoặc hết hạn, trả về lỗi `400 Bad Request`.

## BR-08: Tiền tố định danh Token (Prefix Authentication) giữa Customer và Admin
- Hệ thống có 2 tác nhân đăng nhập độc lập: Khách hàng (Customer - PostgreSQL) và Quản trị viên (Admin - MySQL). Chi tiết luồng đăng nhập Admin CMS xem tại module **A.3. Xác thực tài khoản CMS**.
- **Quy tắc:** Khi cấp phát Token cho Customer, Backend bắt buộc phải gắn tiền tố `CUSTOMER:` vào `Subject` của JWT (tương ứng Admin là `ADMIN:`) để phân luồng truy xuất dữ liệu đúng Database, ngăn chặn hoàn toàn việc leo quyền (Privilege Escalation) giữa 2 tác nhân dù trùng Username/SĐT.
