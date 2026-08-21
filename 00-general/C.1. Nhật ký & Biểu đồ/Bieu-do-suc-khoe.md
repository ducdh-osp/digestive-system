# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Biểu đồ sức khỏe

> [!NOTE]
> *Tính năng **chưa có code** tại thời điểm viết tài liệu — xem ghi chú đầu file `Ghi-nhat-ky-an-uong.md` (C.1.1) trong cùng thư mục. Riêng UC này còn phụ thuộc thư viện **Recharts chưa được cài đặt** trong `ds-frontend/package.json` hiện tại — xem mục 3.2.*

## 1. Thông tin chung
- **Mã chức năng:** C.1.3
- **Tên chức năng:** Biểu đồ sức khỏe (Health Tracking Charts)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** PostgreSQL (chỉ đọc — không có bảng riêng, tổng hợp từ `meal_logs` C.1.1 và `bristol_logs` C.1.2)

## 2. Mục tiêu
Trực quan hoá dữ liệu nhật ký ăn uống và đánh giá phân đã ghi theo thời gian, giúp khách hàng tự nhận diện xu hướng/bất thường tiêu hoá của bản thân mà không cần đọc số liệu thô.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Tab/Trang "Biểu đồ sức khỏe" trong khu vực Theo dõi Bệnh lý (module C), có bộ lọc khoảng thời gian dùng chung cho cả 2 biểu đồ.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          BIỂU ĐỒ SỨC KHỎE                                               │
│  Khoảng thời gian:  ( ) 7 ngày   (•) 30 ngày   ( ) Tuỳ chọn [ 21/07/2026 → 21/08/2026 ]                  │
│                                                                                                        │
│  Xu hướng đánh giá phân (Bristol)                                                                       │
│  7 ┤                                                                                                    │
│  4 ┤        ●───●        ●                     ← LineChart: trục X = ngày, trục Y = bristol_type       │
│  1 ┤   ●────╯    ╲──●───╯──────●                  (nếu nhiều lần/ngày thì lấy giá trị trung bình)      │
│    └──────────────────────────────────────────                                                         │
│      1/8   5/8   10/8   15/8   20/8                                                                     │
│                                                                                                        │
│  Số bữa ăn đã ghi nhật ký theo ngày                                                                     │
│  4 ┤   ▓▓                                                                                                │
│  2 ┤   ▓▓  ▓▓      ▓▓  ▓▓  ▓▓                    ← BarChart: trục X = ngày, trục Y = số lượng           │
│  0 ┤   ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓  ▓▓                                                                        │
│    └──────────────────────────────────────────                                                         │
│      1/8   5/8   10/8   15/8   20/8                                                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Thư viện vẽ biểu đồ:** `Recharts` — **hiện chưa nằm trong `dependencies` của `ds-frontend/package.json`** (đối chiếu thực tế source ngày viết tài liệu), cần bổ sung (`npm install recharts`) khi triển khai. Không dùng thư viện chart nào khác để đồng nhất với định hướng ban đầu của backlog.
- **Bộ lọc khoảng thời gian:** 3 lựa chọn nhanh — 7 ngày / 30 ngày / Tuỳ chọn (RangePicker chọn ngày bắt đầu-kết thúc). Mặc định 30 ngày khi mở trang.
- **Biểu đồ 1 — Xu hướng Bristol (`LineChart`):** trục X là ngày, trục Y là giá trị Bristol (1–7). Nếu 1 ngày có nhiều bản ghi, lấy **giá trị trung bình** (`AVG`) của ngày đó làm 1 điểm trên biểu đồ. Ngày không có bản ghi nào thì bỏ qua điểm đó (không nội suy giá trị giả).
- **Biểu đồ 2 — Số bữa ăn theo ngày (`BarChart`):** trục X là ngày, trục Y là số lượng nhật ký ăn uống (`COUNT`) trong ngày đó.
- **Trạng thái rỗng:** nếu khoảng thời gian được chọn không có dữ liệu nào ở cả 2 nguồn, hiển thị thông báo "Chưa có dữ liệu nhật ký trong khoảng thời gian này" thay vì biểu đồ trống.

## 4. Yêu cầu Backend (BE)
- **Không cần Database Migration riêng** — UC này chỉ đọc (query aggregate) từ 2 bảng đã có ở C.1.1/C.1.2.
- **API Endpoints:**
  - `GET /api/v1/tracking/charts/bristol-summary?from=&to=` — Trả về danh sách `{ date, avgBristolType, count }` theo từng ngày trong khoảng `[from, to]`, chỉ tính bản ghi thuộc `customerId` hiện tại.
  - `GET /api/v1/tracking/charts/meal-summary?from=&to=` — Trả về danh sách `{ date, mealCount }` theo từng ngày trong khoảng `[from, to]`, chỉ tính bản ghi thuộc `customerId` hiện tại.
- **Luồng xử lý Logic:**
  1. Yêu cầu `JWT Token` hợp lệ; lọc theo `customer_id` trích từ Token — không expose dữ liệu tổng hợp của khách hàng khác.
  2. Dùng câu lệnh `GROUP BY DATE(log_time)` / `DATE(meal_time)` để tính `AVG`/`COUNT` trực tiếp tại DB (Postgres), tránh kéo toàn bộ bản ghi thô về tầng ứng dụng rồi tính tay.
  3. Giới hạn khoảng `[from, to]` tối đa **90 ngày/lần gọi** để tránh query quá nặng khi dữ liệu tích luỹ lâu dài (xem BR-05 tại `Business-rule.md`) — nếu FE gửi khoảng lớn hơn, BE trả `400 Bad Request`.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | `from > to`, hoặc khoảng thời gian vượt quá 90 ngày | Toast lỗi: "Khoảng thời gian không hợp lệ (tối đa 90 ngày)" |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

> [!TIP]
> *Vì UC này không có bảng riêng, không có mục "Cấu trúc Database" — cấu trúc nguồn dữ liệu xem tại mục 6 của `Ghi-nhat-ky-an-uong.md` (`meal_logs`) và `Danh-gia-phan-bristol.md` (`bristol_logs`).*
