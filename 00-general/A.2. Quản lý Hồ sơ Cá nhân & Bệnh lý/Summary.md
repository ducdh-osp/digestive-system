# Mô tả Luồng hoạt động (Workflow) - Quản lý Hồ sơ Cá nhân & Bệnh lý

Tài liệu này tổng hợp luồng đi (Flow) của hệ thống khi người dùng (Customer) thực hiện các thao tác quản lý hồ sơ cá nhân và hồ sơ bệnh lý.

## 1. Luồng Xem & Cập nhật thông tin cá nhân (View/Update Profile Flow)
**Mục đích:** Cho phép khách hàng xem lại và chỉnh sửa thông tin định danh của mình.

1. **Bước 1 (FE):** Khách hàng vào màn hình Hồ sơ cá nhân. FE tự động gọi API `/api/v1/profile` (GET) để render dữ liệu (đã tách sẵn thành các tab, không cần bấm "Chỉnh sửa" để mở form riêng — form nằm sẵn ở tab "Thông tin cá nhân").
2. **Bước 2 (FE -> BE):** Khách hàng sửa dữ liệu ngay trên tab, bấm "Lưu thay đổi". FE gọi API `/api/v1/profile` (PUT).
3. **Bước 3 (BE):** BE kiểm tra trùng lặp SĐT/Email với các tài khoản khác.
   - Nếu trùng: Trả lỗi `409 Conflict`.
   - Nếu hợp lệ: Cập nhật bảng `customers`, cấp lại Token mới (BR-08), trả về `200 OK`.
4. **Bước 4 (FE):** Nhận kết quả, lưu Token mới vào `localStorage`, cập nhật lại giao diện Profile với dữ liệu mới.

---

## 2. Luồng Đổi mật khẩu (Change Password Flow)
**Mục đích:** Đảm bảo khách hàng chỉ đổi được mật khẩu khi xác thực đúng mật khẩu hiện tại.

1. **Bước 1 (FE):** Khách hàng vào Form Đổi mật khẩu, nhập Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
2. **Bước 2 (FE):** FE validate Mật khẩu mới (>= 8 ký tự) và so khớp với Xác nhận mật khẩu. Bấm "Xác nhận đổi mật khẩu".
3. **Bước 3 (FE -> BE):** Gọi API `/api/v1/profile/password` (PUT).
4. **Bước 4 (BE):** Verify Mật khẩu hiện tại bằng Bcrypt; so khớp Xác nhận; chặn nếu Mật khẩu mới trùng mật khẩu cũ (BR-07).
   - Nếu sai bất kỳ bước nào: Trả lỗi `400 Bad Request`.
   - Nếu đúng: Hash Mật khẩu mới, cập nhật cột `password_hash` trong bảng `customers`.
5. **Bước 5 (FE):** Nhận `200 OK`, thông báo thành công, form tự reset trắng. Khách hàng vẫn giữ nguyên phiên đăng nhập hiện tại.

---

## 3. Luồng Cập nhật hồ sơ bệnh lý (Medical Profile Flow)
**Mục đích:** Thu thập chỉ số thể trạng và tiền sử bệnh lý làm dữ liệu đầu vào cho các tính năng AI của hệ thống.

1. **Bước 1 (FE):** Khách hàng vào tab "Hồ sơ sức khỏe". Nếu đã từng khai báo, form tự động pre-fill dữ liệu cũ; nếu chưa, form hiển thị trống.
2. **Bước 2 (FE):** Khách hàng nhập Chiều cao, Cân nặng, gõ tự do Tiền sử bệnh (ô văn bản, không phải chọn từ danh mục cố định). Bấm "Lưu hồ sơ sức khỏe".
3. **Bước 3 (FE -> BE):** Gọi API `/api/v1/profile/medical` (PUT).
4. **Bước 4 (BE):** Query bảng `medical_profiles` theo `customer_id`.
   - Nếu chưa có bản ghi: `INSERT` bản ghi mới.
   - Nếu đã có: `UPDATE` bản ghi hiện tại (Upsert).
5. **Bước 5 (FE):** Nhận `200 OK`, cập nhật lại giao diện Hồ sơ cá nhân với thông tin bệnh lý mới nhất.

---

## 4. Luồng Đổi ảnh đại diện (Avatar Flow)
**Mục đích:** Cho phép khách hàng cá nhân hoá tài khoản bằng ảnh đại diện.

1. **Bước 1 (FE):** Khách hàng bấm icon camera trên ảnh đại diện, chọn 1 file ảnh từ máy. FE validate ngay định dạng (JPEG/PNG/WEBP) và dung lượng (≤ 2MB) — sai thì báo lỗi, không gọi API.
2. **Bước 2 (FE -> BE):** Gọi API `POST /api/v1/profile/avatar` dạng `multipart/form-data`.
3. **Bước 3 (BE):** Validate lại định dạng/dung lượng — sai trả `400 Bad Request`. Hợp lệ thì lưu file mới vào `uploads/avatars/`, cập nhật `avatar_url` trong bảng `customers`, rồi xoá file ảnh cũ (nếu có).
4. **Bước 4 (FE):** Nhận `200 OK` kèm `avatarUrl` mới, cập nhật ảnh hiển thị ngay không cần tải lại trang.
