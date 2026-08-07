# Hướng Dẫn Cài Đặt Môi Trường (Setup Guide)

Tài liệu này hướng dẫn các developer thiết lập môi trường Local (hỗ trợ cả Windows, macOS, Linux) để chạy dự án **Gastro AI (Hệ thống Tiêu hóa)**. 

Dự án sử dụng cấu trúc Multi-Datasource: 
- **PostgreSQL** (Dữ liệu AI/Khách hàng).
- **MySQL** (Dữ liệu Admin CMS).

---

## 1. Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
- **Java 21** (JDK 21)
- **Node.js** (v18 trở lên)
- **MySQL Server** (Khuyến nghị 8.0+)
- **PostgreSQL** (Khuyến nghị 15+)
- **DBeaver** (Phần mềm quản lý Database - *Khuyến nghị sử dụng*)
- **Git**

> [!NOTE]
> **Dành cho Windows:** Khi cài đặt PostgreSQL trên Windows, bạn có thể tải bản cài đăt trực tiếp. Để hỗ trợ AI, PostgreSQL yêu cầu cài đặt thêm extension **`pgvector`** (Có thể dùng Docker hoặc tải pre-compiled `.exe` cho pgvector trên Github).

---

## 2. Thiết lập Database (RẤT QUAN TRỌNG)

Dự án sử dụng 2 Database cùng lúc. Cần cấu hình tài khoản và mật khẩu khớp với file `application.yml`. Bạn có thể chọn 1 trong 2 cách dưới đây:

### CÁCH 1: Dùng DBeaver (Dễ nhất - Khuyến nghị cho Windows/macOS)

**Bước 1: Thiết lập MySQL (Cho Admin CMS)**
1. Mở DBeaver, tạo kết nối mới (New Connection) tới **MySQL** bằng tài khoản `root` của máy bạn.
2. Chuột phải vào kết nối vừa tạo -> Chọn **SQL Editor** -> **New SQL Script**.
3. Copy đoạn mã sau dán vào và nhấn nút **Execute (Mũi tên cam)**:
```sql
-- Tạo Database
CREATE DATABASE gastro_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo User 'gastro' với mật khẩu '123456' và cấp quyền
CREATE USER 'gastro'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON gastro_admin.* TO 'gastro'@'localhost';
FLUSH PRIVILEGES;
```

**Bước 2: Thiết lập PostgreSQL (Cho AI)**
1. Tạo một kết nối mới tới **PostgreSQL** bằng tài khoản mặc định `postgres`.
2. Mở **SQL Editor** và chạy đoạn mã sau:
```sql
-- Tạo Database
CREATE DATABASE gastro_ai;

-- Sửa mật khẩu cho user postgres thành '123456' (để khớp với code)
ALTER USER postgres WITH PASSWORD '123456';
```
*(Sau đó, hãy nhớ kích hoạt extension `pgvector` vào Database nếu máy bạn đã cài).*

---

### CÁCH 2: Dùng Terminal (Dành riêng cho Linux/Ubuntu)

**1. MySQL:** Mở Terminal (`sudo mysql`) và chạy:
```sql
CREATE DATABASE gastro_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gastro'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON gastro_admin.* TO 'gastro'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**2. PostgreSQL & pgvector:**
Cài đặt core và pgvector:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
# Giả sử máy bạn là Postgres 18
sudo apt install postgresql-18-pgvector -y
```
Vào Postgres (`sudo -u postgres psql`) và chạy:
```sql
CREATE DATABASE gastro_ai;
ALTER USER postgres WITH PASSWORD '123456';
\q
```

---

## 3. Khắc phục lỗi thường gặp trên Linux (Troubleshooting)

Nếu PostgreSQL trên Linux báo lỗi: `could not bind IPv4 address... Cannot assign requested address`
👉 **Cách sửa file `/etc/hosts` bị dính chữ:**
```bash
sudo sed -i 's/\.vn127\.0\.0\.1 localhost/\.vn\n127.0.0.1 localhost/' /etc/hosts
sudo systemctl restart postgresql
```

---

## 4. Hướng dẫn chạy dự án

### 4.1. Chạy Backend (Spring Boot)
Di chuyển vào thư mục backend và khởi chạy bằng Maven Wrapper. (Khi khởi chạy, **Flyway** sẽ tự động tạo toàn bộ các bảng vào 2 Database).

Mở Terminal (hoặc CMD/PowerShell trên Windows) và gõ:
```bash
cd ds-backend

# Trên Linux/macOS:
./mvnw clean compile
./mvnw spring-boot:run

# Trên Windows (Dùng CMD/PowerShell):
mvnw.cmd clean compile
mvnw.cmd spring-boot:run
```
*Backend sẽ chạy tại: `http://localhost:8080`*

### 4.2. Chạy Frontend (React + Vite)
Mở một Terminal/CMD khác, di chuyển vào thư mục frontend, cài đặt thư viện và chạy:

```bash
cd ds-frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại URL được in ra màn hình (thường là `http://localhost:5173`).*

---
**Chúc bạn code vui vẻ! 🎉**
