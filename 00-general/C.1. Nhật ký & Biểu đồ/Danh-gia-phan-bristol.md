# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Đánh giá phân theo thang Bristol

> [!NOTE]
> *Tính năng **chưa có code** tại thời điểm viết tài liệu — xem ghi chú đầu file `Ghi-nhat-ky-an-uong.md` (C.1.1) trong cùng thư mục.*

## 1. Thông tin chung
- **Mã chức năng:** C.1.2
- **Tên chức năng:** Đánh giá phân theo thang Bristol (Bristol Stool Chart Log)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng ghi lại hình dạng phân theo thang phân loại Bristol (7 loại, thang đo y khoa tiêu chuẩn) mỗi lần đi vệ sinh, giúp theo dõi diễn biến tiêu hoá theo thời gian và hỗ trợ phát hiện sớm các dấu hiệu bất thường (táo bón: loại 1-2, tiêu chảy: loại 6-7) — hiển thị lại qua Biểu đồ sức khỏe (**C.1.3**).

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Form "Đánh giá phân" — 1 component chọn card trực quan, không dùng dropdown/radio text thuần vì thang Bristol cần minh hoạ hình ảnh để khách hàng đối chiếu chính xác.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ĐÁNH GIÁ PHÂN (THANG BRISTOL)                                     │
│                                                                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                          │
│  │ Loại 1 │ │ Loại 2 │ │ Loại 3 │ │ Loại 4 │ │ Loại 5 │ │ Loại 6 │ │ Loại 7 │   ← 7 card, mỗi card có   │
│  │  🔵🔵  │ │  🔵🔵  │ │  🌰    │ │  ▬▬▬▬  │ │  ●●●   │ │  ≈≈≈   │ │  ≋≋≋   │      icon minh hoạ +       │
│  │ (chọn) │ │        │ │        │ │        │ │        │ │        │ │        │      mô tả ngắn dưới card  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘                          │
│  Cục cứng   Hình xúc   Nứt nẻ     Mềm mượt   Mềm, rìa   Bờ lởm     Toàn nước                            │
│  rời rạc    xích nứt   mặt        như xúc    rõ, ra dễ  chởm,      không có                             │
│  (táo bón   nẻ         ngoài      xích       dàng       nhão       phần cứng                            │
│  nặng)                                                             (tiêu chảy                          │
│                                                                     nặng)                                │
│                                                                                                        │
│  Thời điểm:     [ 21/08/2026  08:15 .......... ] (mặc định giờ hiện tại)                                │
│  Ghi chú (tuỳ chọn): [ Ví dụ: kèm đau bụng, màu bất thường........................ ]                    │
│                                                                                                        │
│                                          [ 💾 LƯU ĐÁNH GIÁ ]                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Chọn loại phân** (`bristol_type`): bắt buộc chọn đúng 1 trong 7 card (giá trị `1`–`7`), mỗi card hiển thị icon minh hoạ + mô tả ngắn theo đúng thang Bristol chuẩn y khoa (nội dung mô tả tham khảo bảng dưới, dùng làm nguồn cho FE):

  | Loại | Mô tả ngắn | Ý nghĩa |
  |---|---|---|
  | 1 | Cục cứng rời rạc, như hạt | Táo bón nặng |
  | 2 | Hình xúc xích nhưng nứt nẻ mặt ngoài | Táo bón nhẹ |
  | 3 | Hình xúc xích, mặt ngoài có vết nứt | Bình thường (hơi cứng) |
  | 4 | Hình xúc xích/rắn, mềm mượt | Bình thường (lý tưởng) |
  | 5 | Cục mềm, rìa rõ, ra dễ dàng | Thiếu chất xơ nhẹ |
  | 6 | Mảnh mềm, bờ lởm chởm, dạng nhão | Tiêu chảy nhẹ |
  | 7 | Toàn nước, không có phần cứng | Tiêu chảy nặng |

- **Thời điểm** (`log_time`): mặc định thời điểm hiện tại, cho phép chỉnh lùi lại, **không được chọn thời điểm trong tương lai** (đồng nhất BR-03 với C.1.1, xem `Business-rule.md`).
- **Ghi chú** (`notes`): văn bản tự do, tuỳ chọn.
- **Không giới hạn số lần ghi/ngày:** khách hàng có thể ghi nhiều lần trong ngày (số lần đi vệ sinh khác nhau theo từng người) — không có ràng buộc "1 bản ghi/ngày".
- **Xem lại lịch sử:** danh sách các lần đã đánh giá, sắp xếp `log_time DESC`, phân trang "Xem thêm", có nút xoá (sửa nhầm).

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V18__create_bristol_logs.sql` (PostgreSQL) để khởi tạo bảng `bristol_logs`.
  - *Ghi chú:* backlog gốc đề xuất `V8__create_bristol_logs.sql` — đổi thành `V18` cùng lý do đã nêu ở C.1.1 (tránh trùng version với các migration đã tồn tại tới `V16`).
- **API Endpoints:**
  - `POST /api/v1/tracking/bristol-logs` — Tạo mới 1 bản ghi đánh giá cho khách hàng hiện tại.
  - `GET /api/v1/tracking/bristol-logs` — Lấy danh sách của khách hàng hiện tại, hỗ trợ `page`, `size`, `from`, `to`.
  - `DELETE /api/v1/tracking/bristol-logs/{id}` — Xoá 1 bản ghi (sửa nhầm), chỉ với bản ghi của chính khách hàng đó.
- **Luồng xử lý Logic:**
  1. Toàn bộ API yêu cầu `JWT Token` hợp lệ, lọc/kiểm tra theo `customer_id` trích từ Token (BR-01, đồng nhất nguyên tắc với E.2/C.1.1).
  2. Khi tạo mới: validate `bristol_type` trong khoảng 1–7 và `log_time <= NOW()`.
  3. Khi xoá: kiểm tra `customer_id` khớp Token — không khớp/không tồn tại → `404 Not Found`.
  4. Dữ liệu bảng `bristol_logs` được **C.1.3** đọc lại dạng tổng hợp (`COUNT`/`AVG` theo `bristol_type` theo ngày) — không cần API riêng cho biểu đồ ở UC này.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | `bristol_type` ngoài khoảng 1–7, hoặc `log_time` ở tương lai | Text đỏ: "Vui lòng chọn 1 loại phân hợp lệ" / "Thời điểm không hợp lệ" |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `404 Not Found` | Bản ghi không tồn tại hoặc không thuộc về khách hàng hiện tại (khi xoá) | Toast lỗi: "Không tìm thấy bản ghi" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `bristol_logs` (Lưu trữ trên PostgreSQL - File V18)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính, tự sinh bằng hàm UUID của Postgres |
| **`customer_id`** | `UUID` | `NOT NULL`, `FOREIGN KEY -> customers(id) ON DELETE CASCADE` | Khách hàng sở hữu bản ghi |
| **`bristol_type`** | `SMALLINT` | `NOT NULL`, `CHECK (bristol_type BETWEEN 1 AND 7)` | Loại phân theo thang Bristol (1–7) |
| **`log_time`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm ghi nhận |
| **`notes`** | `TEXT` | Nullable | Ghi chú tự do (VD: kèm đau bụng, màu bất thường) |
| **`created_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo bản ghi |
| **`updated_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật gần nhất |

> [!NOTE]
> *Bảng này độc lập với `meal_logs` (C.1.1) — không có khoá ngoại liên kết trực tiếp giữa 2 bảng ở phạm vi MVP. Việc "đối chiếu món ăn nào gây bất thường tiêu hoá nào" là bài toán phân tích/AI ở phạm vi khác, không thuộc UC này.*
