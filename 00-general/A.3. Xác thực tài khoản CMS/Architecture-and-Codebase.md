# Bản đồ điều hướng Package/File — Module A.3. Xác thực tài khoản CMS

Tài liệu này chỉ chứa phần "code nhảy từ file nào sang file nào" **riêng của module A.3**. Cấu trúc thư mục tổng thể (backend `api/application/domain/infrastructure`, frontend `app/core/modules/shared`) và phần **Hạ tầng dùng chung** (SecurityConfig, JwtService, UserDetailsServiceImpl, axiosClient, useAuth...) nằm ở tài liệu gốc: `00-general/Architecture-and-Codebase.md` — xem ở đó trước nếu chưa quen cấu trúc dự án.

Quy ước mũi tên: `Package/File` **→** `Package/File`. Path Backend nằm dưới gốc package `com.digestivesystem.dsbackend.*` (viết tắt bỏ phần gốc cho gọn); path Frontend tương đối theo `ds-frontend/src/`.

> [!NOTE]
> *UC dưới đây đã có code **và đã verify chạy đúng qua test runtime thật** (không chỉ compile).*

## A.3.1 — Đăng nhập Admin CMS (`POST /admin/auth/login`)
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

## Hạ tầng dùng chung mà A.3 phụ thuộc vào

Chi tiết đầy đủ nằm ở `00-general/Architecture-and-Codebase.md` (mục "Hạ tầng dùng chung"). A.3 chạm tới:
- `infrastructure/config/security/SecurityConfig.java`, `JwtAuthenticationFilter.java`
- `infrastructure/services/UserDetailsServiceImpl.java`, `application/services/JwtService.java`
- `application/exceptions/BusinessException.java` + `GlobalExceptionHandler.java`
- `application/constants/SecurityConstants.java` (`ADMIN_PREFIX`)
- `core/api/axiosClient.ts`, `shared/hooks/useAuth.ts` (`useAdminAuth`), `shared/components/Button/`
