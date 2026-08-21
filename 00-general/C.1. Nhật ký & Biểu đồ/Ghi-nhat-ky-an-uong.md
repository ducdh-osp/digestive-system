# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Ghi nhật ký ăn uống

> [!NOTE]
> *Module C hiện **chưa có dòng code nào** trong source (không có migration, entity, controller, route FE nào tên `meal`/`bristol`/`medication`) — tài liệu này là đặc tả cho tính năng **sắp xây dựng**, khác với các module A/D/E đã tài liệu hoá từ code có sẵn. Số liệu migration, tên bảng, API dưới đây là đề xuất thiết kế, cần đối chiếu lại thực tế sau khi Dev triển khai.*

## 1. Thông tin chung
- **Mã chức năng:** C.1.1
- **Tên chức năng:** Ghi nhật ký ăn uống (Meal Log)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Mức độ ưu tiên:** Trung bình
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng ghi lại các bữa ăn trong ngày (loại bữa, món ăn, thời điểm) nhằm tạo dữ liệu nền phục vụ Biểu đồ sức khỏe (**C.1.3**) và làm dữ liệu đầu vào cho các tính năng tư vấn/AI của hệ thống Gastro AI trong tương lai (đối chiếu triệu chứng tiêu hoá với món ăn đã dùng).

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Form "Ghi nhật ký ăn uống", truy cập từ menu Theo dõi Bệnh lý (module C, cần bổ sung route/menu mới trên `CustomerLayout.tsx` — hiện sidebar chưa có mục này).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          GHI NHẬT KÝ ĂN UỐNG                                            │
│                                                                                                        │
│  Bữa ăn:        ( ) Sáng   ( ) Trưa   ( ) Tối   ( ) Phụ                                                │
│  Thời điểm:     [ 21/08/2026  12:30 .......... ] (mặc định giờ hiện tại, cho phép chỉnh lùi lại)       │
│                                                                                                        │
│  Món đã ăn (chọn 1 hoặc nhiều):                                                                        │
│  [x] Cơm trắng   [ ] Cháo   [x] Rau xanh   [ ] Đồ chiên rán   [ ] Đồ cay   [ ] Rượu/Bia   ...           │
│  Món khác:  [ Nhập tên món không có trong danh sách..................... ] [+ Thêm]                    │
│  Đã thêm: (Bánh mì thịt) ✕                                                                              │
│                                                                                                        │
│  Ghi chú (tuỳ chọn):                                                                                    │
│  [ Ví dụ: ăn nhanh, hơi no................................................................. ]         │
│                                                                                                        │
│                                          [ 💾 LƯU NHẬT KÝ ]                                             │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Loại bữa** (`meal_type`): chọn 1 trong 4 — Sáng/Trưa/Tối/Phụ (`BREAKFAST`/`LUNCH`/`DINNER`/`SNACK`). Bắt buộc.
- **Thời điểm ăn** (`meal_time`): mặc định là thời điểm hiện tại lúc mở form, khách hàng có thể chỉnh lùi lại (ghi log trễ) nhưng **không được chọn thời điểm trong tương lai** (validate cả FE lẫn BE — xem BR-03 tại `Business-rule.md`).
- **Món đã ăn** (`food_items`): danh sách chọn nhanh (checkbox) dựng sẵn các món phổ biến liên quan tiêu hoá (cơm, cháo, rau, đồ chiên rán, đồ cay, rượu/bia, sữa, đồ ngọt...) — danh sách này là hằng số cấu hình phía FE, **không có bảng danh mục món ăn riêng ở BE** (không nằm trong phạm vi MVP). Kèm ô nhập tự do "Món khác" để bổ sung món không có sẵn, thêm được nhiều món qua nút **+ Thêm**, mỗi món thêm hiển thị dạng tag có nút xoá (✕). Bắt buộc chọn/thêm **tối thiểu 1 món**.
- **Ghi chú** (`notes`): văn bản tự do, tuỳ chọn (VD: "ăn nhanh", "hơi no", "kèm đau bụng nhẹ").
- **Xem lại lịch sử:** Màn hình danh sách bên dưới form (hoặc tab riêng) hiển thị các nhật ký đã ghi, sắp xếp `meal_time DESC`, phân trang kiểu "Xem thêm" (đồng nhất với **E.2.1**), cho phép lọc theo khoảng ngày. Mỗi dòng có nút xoá (sửa nhầm) — xem mục 4.

## 4. Yêu cầu Backend (BE)
- **Database Migration:**
  - Tạo file `V17__create_meal_logs.sql` (PostgreSQL) để khởi tạo bảng `meal_logs`.
  - *Ghi chú:* backlog gốc đề xuất tên file `V7__create_meal_logs.sql`, nhưng tại thời điểm viết tài liệu này, migration Postgres mới nhất trong source đã là `V16__add_theme_to_customer.sql` (F.1.1) — đổi thành `V17` để không trùng version với Flyway. Thứ tự tương đối C.1.1 → C.1.2 → C.2.1 vẫn giữ như backlog gốc (V17 → V18 → V19).
- **API Endpoints:**
  - `POST /api/v1/tracking/meal-logs` — Tạo mới 1 nhật ký ăn uống cho khách hàng hiện tại (`customerId` trích từ JWT).
  - `GET /api/v1/tracking/meal-logs` — Lấy danh sách nhật ký của khách hàng hiện tại, hỗ trợ `page`, `size`, `from`, `to` (lọc theo khoảng ngày).
  - `DELETE /api/v1/tracking/meal-logs/{id}` — Xoá 1 nhật ký (sửa nhầm), chỉ cho phép xoá bản ghi của chính khách hàng đó.
- **Luồng xử lý Logic:**
  1. Toàn bộ API yêu cầu `JWT Token` hợp lệ, mọi thao tác đều lọc/kiểm tra theo `customer_id` trích từ Token (giống nguyên tắc BR-01 của module E.2 — không cho thao tác dữ liệu của khách hàng khác dù biết `id`).
  2. Khi tạo mới: validate `meal_time <= NOW()` và `food_items` có ít nhất 1 phần tử trước khi `INSERT`.
  3. Khi xoá: kiểm tra `customer_id` khớp Token rồi mới `DELETE` — không tồn tại/không thuộc về khách hàng → `404 Not Found`.
  4. Dữ liệu bảng `meal_logs` được **Query C.1.3** (Biểu đồ sức khỏe) đọc lại dạng tổng hợp (`COUNT` theo ngày) — không cần API riêng cho biểu đồ ở UC này.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | `meal_time` ở tương lai, hoặc `food_items` rỗng | Text đỏ dưới field tương ứng: "Thời điểm không hợp lệ" / "Chọn ít nhất 1 món ăn" |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `404 Not Found` | Nhật ký không tồn tại hoặc không thuộc về khách hàng hiện tại (khi xoá) | Toast lỗi: "Không tìm thấy nhật ký" |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `meal_logs` (Lưu trữ trên PostgreSQL - File V17)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính, tự sinh bằng hàm UUID của Postgres |
| **`customer_id`** | `UUID` | `NOT NULL`, `FOREIGN KEY -> customers(id) ON DELETE CASCADE` | Khách hàng sở hữu nhật ký |
| **`meal_type`** | `VARCHAR(20)` | `NOT NULL`, `CHECK IN ('BREAKFAST','LUNCH','DINNER','SNACK')` | Loại bữa ăn |
| **`meal_time`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm ăn (khách hàng có thể chỉnh lùi khi ghi log trễ) |
| **`food_items`** | `TEXT[]` | `NOT NULL`, `CHECK (array_length(food_items, 1) >= 1)` | Danh sách tên món đã ăn (mảng Postgres — gộp cả món chọn nhanh lẫn món nhập tự do) |
| **`notes`** | `TEXT` | Nullable | Ghi chú tự do (VD: "ăn nhanh", "kèm đau bụng") |
| **`created_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo bản ghi |
| **`updated_at`** | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật gần nhất |

> [!TIP]
> *Dùng kiểu mảng `TEXT[]` thay vì tách bảng con `meal_log_items` vì phạm vi MVP không cần số lượng/định lượng từng món — chỉ cần biết "đã ăn những gì". Nếu về sau cần thêm khẩu phần (gram/ml) hoặc liên kết món ăn với 1 danh mục dinh dưỡng chuẩn hoá, nên tách bảng con lúc đó thay vì thiết kế trước cho nhu cầu chưa phát sinh.*
