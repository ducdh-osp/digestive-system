# Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BA) - Xác thực mã OTP

## 1. Thông tin chung
- **Mã chức năng:** A.1.2
- **Tên chức năng:** Xác thực tài khoản (OTP Verification)
- **Tác nhân (Actor):** Khách hàng (Customer)
- **Cơ sở dữ liệu:** PostgreSQL

## 2. Mục tiêu
Hoàn tất quá trình đăng ký tài khoản của khách hàng bằng cách xác thực mã OTP gồm 6 chữ số được gửi tới số điện thoại của họ.

## 3. Yêu cầu giao diện & Frontend (FE)
- **Màn hình:** Form nhập mã xác thực OTP.

### 3.1. Mô tả giao diện (Wireframe Layout)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│                                          XÁC THỰC SỐ ĐIỆN THOẠI                                        │
│                                                                                                        │
│                                   Mã OTP 6 số đã được gửi tới SĐT 09xx.xxx.xxx                         │
│                                                                                                        │
│                                   ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐                             │
│                                   │ 1 │  │ 2 │  │ 3 │  │   │  │   │  │   │                             │
│                                   └───┘  └───┘  └───┘  └───┘  └───┘  └───┘                             │
│                                                                                                        │
│                                           Gửi lại mã sau: 02:59                                        │
│                                                                                                        │
│                                         [                 XÁC NHẬN                 ]                   │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chức năng (Functional)
- **Trường thông tin (Input):**
  - 6 ô input độc lập (hoặc 1 ô gõ 6 số) để khách hàng nhập mã OTP.
- **Xử lý Logic (Đếm ngược):**
  - Khi màn hình hiển thị, bắt đầu **đếm ngược thời gian 180s (3 phút)**. UI hiển thị "Mã OTP sẽ hết hạn sau: MM:SS".
  - Trong lúc đếm ngược, nút "Gửi lại mã" (Resend OTP) bị mờ (Disable).
  - Khi thời gian đếm về 0, nút "Gửi lại mã" sáng lên (Enable) cho phép khách hàng nhấn để yêu cầu hệ thống gửi OTP mới.
- **Quy tắc xác thực:**
  - Tự động call API Verify ngay khi khách hàng nhập đủ số thứ 6, HOẶC cung cấp nút "Xác nhận".

## 4. Yêu cầu Backend (BE)
- **API Endpoint:** `POST /api/v1/auth/verify-otp`
- **Database Migration:** 
  - Tạo file `V3__create_otp_logs.sql` để tạo bảng `otp_logs`. Bảng này lưu trữ SĐT, mã OTP đã sinh, thời gian tạo, thời gian hết hạn (180s), và trạng thái (Đã dùng/Chưa dùng).
- **Luồng xử lý Logic:**
  1. Nhận Payload từ FE gửi lên (SĐT, Mã OTP).
  2. **Check OTP:** Query vào bảng `otp_logs` kiểm tra xem mã OTP có đúng với SĐT không và trạng thái thời gian có còn hiệu lực (<= 180s kể từ lúc tạo) hay không.
  3. **Xử lý kết quả kiểm tra:**
     - Nếu OTP sai hoặc hết hạn: Trả về lỗi `400 Bad Request` hoặc `401 Unauthorized` kèm message phù hợp.
     - Nếu OTP đúng: 
       - Cập nhật trạng thái của OTP đó thành "Đã sử dụng".
       - **Hash password:** Sử dụng BCrypt để mã hóa mật khẩu khách hàng đã nhập ở bước 1.
       - **Lưu Database:** Lưu thông tin tài khoản chính thức (SĐT, Password đã hash, Status = Active) vào bảng `customers`.
       - **Sinh JWT:** Khởi tạo Access Token (và Refresh Token nếu cần).
  4. Trả kết quả HTTP Status `200 OK` về FE kèm theo thông tin User cơ bản và JWT Token để FE tiến hành tự động đăng nhập.

## 5. Ngoại lệ (Exception Handling)
| Mã lỗi HTTP | Mô tả | Hiển thị trên FE |
|---|---|---|
| `400 Bad Request` | Nhập sai mã OTP | "Mã xác thực không đúng. Vui lòng kiểm tra lại." |
| `410 Gone` | Mã OTP đã hết hạn (Quá 180s) | "Mã xác thực đã hết hạn. Vui lòng bấm gửi lại." |
| `429 Too Many Requests`| Bấm "Gửi lại mã" quá nhiều lần | "Bạn đã vượt quá số lần nhận mã trong ngày." |

---

## 6. Cấu trúc Database (Trực quan)

**Bảng: `otp_logs` (Lưu trữ trên PostgreSQL - File V3)**

| Tên cột (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | **`PRIMARY KEY`**, `DEFAULT gen_random_uuid()` | Khóa chính |
| **`phone_number`** | `TEXT` | `NOT NULL` | Số điện thoại nhận mã OTP |
| **`otp_code`** | `VARCHAR(6)` | `NOT NULL` | Mã OTP gồm 6 chữ số |
| **`expires_at`** | `TIMESTAMP` | `NOT NULL` | Thời gian hết hạn (Thời gian sinh ra + 180 giây) |
| **`is_used`** | `BOOLEAN` | `DEFAULT FALSE` | Đánh dấu mã đã được dùng hay chưa (Chống dùng lại 1 mã) |
| **`created_at`** | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian bắt đầu gửi mã |

> [!TIP]
> *Khi call API Verify, hệ thống sẽ thực hiện lệnh: `SELECT * FROM otp_logs WHERE phone_number = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW()`. Nếu trả về kết quả thì OTP hợp lệ.*
