# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD) - HỆ THỐNG GASTRO AI
**Mã hạng mục:** TSK-A.0.1  
**Tên hạng mục:** Khởi tạo Nền tảng Dữ liệu Đa luồng (Multi-Datasource) & Thiết lập Kịch bản Flyway (Base V1)  
**Phân hệ:** 0 - Nền tảng Hệ thống  
**Giai đoạn:** Khởi tạo (Phase 1)  

---

## 1. Bối cảnh & Mục tiêu (Context & Objectives)

### 1.1. Vấn đề hiện tại
Hệ thống AI Chatbot Y tế (Gastro AI) phục vụ hai nhóm đối tượng hoàn toàn khác biệt:
1.  **Người dùng cuối (Bệnh nhân/Khách hàng):** Số lượng truy cập lớn, dữ liệu sinh ra liên tục (tin nhắn chat), yêu cầu xử lý tìm kiếm dữ liệu phi cấu trúc (Vector Search cho AI).
2.  **Quản trị viên (Admin):** Truy cập ít hơn, nhưng dữ liệu mang tính cấu trúc cao, yêu cầu tính toàn vẹn và phân quyền chặt chẽ.

Việc gộp chung vào một cơ sở dữ liệu (CSDL) duy nhất sẽ gây rủi ro về bảo mật (lộ lọt hồ sơ y tế) và thắt cổ chai hiệu năng. Đồng thời, team Dev (3 người) cần một cơ chế tự động đồng bộ CSDL để không bị "lệch pha" khi làm việc nhóm.

### 1.2. Mục tiêu giải pháp
*   **Phân tách vật lý:** Sử dụng **PostgreSQL** cho luồng Khách hàng/AI và **MySQL** cho luồng Quản trị (CMS).
*   **Tự động hóa:** Tích hợp công cụ **Flyway** để quản lý phiên bản CSDL (Database Version Control). Mọi thay đổi về cấu trúc bảng phải được viết bằng kịch bản (Script) và hệ thống sẽ tự động thực thi khi khởi động.

---

## 2. Kiến trúc & Luồng Hoạt động (Architecture & Flow)

### 2.1. Quy trình chạy Flyway tự động
Khi hệ thống Backend Spring Boot khởi động, quy trình sau sẽ diễn ra **trước khi** mở cổng (port) cho Frontend gọi API:
1.  Hệ thống kiểm tra bảng `flyway_schema_history` ở cả hai CSDL (Postgres & MySQL).
2.  Xác định phiên bản hiện tại của hệ thống (Ví dụ: Đang trống, hoặc đang ở V1).
3.  Quét mã nguồn để tìm các file kịch bản mới (Ví dụ: `V1__...`, `V2__...`).
4.  Thực thi các kịch bản chưa được chạy theo đúng số thứ tự.
5.  Ghi log trạng thái (Thành công/Thất bại) vào bảng lịch sử. Nếu thất bại, hệ thống **dừng khởi động lập tức** để Dev sửa lỗi.

---

## 3. Thiết kế Dữ liệu: Phân hệ Customer & AI (PostgreSQL)

CSDL này đóng vai trò xử lý lưu lượng cao và lưu trữ hồ sơ bệnh lý nhạy cảm. Kịch bản phiên bản đầu tiên (`V1__init_postgres_schema`) bắt buộc phải thiết lập các thực thể sau:

### 3.1. Thực thể: Khách hàng (Customer Profile)
Mục đích: Định danh và lưu trữ thông tin xác thực của người dùng cuối.

| Tên trường (Field) | Kiểu dữ liệu (Logic) | Ràng buộc nghiệp vụ (Constraints) | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | **UUID** | Khóa chính (PK), Tự động sinh | Bắt buộc dùng chuỗi ngẫu nhiên để chống nội suy số lượng User. |
| `full_name` | Text | Bắt buộc (Not Null) | Tên hiển thị trên giao diện chat. |
| `phone_number`| Text | Duy nhất (Unique), Bắt buộc | Định danh chính để đăng nhập và nhận OTP. |
| `email` | Text | Duy nhất (Unique), Tùy chọn | Dùng để gửi file báo cáo y khoa (PDF) sau này. |
| `password_hash` | Text | Bắt buộc (Not Null) | Mật khẩu phải qua thuật toán băm (VD: Bcrypt). |
| `is_active` | Boolean | Mặc định = `TRUE` | Cờ trạng thái. `FALSE` = Tài khoản bị khóa, cấm đăng nhập. |

### 3.2. Thực thể: Phiên Chat (Chat Session)
Mục đích: Lưu trữ các đoạn hội thoại độc lập giữa User và AI để hiển thị ra thanh Sidebar.

| Tên trường (Field) | Kiểu dữ liệu (Logic) | Ràng buộc nghiệp vụ (Constraints) | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | **UUID** | Khóa chính (PK), Tự động sinh | Khóa phiên chat. |
| `customer_id` | **UUID** | Khóa ngoại (FK), Bắt buộc | Liên kết với Khách hàng. Xóa Khách hàng -> Xóa toàn bộ chat (Cascade). |
| `session_title` | Text | Tùy chọn | Tên gợi nhớ (VD: "Đau dạ dày ngày 20/10"). |
| `is_emergency`| Boolean | Mặc định = `FALSE` | **Cờ Triage:** Bật `TRUE` nếu AI phát hiện từ khóa nguy hiểm (nôn máu, phân đen). |
| `is_deleted` | Boolean | Mặc định = `FALSE` | **Xóa mềm (Soft Delete):** User ấn xóa thì bật cờ này lên, ẩn khỏi UI nhưng vẫn giữ trong DB. |

### 3.3. Yêu cầu Cấu hình Môi trường Y khoa (Vector AI)
*   **Bắt buộc:** Kịch bản V1 phải chứa lệnh kích hoạt tính năng `pgvector` (Extension) để chuẩn bị cho việc lưu trữ dữ liệu Chunking (tài liệu y tế) dùng cho mô hình RAG.

---

## 4. Thiết kế Dữ liệu: Phân hệ Admin CMS (MySQL)

CSDL này phục vụ cho việc vận hành nội bộ, yêu cầu cấu trúc phân quyền (RBAC) chặt chẽ. Kịch bản (`V1__init_mysql_schema`) bao gồm:

### 4.1. Thực thể: Phân quyền (Roles)

| Tên trường (Field) | Kiểu dữ liệu (Logic) | Ràng buộc nghiệp vụ (Constraints) | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Khóa chính, Tăng dần | Dùng ID số tự nhiên cho nhẹ vì DB này không public ra ngoài. |
| `role_name` | Text | Bắt buộc, Duy nhất | Tên chuẩn hóa (VD: `SUPER_ADMIN`, `DOCTOR`). |
| `description` | Text | Tùy chọn | Mô tả quyền hạn của Role này. |

> **Quy tắc Dữ liệu mồi (Seeding Data):**
> Ngay khi tạo bảng xong, hệ thống Flyway phải tự động chèn (Insert) sẵn 3 dòng dữ liệu: `SUPER_ADMIN` (Toàn quyền), `DOCTOR` (Bác sĩ chuyên môn) và `CONTENT_CREATOR` (Nhân sự quản lý tài liệu AI).

### 4.2. Thực thể: Quản trị (Admin)

| Tên trường (Field) | Kiểu dữ liệu (Logic) | Ràng buộc nghiệp vụ (Constraints) | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Khóa chính, Tăng dần | |
| `username` | Text | Bắt buộc, Duy nhất | Tên đăng nhập cấp cho nhân viên. |
| `email` | Text | Bắt buộc, Duy nhất | Email liên hệ công việc. |
| `role_id` | Integer | Khóa ngoại (FK), Bắt buộc | Gắn cứng nhân viên vào 1 nhóm quyền cụ thể. |
| `is_active` | Boolean | Mặc định = `TRUE` | Bật/Tắt quyền truy cập CMS. |
| `last_login` | DateTime| Tùy chọn | Tracking thời gian bảo mật. |

---

## 5. Tiêu chuẩn Kỹ thuật & Nguyên tắc Đội nhóm (Team Rules)

Để đảm bảo dự án không bị vỡ cấu trúc CSDL trong quá trình cả 3 người cùng code, toàn team cam kết tuân thủ 3 nguyên tắc sau:

1.  **Zero Manual Changes (Không can thiệp thủ công):** Cấm tuyệt đối hành vi dùng DBeaver, Navicat hay DataGrip để `CREATE`, `ALTER`, `DROP` bảng/cột trên CSDL dùng chung.
2.  **No Hibernate Auto-DDL:** Thuộc tính `spring.jpa.hibernate.ddl-auto` trong cấu hình Backend bắt buộc phải set là `validate` (chỉ kiểm tra) hoặc `none`. Tuyệt đối không dùng `update` hay `create`.
3.  **Quy trình Thêm/Sửa CSDL mới:**
    *   Thảo luận và thống nhất thay đổi trên file Master Plan.
    *   Dev tạo file Script mới tuân thủ quy tắc đánh số thứ tự (Ví dụ: Nếu code hiện tại đang có file `V4_...`, Dev phải tạo file `V5__ten_chuc_nang_moi.sql`).
    *   Chạy thành công ở Local mới được Commit và Push code lên nhánh chung.

---

## 6. Tiêu chí Nghiệm thu (User Acceptance Testing - UAT)

Hạng mục A.0.1 được đánh giá là **Hoàn thành (Done)** khi thỏa mãn toàn bộ các checklist sau:

- [ ] **Khởi động ứng dụng (Application Startup):** Source code Backend khởi động thành công (Status: Started) mà không văng bất kỳ lỗi kết nối CSDL nào.
- [ ] **Kiểm tra Postgres (User/AI DB):** Truy cập vào Postgres, xác nhận có bảng `customers`, `chat_sessions` đúng kiểu dữ liệu UUID. Lệnh `SELECT * FROM pg_extension;` có trả về kết quả chứa `vector`.
- [ ] **Kiểm tra MySQL (Admin DB):** Truy cập vào MySQL, xác nhận có bảng `roles` và `admins`. Bảng `roles` đã có sẵn 3 dòng dữ liệu mặc định (`SUPER_ADMIN`, `DOCTOR`, `CONTENT_CREATOR`).
- [ ] **Kiểm tra Flyway Tracking:** Cả 2 CSDL đều xuất hiện bảng tự động `flyway_schema_history` và có ghi nhận lịch sử chạy file V1 với cột `success` = `1` (True).