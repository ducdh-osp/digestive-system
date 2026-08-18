# Bản đồ điều hướng Package/File — Module A.1. Xác thực tài khoản người dùng

Tài liệu này chỉ chứa phần "code nhảy từ file nào sang file nào" **riêng của module A.1**. Cấu trúc thư mục tổng thể (backend `api/application/domain/infrastructure`, frontend `app/core/modules/shared`) và phần **Hạ tầng dùng chung** (SecurityConfig, JwtService, UserDetailsServiceImpl, axiosClient, useAuth...) nằm ở tài liệu gốc: `00-general/Architecture-and-Codebase.md` — xem ở đó trước nếu chưa quen cấu trúc dự án.

Quy ước mũi tên: `Package/File` **→** `Package/File`. Path Backend nằm dưới gốc package `com.digestivesystem.dsbackend.*` (viết tắt bỏ phần gốc cho gọn); path Frontend tương đối theo `ds-frontend/src/`.

> [!NOTE]
> *Cả 4 UC dưới đây đã có code **và đã verify chạy đúng qua test runtime thật** (không chỉ compile).*

## A.1.1 — Đăng ký (`POST /auth/register`)
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

## A.1.2 — Xác thực OTP (`POST /auth/verify-otp`)
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
 → app/routes/index.tsx (route '/', guard ternary theo STORAGE_KEYS.customer.accessToken) → modules/dashboard/pages/DashboardPage.tsx render trong shared/layouts/CustomerLayout.tsx (tự dùng useCustomerAuth để lấy user/logout — thay cho shared/components/AppHeader.tsx cũ, file này đã bị xoá khỏi source), nút Đăng xuất là shared/components/Button/LogoutButton.tsx
```

## A.1.3 — Đăng nhập (`POST /auth/login`)
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

## A.1.4 — Quên mật khẩu → Đặt lại mật khẩu (`POST /auth/forgot-password` rồi `POST /auth/reset-password`)
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

## Hạ tầng dùng chung mà A.1 phụ thuộc vào

Chi tiết đầy đủ nằm ở `00-general/Architecture-and-Codebase.md` (mục "Hạ tầng dùng chung"). A.1 chạm tới:
- `infrastructure/config/security/SecurityConfig.java`, `JwtAuthenticationFilter.java`
- `infrastructure/services/UserDetailsServiceImpl.java`, `application/services/JwtService.java`
- `application/exceptions/BusinessException.java` + `GlobalExceptionHandler.java`
- `application/constants/SecurityConstants.java` (`CUSTOMER_PREFIX`)
- `core/api/axiosClient.ts`, `shared/hooks/useAuth.ts`, `shared/components/Button/`, `shared/layouts/CustomerLayout.tsx` (thay cho `shared/components/AppHeader.tsx` cũ, đã bị xoá)
