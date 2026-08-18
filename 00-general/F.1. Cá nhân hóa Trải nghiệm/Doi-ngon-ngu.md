# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Chuyển đổi Ngôn ngữ (Việt - Anh)

## 1. Thông tin chung
- **Mã chức năng:** F.1.2
- **Tên chức năng:** Chuyển đổi ngôn ngữ giao diện (Language Switcher — Việt / English)
- **Tác nhân (Actor):** Customer / Admin
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** Không có (theo BR-04 — chỉ lưu tại `localStorage` của từng thiết bị, không đồng bộ DB)

## 2. Mục tiêu
Cho phép người dùng (Customer và Admin) chuyển đổi ngôn ngữ hiển thị của toàn bộ giao diện giữa Tiếng Việt và Tiếng Anh, bao gồm cả nội dung tĩnh trên FE lẫn thông báo lỗi/thành công trả về từ Backend, phục vụ người dùng không thông thạo Tiếng Việt (đối tác nước ngoài, Admin quốc tế...).

## 3. Yêu cầu giao diện & Frontend (FE)
- **Thư viện:** Cài `react-i18next`, `i18next`, `i18next-browser-languagedetector` (tự phát hiện ngôn ngữ trình duyệt lần đầu truy cập khi chưa có lựa chọn nào trong `localStorage`).
- **Từ điển:** Tạo file từ điển riêng cho mỗi ngôn ngữ, ví dụ `src/i18n/locales/vi.json` và `src/i18n/locales/en.json`, cấu trúc key theo namespace/màn hình (vd `auth.login.title`, `toast.error.unauthorized`) để dễ tra cứu và tránh trùng key giữa các màn hình.
- **Nút chọn ngôn ngữ:** Dạng cờ (🇻🇳 / 🇬🇧) đặt cạnh nút Dark Mode Toggle trên Header (F.1.1), dùng Dropdown hoặc nút bấm luân phiên 2 trạng thái.
- **Áp dụng:** Toàn bộ text tĩnh trong FE phải bọc qua hook `useTranslation()` / hàm `t('key')`, không hardcode chuỗi tiếng Việt trực tiếp trong JSX của các màn hình mới.
- **Lưu trạng thái:** Khi đổi ngôn ngữ, gọi `i18n.changeLanguage(lang)`; thư viện tự lưu vào `localStorage` (key mặc định `i18nextLng`), áp dụng ngay không cần tải lại trang.
- **Gửi ngôn ngữ lên Backend:** Cấu hình Axios Interceptor (request, dùng chung tầng với Interceptor xử lý lỗi ở module **E.1**) để tự động đính kèm header `Accept-Language: vi` hoặc `Accept-Language: en` theo ngôn ngữ FE đang chọn vào **mọi** request gửi lên Backend — không set thủ công ở từng lời gọi API riêng lẻ.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────┐
│  🇻🇳 Tiếng Việt          ✓ │
│  🇬🇧 English               │
└────────────────────────────┘
       ▲
┌──────┴─────────────────────────────────────────────────────────┐
│  Gastro AI                                🌙   🇻🇳 ▾   🔔(4)  A │
└───────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- Bấm cờ ngôn ngữ → mở Dropdown 2 lựa chọn → chọn ngôn ngữ → toàn bộ text đã bọc `t()` cập nhật tức thời.
- Phạm vi dịch tối thiểu: tên chức năng/tiêu đề trang, label nút bấm, placeholder input, nội dung Toast (module **E.1**), thông báo lỗi hệ thống nhận từ Backend (Mục 4).
- Dữ liệu do người dùng/Admin tự nhập (họ tên, hồ sơ bệnh lý, nội dung chat AI, log Audit...) **giữ nguyên**, không tự động dịch (BR-05).

## 4. Yêu cầu Backend (BE)
> [!IMPORTANT]
> *Ghi chú kỹ thuật: Hiện tại `GlobalExceptionHandler` và các Service đang **hardcode message tiếng Việt trực tiếp trong code Java** (ví dụ `"Bạn không có quyền truy cập chức năng này"` tại `GlobalExceptionHandler`, hoặc `new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng")` rải rác trong các Service). Để hỗ trợ song ngữ, cần **refactor sang dùng message code thay vì hardcode chuỗi**, tra cứu nội dung qua Spring `MessageSource` — đây là phần việc kỹ thuật đáng kể, không chỉ đơn thuần "đọc header", cần Dev xác nhận phạm vi refactor trước khi ước lượng effort.*

- **Đọc header:** Backend đọc header `Accept-Language` do FE gửi lên (Mục 3) qua `AcceptHeaderLocaleResolver` chuẩn của Spring MVC để xác định `Locale` hiện tại của request.
- **Tài nguyên đa ngôn ngữ:** Tạo file `messages_vi.properties` và `messages_en.properties`, mỗi dòng là 1 cặp `MESSAGE_CODE=nội dung`, ví dụ:
  ```properties
  # messages_vi.properties
  CUSTOMER_NOT_FOUND=Không tìm thấy khách hàng
  UNAUTHORIZED=Tài khoản hoặc mật khẩu không chính xác
  FORBIDDEN=Bạn không có quyền truy cập chức năng này

  # messages_en.properties
  CUSTOMER_NOT_FOUND=User not found
  UNAUTHORIZED=Invalid email or password
  FORBIDDEN=You do not have permission to access this feature
  ```
- **Sửa `BusinessException`/`GlobalExceptionHandler`:** Chuyển từ việc ném thẳng chuỗi message tiếng Việt sang ném **mã lỗi (message code)**, tầng `GlobalExceptionHandler` sẽ tra cứu qua `MessageSource.getMessage(code, args, locale)` (với `locale` lấy từ `LocaleContextHolder`, được set sẵn theo header ở bước trên) trước khi trả về `ApiResponse.error(...)`.
- **Mặc định:** Nếu `Accept-Language` không được gửi hoặc giá trị không phải `vi`/`en`, mặc định dùng `messages_vi.properties` (BR-06).
- **Phạm vi:** Chỉ áp dụng cho các thông báo lỗi/thành công hệ thống hiện có (do `BusinessException`, `MethodArgumentNotValidException`, `AuthenticationException`, `AccessDeniedException` ném ra) — không cần dịch nội dung dữ liệu nghiệp vụ trả về trong response (BR-05).

## 5. Ngoại lệ (Exception Handling)
| Tình huống | Mô tả | Xử lý |
|---|---|---|
| Header `Accept-Language` không hợp lệ hoặc thiếu | Client không gửi hoặc gửi giá trị lạ (vd `fr`, `zh`) | Backend mặc định trả lỗi bằng Tiếng Việt (BR-06) |
| Message code không tồn tại trong file `.properties` (sai sót khi thêm lỗi mới, quên khai báo bản dịch) | `MessageSource` không tìm thấy key tương ứng | Trả lại chính `code` hoặc message mặc định chung (vd "Đã có lỗi xảy ra") thay vì để lộ Exception kỹ thuật (`NoSuchMessageException`) ra Response |
| Người dùng đổi ngôn ngữ giữa lúc đang có request đang chờ phản hồi | Request cũ gửi `Accept-Language` cũ, response trả về theo ngôn ngữ cũ | Chấp nhận được — không cần huỷ/gọi lại request đang chạy, ảnh hưởng không đáng kể vì thời gian request thường rất ngắn |

> [!TIP]
> *Nên đặt tên `MESSAGE_CODE` theo quy ước UPPER_SNAKE_CASE và nhóm theo domain (vd `AUTH_INVALID_CREDENTIALS`, `PROFILE_CUSTOMER_NOT_FOUND`) để tránh trùng lặp code giữa các module khi hệ thống mở rộng thêm nhiều tính năng khác.*
