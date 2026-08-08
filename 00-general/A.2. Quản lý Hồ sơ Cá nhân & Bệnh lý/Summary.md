# Mô tả Luồng hoạt động (Workflow) - Quản lý Hồ sơ Cá nhân & Bệnh lý

Tài liệu này tổng hợp luồng đi (Flow) của hệ thống khi người dùng (Customer) thực hiện các thao tác quản lý hồ sơ cá nhân và hồ sơ bệnh lý.

## 1. Luồng Xem & Cập nhật thông tin cá nhân (View/Update Profile Flow)
**Mục đích:** Cho phép khách hàng xem lại và chỉnh sửa thông tin định danh của mình.

1. **Bước 1 (FE):** Khách hàng vào màn hình Hồ sơ cá nhân. FE tự động gọi API `/api/v1/customers/profile` (GET) để render dữ liệu.
2. **Bước 2 (FE):** Khách hàng bấm "Chỉnh sửa thông tin", form được mở với dữ liệu pre-fill sẵn (Họ tên, SĐT, Email).
3. **Bước 3 (FE -> BE):** Khách hàng sửa dữ liệu, bấm "Lưu thay đổi". FE gọi API `/api/v1/customers/profile` (PUT).
4. **Bước 4 (BE):** BE kiểm tra trùng lặp SĐT/Email với các tài khoản khác.
   - Nếu trùng: Trả lỗi `409 Conflict`.
   - Nếu hợp lệ: Cập nhật bảng `customers`, trả về `200 OK`.
5. **Bước 5 (FE):** Nhận kết quả, cập nhật lại giao diện Profile với dữ liệu mới.

---

## 2. Luồng Đổi mật khẩu (Change Password Flow)
**Mục đích:** Đảm bảo khách hàng chỉ đổi được mật khẩu khi xác thực đúng mật khẩu hiện tại.

1. **Bước 1 (FE):** Khách hàng vào Form Đổi mật khẩu, nhập Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
2. **Bước 2 (FE):** FE validate Mật khẩu mới (>= 8 ký tự) và so khớp với Xác nhận mật khẩu. Bấm "Xác nhận đổi mật khẩu".
3. **Bước 3 (FE -> BE):** Gọi API `/api/v1/customers/change-password` (PUT).
4. **Bước 4 (BE):** Verify Mật khẩu hiện tại bằng Bcrypt.
   - Nếu sai: Trả lỗi `400 Bad Request`.
   - Nếu đúng: Hash Mật khẩu mới, cập nhật cột `password_hash` trong bảng `customers`.
5. **Bước 5 (FE):** Nhận `200 OK`, thông báo thành công. Khách hàng vẫn giữ nguyên phiên đăng nhập hiện tại.

---

## 3. Luồng Cập nhật hồ sơ bệnh lý (Medical Profile Flow)
**Mục đích:** Thu thập chỉ số thể trạng và tiền sử bệnh lý làm dữ liệu đầu vào cho các tính năng AI của hệ thống.

1. **Bước 1 (FE):** Khách hàng vào Form Hồ sơ bệnh lý. Nếu đã từng khai báo, form tự động pre-fill dữ liệu cũ; nếu chưa, form hiển thị trống.
2. **Bước 2 (FE):** Khách hàng nhập Chiều cao, Cân nặng, chọn Tiền sử bệnh lý (multi-select). Bấm "Lưu hồ sơ bệnh lý".
3. **Bước 3 (FE -> BE):** Gọi API `/api/v1/customers/medical-profile` (PUT).
4. **Bước 4 (BE):** Query bảng `medical_profiles` theo `customer_id`.
   - Nếu chưa có bản ghi: `INSERT` bản ghi mới.
   - Nếu đã có: `UPDATE` bản ghi hiện tại (Upsert).
5. **Bước 5 (FE):** Nhận `200 OK`, cập nhật lại giao diện Hồ sơ cá nhân với thông tin bệnh lý mới nhất.
