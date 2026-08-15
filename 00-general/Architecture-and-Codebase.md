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
- **`file/`**: Đã có code — **`LocalFileStorageService.java`** lưu file (hiện dùng cho avatar Customer) vào thư mục `uploads/avatars/` trên đĩa cục bộ của server, validate định dạng (JPEG/PNG/WEBP) + kích thước (tối đa 2MB), tự xoá file cũ khi ghi đè file mới. File được phục vụ qua `WebConfig.java` (`addResourceHandlers`, ánh xạ `/uploads/**` → thư mục `uploads/`) và được khai báo `permitAll()` trong `SecurityConfig` (ảnh phải xem được qua thẻ `<img>` bình thường, không thể đính kèm Bearer Token). Muốn đổi sang S3/cloud storage sau này chỉ cần thay class này, phần gọi từ `ProfileService` không đổi.
- **`converters/`**, **`eventhandlers/`**, **`helpers/`**, **`listeners/`**, **`models/`**, **`services/`**: Các tiện ích, xử lý event hệ thống và service phụ trợ của hạ tầng (như EmailService, SmsService).

---

## 2. Cấu trúc Mã nguồn Frontend (React + Vite)
Được tổ chức theo dạng Module-based lai Feature-Sliced Design (FSD).

### 2.1. Cấu hình lõi (`app` & `core`)
- **`app/`**: Chứa cấu hình bao bọc toàn ứng dụng.
  - `routes/`: Cây định tuyến React Router (`index.tsx`). Thuần khai báo route + guard 1 dòng kiểu ternary (`localStorage.getItem(...) ? <Page /> : <Navigate to="/login" />`) như route `/` và `/profile` — **không chứa markup/logic trang** nữa, mọi page thật đều nằm ở `modules/<tên module>/pages/`.
  - `providers/`: Các Context/Provider bọc ngoài App (như Redux Provider, Theme Provider).
  - `styles/`: CSS toàn cục, Tailwind Config.
- **`core/`**: Cấu hình nền tảng.
  - `api/`: Cấu hình `axiosClient.ts`, tự động gắn Token và bắt lỗi.
  - `constants/`: Đã có code — **`storageKeys.ts`** (`STORAGE_KEYS.customer.*` / `STORAGE_KEYS.admin.*`) tập trung toàn bộ tên key `localStorage`, tránh hardcode chuỗi `'accessToken'`/`'adminAccessToken'`... rải rác từng trang (từng gây bug sai key ở `axiosClient.ts`).
  - `exceptions/`, `utils/`: Vẫn còn rỗng, chuẩn bị cho tương lai.
- **`assets/`**: Chứa ảnh, icon dùng toàn cục ở cấp độ App (như logo `hero.png`, SVG React).

### 2.2. Các Tính năng (`modules/`)
Nơi chia mã nguồn theo từng **Tính năng** độc lập. Hiện tại gồm `auth`, `admin-auth`, `admin`, `dashboard` (Trang chủ Customer — route `/`), `profile` (module `dashboard`/`profile` chưa được đưa vào bản đồ luồng ở Mục 3 — xem ghi chú tại đó). Cấu trúc quy chuẩn bên trong mỗi module:
- **`pages/`**: Các component đại diện cho 1 trang màn hình hoàn chỉnh (vd: `LoginPage.tsx`, `AdminDashboardPage.tsx`).
- **`api/`**: Nơi chứa các hàm Axios call API của riêng module đó (vd: `authApi.ts`).
- **`types/`**: (Nếu có) Định nghĩa Interface/Type cho Typescript.
- Thư mục chuẩn nhưng có thể ẩn/rỗng: `components/` (các UI con của trang), `hooks/` (Custom hook), `store/` (State cục bộ).

### 2.3. Lớp Dùng chung (`shared/`)
Chứa các thành phần được sử dụng lại ở nhiều Module khác nhau, tránh lặp code.
- **`layouts/`**: Các khung bao bọc trang (vd: `AuthLayout.tsx` quy định hình ảnh background dùng chung cho mọi trang đăng nhập).
- **`components/`**: Đã có code:
  - Thư mục **`Button/`** gồm `PrimaryButton.tsx` (nút submit chính, `color="blue"|"indigo"`, `variant="solid"|"outline"`, `fullWidth`) và `LogoutButton.tsx` (`theme="onColor"|"onLight"`), export qua `Button/index.ts`. Áp dụng ở toàn bộ trang Auth, AdminLogin, ProfilePage.
  - **`AppHeader.tsx`** — header dùng CHUNG (1 component, KHÔNG copy-paste) cho toàn bộ khu vực Customer đã đăng nhập: `DashboardPage.tsx` (Trang chủ) và `ProfilePage.tsx` render cùng 1 `<AppHeader />`. Bấm logo/tên app để về Trang chủ (thay cho nút mũi tên riêng ở từng trang). `Input`/`Modal` dùng chung vẫn chưa có, để dành khi cần.
- **`hooks/`**: Đã có code:
  - **`useAuth.ts`** export `useCustomerAuth()` và `useAdminAuth()`, mỗi hook trả về `{ token, user/admin, isAuthenticated, logout }`, đọc/ghi qua `STORAGE_KEYS` (không đọc thẳng `localStorage` bằng chuỗi cứng nữa). Áp dụng ở `AppHeader.tsx`, `AdminDashboardPage.tsx`.
  - **`useApiErrorHandler.ts`** — trả về 1 hàm `handleApiError(error)` dùng chung: `status 401/403` → toast + tự `logout()` (Customer), còn lại → toast message từ BE. Dựa trên `error.status` mà `axiosClient` đã gắn sẵn. Áp dụng ở 3 tab của module `profile` (`PersonalInfoTab`, `MedicalProfileTab`, `ChangePasswordTab`) để tránh lặp lại logic bắt lỗi 401/403 ở từng tab.
- **`assets/`**: Ảnh/icon phụ trợ.

---

## 3. Bản đồ điều hướng Package/File theo từng UC — chỉ mục

Phần chi tiết "code nhảy từ file nào sang file nào, package nào sang package nào" của từng UC **đã được tách ra file riêng, đặt ngay trong thư mục tài liệu nghiệp vụ của module đó** — để khi đang đọc tài liệu A.1/A.2/A.3 không phải lật qua file chung này, và để mỗi module tự chứa đủ thông tin kỹ thuật của chính nó.

| Module | File chi tiết | UC đã có (đã verify runtime) |
|---|---|---|
| A.1. Xác thực tài khoản người dùng | `00-general/A.1. Xác thực tài khoản người dùng/Architect-and-Codebase.md` | A.1.1 Đăng ký, A.1.2 Xác thực OTP, A.1.3 Đăng nhập, A.1.4 Quên/Đặt lại mật khẩu |
| A.2. Quản lý Hồ sơ Cá nhân & Bệnh lý | `00-general/A.2. Quản lý Hồ sơ Cá nhân & Bệnh lý/Architecture-and-Codebase.md` | A.2.1 Xem hồ sơ, A.2.2 Cập nhật thông tin, A.2.3 Đổi mật khẩu, A.2.4 Cập nhật hồ sơ bệnh lý, A.2.5 Đổi ảnh đại diện |
| A.3. Xác thực tài khoản CMS | `00-general/A.3. Xác thực tài khoản CMS/Architecture-and-Codebase.md` | A.3.1 Đăng nhập Admin CMS |

> [!NOTE]
> *E.1/E.2 vẫn mới chỉ là tài liệu đặc tả (BA), chưa có code — chưa có file bản đồ luồng.*

Quy ước mũi tên dùng trong các file đó: `Package/File` **→** `Package/File`. Toàn bộ path Backend đều nằm dưới gốc package `com.digestivesystem.dsbackend.*` (viết tắt bỏ phần gốc cho gọn); path Frontend đều tương đối theo `ds-frontend/src/`.

### Hạ tầng dùng chung — mọi UC ở A.1/A.2/A.3 đều đi qua đây ít nhất 1 lần
```
domain/repositories/*.java (interface) + infrastructure/repositories/{postgres|mysql}/*RepositoryImpl.java  ← Service KHÔNG còn đụng JPA Repository trực tiếp; mọi truy vấn DB đi qua interface Domain trước, Spring tự autowire xuống đúng Impl (Dependency Inversion — đúng chuẩn Clean Architecture, xem Mục 1.3/1.4)
infrastructure/config/security/SecurityConfig.java              ← khai báo permitAll cho /api/v1/auth/**, /api/v1/admin/auth/** và /uploads/** (ảnh avatar A.2.5), PasswordEncoder (BCrypt), AuthenticationManager
infrastructure/config/security/JwtAuthenticationFilter.java     ← chặn TRƯỚC UsernamePasswordAuthenticationFilter, validate Bearer Token cho các API cần đăng nhập (đọc lại qua UserDetailsServiceImpl + JwtService)
infrastructure/services/UserDetailsServiceImpl.java             ← 1 class DÙNG CHUNG cho cả Admin lẫn Customer, phân biệt bằng prefix ADMIN:/CUSTOMER: (application/constants/SecurityConstants.java)
application/services/JwtService.java                            ← 1 class DÙNG CHUNG để sign/verify JWT cho cả 2 tác nhân, TTL access=1h, refresh=7 ngày
application/exceptions/BusinessException.java + GlobalExceptionHandler.java  ← mọi lỗi nghiệp vụ ở AuthService/AdminAuthService/ProfileService throw thẳng BusinessException, Controller không còn try/catch; GlobalExceptionHandler format chung về ApiResponse (kèm bắt AuthenticationException và MethodArgumentNotValidException)
core/api/axiosClient.ts                                         ← 1 instance axios DÙNG CHUNG cho toàn FE, tự chọn token theo URL (core/constants/storageKeys.ts), tự lộ HTTP status ra ngoài cho các page catch(error)
shared/hooks/useAuth.ts + shared/components/Button/ + shared/components/AppHeader.tsx  ← useCustomerAuth/useAdminAuth (đọc/ghi qua STORAGE_KEYS, có sẵn logout()), PrimaryButton/LogoutButton, và header dùng chung cho Trang chủ + Profile — dùng chung ở mọi trang Auth/Admin/Profile/Dashboard
```

> [!TIP]
> *Mẹo tra cứu nhanh: mọi Controller nằm ở `api/controllers/`, mọi Service nghiệp vụ nằm ở `application/services/`. Muốn biết Service thao tác DB kiểu gì — xem interface ở `domain/repositories/` trước (method name + tham số Domain Entity), rồi mới lần xuống bản Impl thật ở `infrastructure/repositories/{mysql|postgres}/*RepositoryImpl.java` (nơi có logic map Entity↔Domain và query JPA thật qua `*JpaRepository`). Mọi thứ đụng tới Spring Security nằm ở `infrastructure/config/security/` (config/filter) hoặc `infrastructure/services/UserDetailsServiceImpl.java` (load user). Phía FE: cứ theo đúng thứ tự `modules/<tên module>/pages/ → modules/<tên module>/api/ → core/api/axiosClient.ts`.*
