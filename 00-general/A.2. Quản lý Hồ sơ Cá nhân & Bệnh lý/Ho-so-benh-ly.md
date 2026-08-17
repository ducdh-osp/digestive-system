# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Cập nhật hồ sơ bệnh lý

## 1. Thông tin chung
- **Mã chức năng:** A.2.4
- **Tên chức năng:** Cập nhật hồ sơ bệnh lý (Medical Profile)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Cho phép khách hàng khai báo và cập nhật các chỉ số thể trạng cùng tiền sử bệnh lý tiêu hoá, làm dữ liệu đầu vào phục vụ cho các tính năng tư vấn/AI của hệ thống Gastro AI.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Form Cập nhật hồ sơ bệnh lý (Medical Profile).

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│                                          HỒ SƠ SỨC KHỎE                                                │
│                                                                                                        │
│                                          Chiều cao (cm):        Cân nặng (kg):                         │
│                                          [ 170................] [ 65................]                 │
│                                                                                                        │
│                                          Tiền sử bệnh                                                  │
│                                          [ Ví dụ: Viêm dạ dày, trào ngược dạ dày...................  ] │
│                                          [ ............................................ (6 dòng)....  ] │
│                                                                                                        │
│                                          [ 💾 LƯU HỒ SƠ SỨC KHỎE ]                                      │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - Chiều cao — đơn vị cm (Tùy chọn, kiểu số)
  - Cân nặng — đơn vị kg (Tùy chọn, kiểu số)
  - Tiền sử bệnh — **ô nhập văn bản tự do** (`Input.TextArea`, không phải multi-select checkbox), khách hàng gõ trực tiếp (Ví dụ: "Viêm dạ dày, trào ngược dạ dày"). Không giới hạn danh mục bệnh cố định.
- **Quy tắc xác thực (Validation - TS Form):**
  - Chiều cao/Cân nặng nếu nhập phải là số dương, hợp lý (Ví dụ: Chiều cao trong khoảng 1–300, Cân nặng trong khoảng 1–500 — khớp giới hạn `InputNumber` phía Frontend).
  - Nếu màn hình được mở lần đầu (khách hàng chưa từng khai báo), form hiển thị trống; nếu đã khai báo trước đó, form tự động điền (pre-fill) dữ liệu cũ để khách hàng chỉnh sửa.

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `PUT /api/v1/profile/medical`
- **Database Migration:**
  - Tạo file `V5__create_medical_profiles.sql` để khởi tạo bảng `medical_profiles` lưu trữ thông tin y tế của khách hàng.
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE gửi lên (Chiều cao, Cân nặng, Danh sách tiền sử bệnh lý) kèm `customerId` trích từ JWT Token.
  2. **Kiểm tra tồn tại:** Query bảng `medical_profiles` theo `customer_id`.
     - Nếu chưa có bản ghi: Thực hiện `INSERT` bản ghi mới.
     - Nếu đã có bản ghi: Thực hiện `UPDATE` bản ghi hiện tại (thao tác Upsert).
  3. Trả về HTTP Status `200 OK` kèm dữ liệu hồ sơ bệnh lý mới nhất.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Chiều cao/Cân nặng nằm ngoài khoảng hợp lệ | Text đỏ dưới ô tương ứng: "Giá trị không hợp lệ" |
| `401 Unauthorized` | Token không hợp lệ hoặc đã hết hạn | Tự động đăng xuất, chuyển hướng về màn hình Đăng nhập |
| `500 Internal Error` | Lỗi kết nối DB / Lỗi server chưa xác định | Toast lỗi: "Hệ thống đang bận, vui lòng thử lại sau" |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `medical_profiles` (Lưu trữ trên PostgreSQL - File V5)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính, tự sinh bằng hàm UUID của Postgres |
| **`customer_id`** | `UUID` | `NOT NULL`, **`UNIQUE`**, `FOREIGN KEY -> customers(id) ON DELETE CASCADE` | Liên kết 1-1 với tài khoản khách hàng |
| **`height_cm`** | `NUMERIC(5,2)` | Nullable, `CHECK > 0` | Chiều cao (đơn vị cm) |
| **`weight_kg`** | `NUMERIC(5,2)` | Nullable, `CHECK > 0` | Cân nặng (đơn vị kg) |
| **`medical_history`** | `TEXT` | Nullable | Văn bản tự do mô tả tiền sử bệnh (không phải mảng/JSON có cấu trúc) |
| **`created_at`** | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo hồ sơ (lần đầu khai báo) |
| **`updated_at`** | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

> [!NOTE]
> *Ràng buộc `UNIQUE` trên cột `customer_id` đảm bảo mỗi khách hàng chỉ có duy nhất 01 hồ sơ bệnh lý, phục vụ thao tác Upsert (Insert nếu chưa có, Update nếu đã tồn tại) ở Bước 2 của luồng xử lý Backend.*
