# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Giao diện Tối / Sáng (Dark Mode)

## 1. Thông tin chung
- **Mã chức năng:** F.1.1
- **Tên chức năng:** Cá nhân hóa Giao diện Tối/Sáng (Dark Mode Toggle)
- **Tác nhân (Actor):** Customer / Admin
- **Mức độ ưu tiên:** Thấp
- **Cơ sở dữ liệu:** PostgreSQL, bảng `customers` (cột `theme`, **tuỳ chọn** — xem Mục 4)

## 2. Mục tiêu
Cho phép người dùng (Customer trên ứng dụng chính, Admin trên CMS) tự chọn giao diện Sáng/Tối theo sở thích cá nhân hoặc điều kiện ánh sáng môi trường sử dụng, giúp giảm mỏi mắt và tăng trải nghiệm sử dụng, đặc biệt vào ban đêm.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Cấu hình Tailwind CSS:** Dự án đang dùng **Tailwind CSS v4** (CSS-first config, không có `tailwind.config.js` cho `darkMode`). Cần khai báo biến thể `dark` chủ động (class-based) trong `src/index.css`:
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  ```
  Từ đó mọi class dạng `dark:bg-gray-900`, `dark:text-white`... chỉ kích hoạt khi thẻ `<html>` (hoặc thẻ cha) có class `dark` — không phụ thuộc `prefers-color-scheme` của hệ điều hành, để việc bật/tắt hoàn toàn theo lựa chọn chủ động của người dùng (BR-01).
- **Nút Toggle:** Đặt tại Header/Navbar, icon dạng ☀️ (Light) / 🌙 (Dark), dùng chung vị trí khu vực với nút chọn ngôn ngữ (F.1.2).
- **Lưu trạng thái:** Ghi vào `localStorage` (ví dụ key `theme`, giá trị `"light"` hoặc `"dark"`) ngay khi người dùng bấm Toggle (BR-03).
- **Khởi tạo sớm (chống nháy giao diện - FOUT):** Đọc `localStorage` và áp class `dark` lên `<html>` **trước khi** React render lần đầu (đặt đoạn script nhỏ inline trong `index.html`, không đợi bundle JS tải xong), tránh hiện tượng chớp trắng rồi mới chuyển tối.
- **Thứ tự ưu tiên khi tải trang:** Tuân theo BR-02 — ưu tiên `localStorage` thiết bị hiện tại, sau đó mới tới giá trị đồng bộ từ Backend (nếu có, Mục 4), cuối cùng mặc định Light.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  Gastro AI                                        🌙   🇻🇳   🔔(4)  👤 A   │  ← Header (Light Mode)
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Gastro AI                                        ☀️   🇻🇳   🔔(4)  👤 A   │  ← Header (Dark Mode)
└────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- Bấm nút Toggle → đổi ngay class `dark` trên `<html>`, toàn bộ giao diện chuyển màu tức thời (không loading, không reload trang).
- Ghi lại lựa chọn vào `localStorage` ngay lập tức (BR-03).
- Nếu người dùng đã đăng nhập, gọi ngầm API đồng bộ lên Backend (Mục 4) theo kiểu "fire-and-forget" — không hiển thị Toast thành công/lỗi cho thao tác đồng bộ ngầm này, tránh làm phiền người dùng vì một thao tác phụ.

## 4. Yêu cầu Backend (BE) — Tuỳ chọn (Optional)
Phần này **không bắt buộc cho MVP đầu tiên** (Dark Mode vẫn hoạt động đầy đủ chỉ với `localStorage` ở Mục 3); chỉ cần triển khai nếu muốn hỗ trợ đồng bộ giao diện khi người dùng đăng nhập trên nhiều thiết bị khác nhau.

- **Migration:** Thêm cột `theme` vào bảng `customers` (PostgreSQL). Lưu ý: yêu cầu gốc đề xuất tên file `V14__add_theme_to_customer.sql`, tuy nhiên nhánh migration PostgreSQL hiện đã dùng tới `V15__add_soft_delete_to_notifications.sql`, nên file mới phải đặt tên **`V16__add_theme_to_customer.sql`** để không trùng version Flyway:
  ```sql
  ALTER TABLE customers ADD COLUMN theme VARCHAR(10) NOT NULL DEFAULT 'light';
  ALTER TABLE customers ADD CONSTRAINT chk_customers_theme CHECK (theme IN ('light', 'dark'));
  ```
- **API cập nhật:** `PUT /api/v1/profile/theme` (giữ đúng convention `PUT` đang dùng ở `ProfileController` cho `/password`, `/medical`), body `{ "theme": "dark" }`. Cập nhật cột `theme` của đúng khách hàng theo `customer_id` trích từ JWT Token (`Authentication`), không nhận `customerId` từ body/query.
- **API lấy giá trị:** Không tạo endpoint GET riêng — trả kèm trường `theme` trong response sẵn có của `GET /api/v1/profile` (`ProfileResponse`), để FE không phải gọi thêm 1 API riêng chỉ để lấy theme lúc tải trang.
- **Phạm vi Admin:** Bảng `admins` nằm ở CSDL MySQL (`gastro_admin`) riêng biệt với `customers` (PostgreSQL). Việc đồng bộ Theme cho Admin (nếu cần) sẽ cần một migration MySQL tương tự trên bảng `admins` — **ngoài phạm vi** của F.1.1, có thể triển khai ở giai đoạn sau nếu có yêu cầu.

## 5. Ngoại lệ (Exception Handling)
| Tình huống | Mô tả | Xử lý |
|---|---|---|
| Gọi API đồng bộ theme thất bại (mất mạng, `500`) | Backend không cập nhật được `theme` | FE **không** rollback lại giao diện đã đổi, không hiển thị Toast lỗi (BR-03) — chỉ log cảnh báo (console/monitoring), thử đồng bộ lại ở lần đổi theme tiếp theo |
| `401 Unauthorized` khi gọi API đồng bộ | Token hết hạn giữa phiên | Bỏ qua đồng bộ lần này (không chặn Toggle), luồng logout/refresh Token xử lý theo cơ chế chung (module **E.1**) |
| `localStorage` bị chặn/không khả dụng (trình duyệt ẩn danh chặn Storage) | Không lưu được lựa chọn | Toggle vẫn hoạt động trong phiên hiện tại, chỉ mất lựa chọn sau khi tải lại trang — chấp nhận được, không cần xử lý đặc biệt |

> [!TIP]
> *Nên tách riêng Theme Context/Provider (React Context hoặc thư viện nhẹ như `zustand`) khỏi cấu hình i18n (F.1.2) dù 2 nút đặt cạnh nhau trên Header, để tránh 1 module lỗi ảnh hưởng module còn lại và dễ tái sử dụng độc lập nếu sau này tách Admin CMS thành ứng dụng Frontend riêng.*
