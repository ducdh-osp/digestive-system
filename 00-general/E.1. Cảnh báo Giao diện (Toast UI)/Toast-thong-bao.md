# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Cảnh báo Giao diện (Toast UI)

## 1. Thông tin chung
- **Mã chức năng:** E.1.1
- **Tên chức năng:** Hiển thị Toast lỗi / thành công (Toast Notification)
- **Tác nhân (Actor):** System (Hệ thống tự kích hoạt, không phải thao tác chủ động của người dùng)
- **Mức độ ưu tiên:** Thấp
- **Cơ sở dữ liệu:** Không có (Stateless — chỉ hiển thị tạm thời trên giao diện, không lưu lịch sử)

## 2. Mục tiêu
Cung cấp cơ chế phản hồi tức thời (Instant Feedback) cho người dùng ngay tại màn hình đang thao tác, giúp người dùng biết ngay kết quả của một hành động (thành công) hoặc nguyên nhân thất bại (lỗi), mà không cần chuyển trang hay xem log.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Vị trí hiển thị:** Góc trên bên phải màn hình (Top-right), không che khuất thao tác chính.
- **Thư viện đề xuất:** `React Toastify` hoặc `Ant Design Message/Notification`.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
                                                              ┌──────────────────────────────────────┐
                                                              │ ✕  Cập nhật thông tin thành công!     │
                                                              └──────────────────────────────────────┘
                                                              ┌──────────────────────────────────────┐
                                                              │ ⚠  Phiên đăng nhập đã hết hạn.        │
                                                              │    Vui lòng đăng nhập lại.            │
                                                              └──────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **2 nguồn kích hoạt Toast:**
  1. **Toast Lỗi (Error/Warning):** Được bắt tập trung tại tầng gọi API (khuyến nghị dùng **Axios Response Interceptor**) — bất kỳ API nào trả về lỗi HTTP (`401`, `404`, `500`, ...) đều tự động hiển thị Toast lỗi tương ứng mà không cần từng màn hình tự viết code `try/catch` riêng lẻ.
  2. **Toast Thành công (Success):** Được gọi thủ công tại Component sau khi một thao tác (Create/Update/Delete) trả về kết quả thành công (Ví dụ: "Cập nhật thông tin thành công!", "Lưu hồ sơ bệnh lý thành công!").
- **Thời gian hiển thị:** Tự động biến mất (Auto-dismiss) sau khoảng **3-5 giây**, hoặc người dùng có thể bấm nút "✕" để tắt sớm.
- **Không lưu trữ:** Toast chỉ tồn tại trên UI tại thời điểm phát sinh, không lưu vào Database, không có lịch sử xem lại (khác với module **E.2. Thông báo Cá nhân**).

## 4. Yêu cầu Backend (BE)
Không có yêu cầu API riêng cho tính năng này. Backend chỉ cần đảm bảo:
- Mọi Response lỗi trả về theo cấu trúc thống nhất, ví dụ: `{ "code": "UNAUTHORIZED", "message": "..." }`, để FE Interceptor bóc tách và hiển thị đúng nội dung.
- Mã lỗi HTTP Status phải phản ánh đúng bản chất lỗi (không dùng `200 OK` kèm `success: false` trong body).

## 5. Bảng ánh xạ mã lỗi → Nội dung Toast
| Mã lỗi HTTP | Loại Toast | Nội dung hiển thị mẫu | Xử lý kèm theo |
|---|---|---|---|
| `401 Unauthorized` | Error | "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." | Tự động Logout, chuyển hướng về màn hình Đăng nhập |
| `403 Forbidden` | Error | "Bạn không có quyền thực hiện thao tác này." | — |
| `404 Not Found` | Error | "Không tìm thấy dữ liệu yêu cầu." | — |
| `409 Conflict` | Warning | Lấy nguyên `message` trả về từ BE (Ví dụ: "Số điện thoại đã tồn tại") | Hiển thị thêm lỗi tại field liên quan (nếu có) |
| `500 Internal Server Error` | Error | "Hệ thống đang bận, vui lòng thử lại sau." | — |
| `200 OK` / `201 Created` (sau hành động Create/Update/Delete) | Success | Tuỳ ngữ cảnh (Ví dụ: "Lưu thay đổi thành công!") | — |

> [!TIP]
> *Việc tập trung xử lý lỗi tại Axios Interceptor giúp tránh lặp code hiển thị lỗi ở từng API call riêng lẻ, đồng thời đảm bảo trải nghiệm nhất quán trên toàn hệ thống.*
