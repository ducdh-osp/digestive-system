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
- **`exceptions/`**: Đã có code — **`BusinessException.java`** (RuntimeException mang sẵn `HttpStatus` + message hiển thị cho FE) và **`GlobalExceptionHandler.java`** (`@RestControllerAdvice`, bắt `BusinessException`/`AuthenticationException`/`MethodArgumentNotValidException` và format thống nhất về `ApiResponse`). Mọi Service (`AuthService`, `AdminAuthService`, `ProfileService`) throw thẳng `BusinessException` thay vì `RuntimeException("CODE")`; Controller không còn `try/catch` thủ công — xem Mục 3.
- **`mappers/`**: Các class/interface dùng để map dữ liệu giữa Entity và DTO (thường dùng MapStruct).
- **`constants/`**: Đã có code — **`SecurityConstants.java`** (`CUSTOMER_PREFIX`, `ADMIN_PREFIX`) dùng chung cho `AuthService`, `AdminAuthService`, `ProfileService`, `UserDetailsServiceImpl` thay vì hardcode chuỗi `"CUSTOMER:"`/`"ADMIN:"` rải rác nhiều nơi.
- **`annotation/`, `config/`, `enums/`, `helpers/`, `utils/`**: Vẫn còn rỗng, chuẩn bị cho tương lai.

### 1.3. Lớp Miền (`domain`)
Trái tim của phần mềm, chứa các logic nghiệp vụ cốt lõi không bao giờ thay đổi dù Framework hay Database có đổi. Không được phép phụ thuộc vào bất kỳ thư viện bên ngoài nào (như Spring Data, JPA).
- **`entities/`**: Đã có code — 5 Domain Entity thuần POJO (`Customer`, `OtpLog`, `Admin`, `Role`, `MedicalProfile`), chỉ dùng Lombok (không phải external framework, chỉ là compile-time boilerplate), **không có bất kỳ annotation JPA/Hibernate nào**. Khác hoàn toàn với JPA Entity cùng field ở `infrastructure/entities/{postgres|mysql}/*Entity.java` (đã đổi hậu tố `Entity` để tránh trùng tên khi import).
- **`enums/`** & **`constant/`**: Hằng số và Enum cốt lõi của nghiệp vụ. Vẫn còn rỗng.
- **`repositories/`**: Đã có code — 4 interface (`CustomerRepository`, `OtpLogRepository`, `AdminRepository`, `MedicalProfileRepository`), chỉ khai báo hợp đồng bằng Domain Entity, không import gì từ Spring Data/JPA. `AuthService`, `AdminAuthService`, `ProfileService`, `UserDetailsServiceImpl` giờ inject THẲNG các interface này — Spring tự autowire theo type xuống đúng class Impl ở `infrastructure` (Dependency Inversion đúng chuẩn Clean Architecture). Code thực thi nằm ở `infrastructure/repositories/{postgres|mysql}/*RepositoryImpl.java`.
- **`services/`**: Các Domain Service xử lý logic tinh vi liên quan tới nhiều Domain Entity. Vẫn còn rỗng — các Service ở `application/services` hiện đã đủ xử lý logic của 1 Aggregate, chưa phát sinh nhu cầu tách riêng.
- **`projections/`**: Vẫn còn rỗng.

### 1.4. Lớp Hạ tầng (`infrastructure`)
Đảm nhiệm mọi thứ liên quan đến công nghệ cụ thể (Database, Redis, Security, API bên thứ 3).
- **`config/`**: Cấu hình Spring Boot, DataSource (Multi-tenant MySQL & Postgres), Flyway. Riêng cấu hình bảo mật nằm ở subpackage **`config/security/`**: `SecurityConfig.java` (khai báo `SecurityFilterChain`, `PasswordEncoder`, `AuthenticationManager`) và `JwtAuthenticationFilter.java` (filter đọc/validate Bearer Token mỗi request).
- **`entities/`**: Các class JPA (có `@Entity`, `@Table`) ánh xạ trực tiếp 1-1 với DB, đặt tên hậu tố **`Entity`** (`CustomerEntity`, `OtpLogEntity`, `MedicalProfileEntity`, `AdminEntity`, `RoleEntity`) để phân biệt với Domain Entity cùng tên ở `domain/entities/`. Chia `mysql/` (Admin) và `postgres/` (Customer).
- **`repositories/`**: 2 tầng con:
  - ***Jpa Repository*** (`CustomerJpaRepository`, `OtpLogJpaRepository`, `MedicalProfileJpaRepository`, `AdminJpaRepository`) — interface Spring Data JPA thuần, kế thừa `JpaRepository<XxxEntity, ID>`, chỉ dùng nội bộ bởi Impl bên dưới, Service không gọi trực tiếp nữa.
  - ***Repository Impl*** (`CustomerRepositoryImpl`, `OtpLogRepositoryImpl`, `MedicalProfileRepositoryImpl`, `AdminRepositoryImpl`) — class `implements` interface Domain tương ứng ở Mục 1.3, làm nhiệm vụ map qua lại Domain Entity ↔ JPA Entity. **Điểm quan trọng khi `save()`:** nếu Domain Entity truyền vào đã có `id`, Impl luôn `findById()` fetch lại entity JPA gốc trước rồi mới ghi đè field thay đổi lên đó (không dựng entity mới từ đầu) — tránh Hibernate merge một object "trắng" đè mất giá trị `createdAt` (`@CreationTimestamp`) của bản ghi đang update.
- **`services/`**: Ngoài các service hạ tầng khác, đây là nơi chứa **`UserDetailsServiceImpl.java`** (không nằm ở `security/` như phiên bản tài liệu trước) — xử lý luồng Prefix Authentication (`ADMIN:`/`CUSTOMER:`), được cả `AuthService` và `AdminAuthService` gọi tới khi cần load `UserDetails`.
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
  - `constants/`: Đã có code — **`storageKeys.ts`** (`STORAGE_KEYS.customer.*` / `STORAGE_KEYS.admin.*`) tập trung toàn bộ tên key `localStorage`, tránh hardcode chuỗi `'accessToken'`/`'adminAccessToken'`... rải rác từng trang (từng gây bug sai key ở `axiosClient.ts`).
  - `exceptions/`, `utils/`: Vẫn còn rỗng, chuẩn bị cho tương lai.
- **`assets/`**: Chứa ảnh, icon dùng toàn cục ở cấp độ App (như logo `hero.png`, SVG React).

### 2.2. Các Tính năng (`modules/`)
Nơi chia mã nguồn theo từng **Tính năng** độc lập. Hiện tại gồm `auth`, `admin-auth`, `admin`, `profile` (module `profile` chưa được đưa vào bản đồ luồng ở Mục 3 — xem ghi chú tại đó). Cấu trúc quy chuẩn bên trong mỗi module:
- **`pages/`**: Các component đại diện cho 1 trang màn hình hoàn chỉnh (vd: `LoginPage.tsx`, `AdminDashboardPage.tsx`).
- **`api/`**: Nơi chứa các hàm Axios call API của riêng module đó (vd: `authApi.ts`).
- **`types/`**: (Nếu có) Định nghĩa Interface/Type cho Typescript.
- Thư mục chuẩn nhưng có thể ẩn/rỗng: `components/` (các UI con của trang), `hooks/` (Custom hook), `store/` (State cục bộ).

### 2.3. Lớp Dùng chung (`shared/`)
Chứa các thành phần được sử dụng lại ở nhiều Module khác nhau, tránh lặp code.
- **`layouts/`**: Các khung bao bọc trang (vd: `AuthLayout.tsx` quy định hình ảnh background dùng chung cho mọi trang đăng nhập).
- **`components/`**: Đã có code — thư mục **`Button/`** gồm `PrimaryButton.tsx` (nút submit chính, `color="blue"|"indigo"`, `variant="solid"|"outline"`, `fullWidth`) và `LogoutButton.tsx` (`theme="onColor"|"onLight"`), export qua `Button/index.ts`. Áp dụng ở toàn bộ trang Auth, AdminLogin, ProfilePage, và 2 header (Customer/Admin). `Input`/`Modal` dùng chung vẫn chưa có, để dành khi cần.
- **`hooks/`**: Đã có code — **`useAuth.ts`** export `useCustomerAuth()` và `useAdminAuth()`, mỗi hook trả về `{ token, user/admin, isAuthenticated, logout }`, đọc/ghi qua `STORAGE_KEYS` (không đọc thẳng `localStorage` bằng chuỗi cứng nữa). Áp dụng ở `ProtectedRoute` (`app/routes/index.tsx`), `AdminDashboardPage.tsx`, và phần logout/hết-phiên của `ProfilePage.tsx`.
- **`assets/`**: Ảnh/icon phụ trợ.

---

## 3. Bản đồ điều hướng Package/File theo từng UC (đã code, đã verify trực tiếp trong source)

Mục đích của mục này: khi cần tìm/debug một UC, biết ngay **code nhảy từ file nào sang file nào, package nào sang package nào** mà không phải grep lại từ đầu. Chỉ liệt kê các UC đã có code **và đã verify chạy đúng qua test runtime thật** (module **A.1. Xác thực tài khoản người dùng** và **A.3. Xác thực tài khoản CMS**).

> [!NOTE]
> *Module **A.2. Quản lý Hồ sơ Cá nhân** đã có code cả Backend (`ProfileController`/`ProfileService`, đã test runtime đầy đủ) lẫn Frontend (`ProfilePage.tsx`), nhưng phần Frontend chưa được chạy thử/verify trên trình duyệt nên tạm **chưa đưa vào bản đồ này** — sẽ bổ sung một mục A.2.x riêng khi FE được xác nhận chạy ổn định. E.1/E.2 vẫn mới chỉ là tài liệu đặc tả, chưa có code.*

Quy ước mũi tên: `Package/File` **→** `Package/File`. Toàn bộ path Backend đều nằm dưới gốc package `com.digestivesystem.dsbackend.*` (viết tắt bỏ phần gốc cho gọn); path Frontend đều tương đối theo `ds-frontend/src/`.

### A.1.1 — Đăng ký (`POST /auth/register`)
```
FE  modules/auth/pages/RegisterPage.tsx (onFinish, nút submit là shared/components/Button/PrimaryButton.tsx)
 → modules/auth/api/authApi.ts (register)
 → core/api/axiosClient.ts                                    ← gắn Bearer nếu có + trả lỗi kèm `status`
 → (HTTP) BE api/controllers/AuthController.java (register)     ← không còn try/catch thủ công
 → application/services/AuthService.java (register)
    → domain/repositories/CustomerRepository.java (existsByPhoneNumber) — trùng → throw BusinessException(409)
       → infrastructure/repositories/postgres/CustomerRepositoryImpl.java → CustomerJpaRepository → infrastructure/entities/postgres/CustomerEntity
    → domain/repositories/OtpLogRepository.java (countSince, save) — quá 5 lần/ngày → throw BusinessException(429)
       → infrastructure/repositories/postgres/OtpLogRepositoryImpl.java → OtpLogJpaRepository → infrastructure/entities/postgres/OtpLogEntity   ← ghi bảng otp_logs
 ← application/exceptions/GlobalExceptionHandler.java bắt BusinessException (nếu có lỗi) → ApiResponse; thành công → AuthController trả ApiResponse<String> (200)
FE ← RegisterPage.tsx → navigate('/verify-otp', {state: payload})   (chưa gọi tới VerifyOtpPage.tsx, chỉ điều hướng)
```

### A.1.2 — Xác thực OTP (`POST /auth/verify-otp`)
```
FE  modules/auth/pages/VerifyOtpPage.tsx (onFinish; nút "Gửi lại mã" là PrimaryButton variant="outline")
 → modules/auth/api/authApi.ts (verifyOtp) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/AuthController.java (verifyOtp)
 → application/services/AuthService.java (verifyOtp)
    → domain/repositories/OtpLogRepository.java (findActiveOtp; nếu hết hạn → findLatestUnusedOtp để phân biệt) — throw BusinessException(410) OTP_EXPIRED hoặc (400) INVALID_OTP
       → infrastructure/repositories/postgres/OtpLogRepositoryImpl.java → OtpLogJpaRepository → infrastructure/entities/postgres/OtpLogEntity
    → domain/repositories/CustomerRepository.java (save)          ← TẠO domain Customer thật ở bước này
       → infrastructure/repositories/postgres/CustomerRepositoryImpl.java → CustomerJpaRepository → infrastructure/entities/postgres/CustomerEntity
    → infrastructure/services/UserDetailsServiceImpl.java (loadUserByUsername, không prefix → tự suy ra application/constants/SecurityConstants.CUSTOMER_PREFIX)
    → application/services/JwtService.java (generateToken, generateRefreshToken)
 ← lỗi (nếu có) → application/exceptions/GlobalExceptionHandler.java; thành công → AuthController trả AuthResponse (200)
FE ← VerifyOtpPage.tsx lưu localStorage qua core/constants/storageKeys.ts (STORAGE_KEYS.customer.*) → navigate('/')
 → app/routes/index.tsx (ProtectedRoute) dùng shared/hooks/useAuth.ts (useCustomerAuth) để đọc token/user + render Trang chủ, nút Đăng xuất là shared/components/Button/LogoutButton.tsx
```

### A.1.3 — Đăng nhập (`POST /auth/login`)
```
FE  modules/auth/pages/LoginPage.tsx (onFinish, PrimaryButton)
 → modules/auth/api/authApi.ts (login) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/AuthController.java (login)
 → application/services/AuthService.java (login)
    → application/constants/SecurityConstants.CUSTOMER_PREFIX + AuthenticationManager.authenticate(phone, password)
       → infrastructure/services/UserDetailsServiceImpl.java (loadUserByUsername, prefix CUSTOMER:)
          → domain/repositories/CustomerRepository.java (findByPhoneNumber)
             → infrastructure/repositories/postgres/CustomerRepositoryImpl.java → CustomerJpaRepository → infrastructure/entities/postgres/CustomerEntity  ← so BCrypt password_hash
       (sai tài khoản/mật khẩu → AuthenticationException → application/exceptions/GlobalExceptionHandler.java → 401)
    → domain/repositories/CustomerRepository.java (findByPhoneNumber lại, check isActive) — banned → throw BusinessException(403)
    → application/services/JwtService.java (generateToken, generateRefreshToken)
 ← AuthController trả AuthResponse (200)
FE ← LoginPage.tsx lưu localStorage qua STORAGE_KEYS.customer.* → navigate('/')
```

### A.1.4 — Quên mật khẩu → Đặt lại mật khẩu (`POST /auth/forgot-password` rồi `POST /auth/reset-password`)
```
FE  modules/auth/pages/ForgotPasswordPage.tsx (onFinish, PrimaryButton)
 → modules/auth/api/authApi.ts (forgotPassword) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/AuthController.java (forgotPassword)
 → application/services/AuthService.java (forgotPassword)
    → domain/repositories/CustomerRepository.java (findByPhoneNumber, check isActive) — not found/banned → BusinessException(404/403)
    → domain/repositories/OtpLogRepository.java (countSince + save OTP mới) — quá hạn mức → BusinessException(429)
 ← 200, hoặc lỗi qua GlobalExceptionHandler
FE ← navigate('/reset-password', {state: {phoneNumber}})

FE  modules/auth/pages/ResetPasswordPage.tsx (onFinish, PrimaryButton)
 → modules/auth/api/authApi.ts (resetPassword) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/AuthController.java (resetPassword)
 → application/services/AuthService.java (resetPassword)
    → domain/repositories/OtpLogRepository.java (findActiveOtp, đánh dấu used) — sai/hết hạn → BusinessException(400)
    → domain/repositories/CustomerRepository.java (findByPhoneNumber, save password_hash mới)
 ← 200, hoặc lỗi qua GlobalExceptionHandler
FE ← navigate('/login')                                          ← KHÔNG tự đăng nhập lại, không sinh token
```

### A.3.1 — Đăng nhập Admin CMS (`POST /admin/auth/login`)
```
FE  modules/admin-auth/pages/AdminLoginPage.tsx (onFinish, PrimaryButton color="indigo")
 → modules/admin-auth/api/adminAuthApi.ts (login)
 → core/api/axiosClient.ts                                    ← url bắt đầu "/admin" → tự gắn STORAGE_KEYS.admin.accessToken (không phải accessToken)
 → (HTTP) BE api/controllers/AdminAuthController.java (login)
 → application/services/AdminAuthService.java (login)
    → application/constants/SecurityConstants.ADMIN_PREFIX + AuthenticationManager.authenticate(username, password)
       → infrastructure/services/UserDetailsServiceImpl.java (loadUserByUsername, prefix ADMIN:)
          → domain/repositories/AdminRepository.java (findByUsernameOrEmail)
             → infrastructure/repositories/mysql/AdminRepositoryImpl.java → AdminJpaRepository → infrastructure/entities/mysql/AdminEntity, RoleEntity  ← so BCrypt password_hash, lấy role_name
       (sai tài khoản/mật khẩu → AuthenticationException → GlobalExceptionHandler → 401)
    → domain/repositories/AdminRepository.java (findByUsernameOrEmail lại, check isActive) — banned → throw BusinessException(403)
    → application/services/JwtService.java (generateToken, generateRefreshToken)
 ← AdminAuthController trả AdminAuthResponse (200)
FE ← AdminLoginPage.tsx lưu localStorage qua STORAGE_KEYS.admin.*
 → navigate('/admin/dashboard') → app/routes/index.tsx → modules/admin/pages/AdminDashboardPage.tsx dùng shared/hooks/useAuth.ts (useAdminAuth) để check token + render, nút Đăng xuất là LogoutButton (chưa check role)
```

### Hạ tầng dùng chung — mọi UC ở trên đều đi qua đây ít nhất 1 lần
```
domain/repositories/*.java (interface) + infrastructure/repositories/{postgres|mysql}/*RepositoryImpl.java  ← Service KHÔNG còn đụng JPA Repository trực tiếp; mọi truy vấn DB đi qua interface Domain trước, Spring tự autowire xuống đúng Impl (Dependency Inversion — đúng chuẩn Clean Architecture, xem Mục 1.3/1.4)
infrastructure/config/security/SecurityConfig.java              ← khai báo permitAll cho /api/v1/auth/** và /api/v1/admin/auth/**, PasswordEncoder (BCrypt), AuthenticationManager
infrastructure/config/security/JwtAuthenticationFilter.java     ← chặn TRƯỚC UsernamePasswordAuthenticationFilter, validate Bearer Token cho các API cần đăng nhập (đọc lại qua UserDetailsServiceImpl + JwtService)
infrastructure/services/UserDetailsServiceImpl.java             ← 1 class DÙNG CHUNG cho cả Admin lẫn Customer, phân biệt bằng prefix ADMIN:/CUSTOMER: (application/constants/SecurityConstants.java)
application/services/JwtService.java                            ← 1 class DÙNG CHUNG để sign/verify JWT cho cả 2 tác nhân, TTL access=1h, refresh=7 ngày
application/exceptions/BusinessException.java + GlobalExceptionHandler.java  ← mọi lỗi nghiệp vụ ở AuthService/AdminAuthService/ProfileService throw thẳng BusinessException, Controller không còn try/catch; GlobalExceptionHandler format chung về ApiResponse (kèm bắt AuthenticationException và MethodArgumentNotValidException)
core/api/axiosClient.ts                                         ← 1 instance axios DÙNG CHUNG cho toàn FE, tự chọn token theo URL (core/constants/storageKeys.ts), tự lộ HTTP status ra ngoài cho các page catch(error)
shared/hooks/useAuth.ts + shared/components/Button/              ← useCustomerAuth/useAdminAuth (đọc/ghi qua STORAGE_KEYS, có sẵn logout()) và PrimaryButton/LogoutButton, dùng chung ở mọi trang Auth/Admin/Profile
```

> [!TIP]
> *Mẹo tra cứu nhanh: mọi Controller nằm ở `api/controllers/`, mọi Service nghiệp vụ nằm ở `application/services/`. Muốn biết Service thao tác DB kiểu gì — xem interface ở `domain/repositories/` trước (method name + tham số Domain Entity), rồi mới lần xuống bản Impl thật ở `infrastructure/repositories/{mysql|postgres}/*RepositoryImpl.java` (nơi có logic map Entity↔Domain và query JPA thật qua `*JpaRepository`). Mọi thứ đụng tới Spring Security nằm ở `infrastructure/config/security/` (config/filter) hoặc `infrastructure/services/UserDetailsServiceImpl.java` (load user). Phía FE: cứ theo đúng thứ tự `modules/<tên module>/pages/ → modules/<tên module>/api/ → core/api/axiosClient.ts`.*
