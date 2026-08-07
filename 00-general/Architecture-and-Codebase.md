# Kiến trúc Hệ thống & Tổ chức Mã nguồn (Architecture & Codebase)

Tài liệu này giải thích chi tiết cấu trúc thư mục, các file và luồng hoạt động **dựa trên chính xác bộ khung (boilerplate) hiện tại** của dự án Gastro AI. Cấu trúc này áp dụng các nguyên lý của **Clean Architecture**, **Domain-Driven Design (DDD)** và **CQRS** để đảm bảo khả năng mở rộng tối đa cho một hệ thống lớn.

---

## 1. Cấu trúc Mã nguồn Backend (Spring Boot)
Backend chia thành 4 lớp (Layer) độc lập: `api`, `application`, `domain`, và `infrastructure`. Mỗi thư mục (package) đều mang một nhiệm vụ chuyên biệt, kể cả những thư mục hiện đang rỗng cũng đóng vai trò chuẩn bị cho tương lai.

### 1.1. Lớp Giao tiếp (`api`)
Đóng vai trò là cửa ngõ giao tiếp với bên ngoài. Không bao giờ chứa logic nghiệp vụ.
- **`controllers/`**: Chứa các RestController. Nhận HTTP Request, map sang Command/Query và trả về Response. (Ví dụ: `AuthController.java`, `AdminAuthController.java`).
- **`graphql/`**: Cửa ngõ dành riêng cho các truy vấn GraphQL (thay thế hoặc song hành cùng REST).
- **`consumers/`**: Nơi tiếp nhận các Message/Event từ các hệ thống Queue bên ngoài (như Kafka, RabbitMQ) gửi đến.

### 1.2. Lớp Ứng dụng (`application`)
Chứa các Use Case (Trường hợp sử dụng) cụ thể của ứng dụng, điều phối luồng xử lý (CQRS).
- **`commands/`**: Chứa các Command Object đại diện cho các hành động làm **thay đổi dữ liệu** (Create, Update, Delete) theo chuẩn CQRS.
- **`queries/`**: Chứa các Query Object đại diện cho hành động **lấy dữ liệu** (Read).
- **`dtos/`**: Data Transfer Object. Lớp vỏ bọc dữ liệu để giao tiếp với Client (Request/Response).
- **`services/`**: Các Application Service để điều phối luồng chạy (Ví dụ: `AuthService`, `JwtService`).
- **`events/`** & **`listener/`**: Các Event nội bộ của ứng dụng và các Listener lắng nghe các Event đó.
- **`exceptions/`**: Các Exception riêng biệt của tầng Application.
- **`mappers/`**: Các class/interface dùng để map dữ liệu giữa Entity và DTO (thường dùng MapStruct).
- **`annotation/`, `config/`, `constants/`, `enums/`, `helpers/`, `utils/`**: Các hằng số, cấu hình, và hàm tiện ích phục vụ riêng cho tầng Application.

### 1.3. Lớp Miền (`domain`)
Trái tim của phần mềm, chứa các logic nghiệp vụ cốt lõi không bao giờ thay đổi dù Framework hay Database có đổi. Không được phép phụ thuộc vào bất kỳ thư viện bên ngoài nào (như Spring Data, JPA).
- **`entities/`**: Các Domain Entity, đại diện cho thực thể kinh doanh (Khác hoàn toàn với JPA Entity).
- **`enums/`** & **`constant/`**: Hằng số và Enum cốt lõi của nghiệp vụ.
- **`repositories/`**: Định nghĩa các Interface để giao tiếp với DB. (Lưu ý: Chỉ định nghĩa interface, phần code thực thi sẽ nằm ở `infrastructure`).
- **`services/`**: Các Domain Service xử lý logic tinh vi liên quan tới nhiều Domain Entity.
- **`projections/`**: Định nghĩa các class/interface để Read-Model (đọc dữ liệu nhanh, phục vụ cho `queries/`).

### 1.4. Lớp Hạ tầng (`infrastructure`)
Đảm nhiệm mọi thứ liên quan đến công nghệ cụ thể (Database, Redis, Security, API bên thứ 3).
- **`config/`**: Cấu hình Spring Boot, DataSource (Multi-tenant MySQL & Postgres), Flyway.
- **`entities/`**: Các class JPA (có `@Entity`, `@Table`) ánh xạ trực tiếp 1-1 với DB. Nơi đây chia ra `mysql/` (bảng Admin) và `postgres/` (bảng Customer).
- **`repositories/`**: Các class/interface kế thừa `JpaRepository`, code thực thi (implement) cho các Interface định nghĩa ở tầng `domain`. 
- **`security/`**: Cấu hình Spring Security, JwtFilter, và logic cấp quyền (`UserDetailsServiceImpl.java` xử lý luồng Prefix Authentication).
- **`client/`**: Các FeignClient hoặc RestTemplate để gọi API ra các hệ thống bên ngoài.
- **`file/`**: Logic upload/download file (như S3, Local Storage).
- **`converters/`**, **`eventhandlers/`**, **`helpers/`**, **`listeners/`**, **`models/`**, **`services/`**: Các tiện ích, xử lý event hệ thống và service phụ trợ của hạ tầng (như EmailService, SmsService).

---

## 2. Cấu trúc Mã nguồn Frontend (React + Vite)
Được tổ chức theo dạng Module-based lai Feature-Sliced Design (FSD).

### 2.1. Cấu hình lõi (`app` & `core`)
- **`app/`**: Chứa cấu hình bao bọc toàn ứng dụng.
  - `routes/`: Cây định tuyến React Router (`index.tsx`). Chứa logic chặn khách vãng lai (ProtectedRoute) và điều hướng.
  - `providers/`: Các Context/Provider bọc ngoài App (như Redux Provider, Theme Provider).
  - `styles/`: CSS toàn cục, Tailwind Config.
- **`core/`**: Cấu hình nền tảng.
  - `api/`: Cấu hình `axiosClient.ts`, tự động gắn Token và bắt lỗi.
  - `constants/`, `exceptions/`, `utils/`: Hằng số, hàm xử lý lỗi, tiện ích cốt lõi của app.
- **`assets/`**: Chứa ảnh, icon dùng toàn cục ở cấp độ App (như logo `hero.png`, SVG React).

### 2.2. Các Tính năng (`modules/`)
Nơi chia mã nguồn theo từng **Tính năng** độc lập. Hiện tại gồm `auth`, `admin-auth`, `admin`. Cấu trúc quy chuẩn bên trong mỗi module:
- **`pages/`**: Các component đại diện cho 1 trang màn hình hoàn chỉnh (vd: `LoginPage.tsx`, `AdminDashboardPage.tsx`).
- **`api/`**: Nơi chứa các hàm Axios call API của riêng module đó (vd: `authApi.ts`).
- **`types/`**: (Nếu có) Định nghĩa Interface/Type cho Typescript.
- Thư mục chuẩn nhưng có thể ẩn/rỗng: `components/` (các UI con của trang), `hooks/` (Custom hook), `store/` (State cục bộ).

### 2.3. Lớp Dùng chung (`shared/`)
Chứa các thành phần được sử dụng lại ở nhiều Module khác nhau, tránh lặp code.
- **`layouts/`**: Các khung bao bọc trang (vd: `AuthLayout.tsx` quy định hình ảnh background dùng chung cho mọi trang đăng nhập).
- **`components/`**: Các Button, Input, Modal dùng chung toàn hệ thống.
- **`hooks/`**: Các Custom Hook phổ quát (như `useWindowSize`, `useAuth`).
- **`assets/`**: Ảnh/icon phụ trợ.

---

## 3. Luồng hoạt động (Workflow) thực tế
Lấy ví dụ với tính năng **Đăng nhập Quản trị viên (CMS)**, luồng chảy dữ liệu sẽ đi qua các lớp như sau:

1. **(FE - Router):** Gõ `localhost:5173/admin/login`, `app/routes/index.tsx` điều hướng mở trang `<AdminLoginPage />` (nằm trong `modules/admin-auth/pages`).
2. **(FE - Component & Core):** Điền form, Submit. Hàm `adminAuthApi.login(data)` gọi qua `axiosClient` (`core/api`) để bắn POST Request tới BE.
3. **(BE - API Layer):** Lớp `api/controllers/AdminAuthController.java` bắt Request, ép kiểu thành `AdminLoginRequest` (nằm ở `application/dtos/request`).
4. **(BE - Application Layer):** Controller chuyển dữ liệu cho `AdminAuthService.java` (nằm ở `application/services`).
5. **(BE - Infrastructure/Security):** Service yêu cầu `authenticationManager` xác thực kèm Prefix `"ADMIN:admin"`. Class `UserDetailsServiceImpl.java` (trong `infrastructure/security`) tiếp nhận.
6. **(BE - DB Access):** `UserDetailsServiceImpl` nhận diện tiền tố ADMIN, gọi xuống `AdminRepository` (tại `infrastructure/repositories/mysql`), map vào JPA Entity `Admin.java` (tại `infrastructure/entities/mysql`) để kéo dữ liệu từ DB lên so sánh mật khẩu BCrypt.
7. **(BE -> FE):** Thành công, `JwtService` sinh Access Token, Controller trả về `AdminAuthResponse`. Frontend nhận JSON, lưu vào `localStorage` và chuyển hướng vào `/admin/dashboard`. Màn hình Dashboard load lên!
