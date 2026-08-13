# Mô tả Luồng hoạt động (Workflow) - Cảnh báo Giao diện (Toast UI)

Tài liệu này tổng hợp luồng đi (Flow) khi hệ thống hiển thị Toast lỗi hoặc thành công cho người dùng.

## 1. Luồng Toast Lỗi (Error Flow — tự động, qua Interceptor)
**Mục đích:** Đảm bảo mọi lỗi API đều được thông báo tới người dùng mà không cần từng màn hình tự xử lý.

1. **Bước 1 (FE):** Người dùng thực hiện một thao tác bất kỳ gọi API (Ví dụ: Đăng nhập, Cập nhật hồ sơ...).
2. **Bước 2 (BE):** API trả về lỗi (`401`, `404`, `409`, `500`...) kèm cấu trúc `{ code, message }`.
3. **Bước 3 (FE):** Axios Response Interceptor bắt được lỗi trước khi trả về Component gọi API, tra bảng ánh xạ mã lỗi (Mục 5, `Toast-thong-bao.md`) để lấy nội dung hiển thị phù hợp.
4. **Bước 4 (FE):** Hiển thị Toast Error tại góc trên bên phải màn hình, tự động biến mất sau 3-5s.
   - Riêng lỗi `401`: Thực hiện thêm auto-logout và chuyển hướng về màn hình Đăng nhập (BR-04).

---

## 2. Luồng Toast Thành công (Success Flow — chủ động, tại Component)
**Mục đích:** Xác nhận với người dùng rằng thao tác họ vừa thực hiện đã hoàn tất.

1. **Bước 1 (FE):** Người dùng thực hiện thao tác Create/Update/Delete (Ví dụ: Lưu hồ sơ bệnh lý — module A.2).
2. **Bước 2 (BE):** API trả về `200 OK`/`201 Created`.
3. **Bước 3 (FE):** Component xử lý thao tác đó chủ động gọi hàm hiển thị Toast Success kèm nội dung phù hợp ngữ cảnh (Ví dụ: "Cập nhật thông tin thành công!").
4. **Bước 4 (FE):** Toast tự động biến mất sau 3-5s, không cần thao tác thêm từ người dùng.
