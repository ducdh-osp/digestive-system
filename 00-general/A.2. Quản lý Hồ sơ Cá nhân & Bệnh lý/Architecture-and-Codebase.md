# Bản đồ điều hướng Package/File — Module A.2. Quản lý Hồ sơ Cá nhân & Bệnh lý

Tài liệu này chỉ chứa phần "code nhảy từ file nào sang file nào" **riêng của module A.2**. Cấu trúc thư mục tổng thể (backend `api/application/domain/infrastructure`, frontend `app/core/modules/shared`) và phần **Hạ tầng dùng chung** nằm ở tài liệu gốc: `00-general/Architecture-and-Codebase.md` — xem ở đó trước nếu chưa quen cấu trúc dự án.

Quy ước mũi tên: `Package/File` **→** `Package/File`. Path Backend nằm dưới gốc package `com.digestivesystem.dsbackend.*` (viết tắt bỏ phần gốc cho gọn); path Frontend tương đối theo `ds-frontend/src/`.

> [!NOTE]
> *5 UC dưới đây đã có code Backend đã test runtime đầy đủ. Phía Frontend đã tách `ProfilePage.tsx` thành shell + 4 component riêng (`PersonalInfoTab`, `MedicalProfileTab`, `ChangePasswordTab`, `AvatarUploader`) và đã được xác nhận chạy đúng qua thao tác tay trên trình duyệt thật (không phải chỉ compile).*

## A.2.1 — Xem thông tin cá nhân (`GET /profile`)
```
FE  modules/profile/pages/ProfilePage.tsx (useEffect khi mount)
 → modules/profile/api/profileApi.ts (getProfile)
 → core/api/axiosClient.ts                                    ← gắn Bearer + trả lỗi kèm `status`
 → (HTTP) BE api/controllers/ProfileController.java (getProfile)
 → application/services/ProfileService.java (getProfile)
    → getCurrentCustomer(authentication) — bóc customerId từ JWT subject (application/constants/SecurityConstants.CUSTOMER_PREFIX)
       → domain/repositories/CustomerRepository.java (findByPhoneNumber) → infrastructure/repositories/postgres/CustomerRepositoryImpl.java → CustomerJpaRepository → CustomerEntity — not found/banned → BusinessException(404/403)
    → domain/repositories/MedicalProfileRepository.java (findByCustomerId) → infrastructure/repositories/postgres/MedicalProfileRepositoryImpl.java → MedicalProfileJpaRepository → MedicalProfileEntity
 ← ProfileController trả ApiResponse<ProfileResponse> (200), hoặc lỗi qua GlobalExceptionHandler (401/403/404)
FE ← ProfilePage.tsx setProfile(response.data) → render AvatarUploader + Tabs (PersonalInfoTab / MedicalProfileTab / ChangePasswordTab)
```

## A.2.2 — Cập nhật thông tin cá nhân (`PUT /profile`)
```
FE  modules/profile/components/PersonalInfoTab.tsx (onFinish, PrimaryButton)
 → modules/profile/api/profileApi.ts (updateProfile) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/ProfileController.java (updateProfile)
 → application/services/ProfileService.java (updateProfile)
    → domain/repositories/CustomerRepository.java (findByPhoneNumber/findByEmailIgnoreCase kiểm tra trùng, loại trừ chính mình) — trùng → throw BusinessException(409)
    → domain/repositories/CustomerRepository.java (save) → CustomerRepositoryImpl (fetch entity gốc trước khi ghi đè, giữ nguyên createdAt) → CustomerJpaRepository → CustomerEntity
    → infrastructure/services/UserDetailsServiceImpl.java + application/services/JwtService.java (sinh lại accessToken/refreshToken mới — SĐT nằm trong JWT subject nên đổi SĐT là token cũ hết hiệu lực)
 ← ApiResponse<ProfileUpdateResponse> (200)
FE ← PersonalInfoTab.tsx lưu localStorage qua core/constants/storageKeys.ts (STORAGE_KEYS.customer.accessToken/refreshToken/user — chỉ lưu {id, fullName, phoneNumber}, không lưu nguyên Profile) → gọi onUpdated(result.profile) → ProfilePage.tsx cập nhật state
```

## A.2.3 — Đổi mật khẩu (`PUT /profile/password`)
```
FE  modules/profile/components/ChangePasswordTab.tsx (onFinish, PrimaryButton)
 → modules/profile/api/profileApi.ts (changePassword) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/ProfileController.java (changePassword)
 → application/services/ProfileService.java (changePassword)
    → passwordEncoder.matches(oldPassword, customer.getPasswordHash()) — sai → BusinessException(400)
    → so newPassword vs confirmPassword — lệch → BusinessException(400)
    → so newPassword trùng mật khẩu cũ — trùng → BusinessException(400)
    → domain/repositories/CustomerRepository.java (save password_hash mới đã mã hoá BCrypt)
 ← ApiResponse<null> (200)
FE ← ChangePasswordTab.tsx toast thành công, form.resetFields()
```

## A.2.4 — Cập nhật hồ sơ bệnh lý (`PUT /profile/medical`)
```
FE  modules/profile/components/MedicalProfileTab.tsx (onFinish, PrimaryButton)
 → modules/profile/api/profileApi.ts (updateMedicalProfile) → core/api/axiosClient.ts
 → (HTTP) BE api/controllers/ProfileController.java (updateMedicalProfile)
 → application/services/ProfileService.java (updateMedicalProfile)
    → domain/repositories/MedicalProfileRepository.java (findByCustomerId) — chưa có thì tạo mới (Upsert)
    → domain/repositories/MedicalProfileRepository.java (save)
       → infrastructure/repositories/postgres/MedicalProfileRepositoryImpl.java (gắn FK qua CustomerJpaRepository.getReferenceById — không bắn thêm SELECT) → MedicalProfileJpaRepository → MedicalProfileEntity
 ← ApiResponse<MedicalProfileResponse> (200)
FE ← MedicalProfileTab.tsx toast thành công → gọi onUpdated(medicalProfile) → ProfilePage.tsx cập nhật state
```

## A.2.5 — Đổi ảnh đại diện (`POST /profile/avatar`)
```
FE  modules/profile/components/AvatarUploader.tsx (handleFileChange — validate định dạng/2MB ngay phía client trước khi gửi)
 → modules/profile/api/profileApi.ts (uploadAvatar) — dùng fetch() THUẦN của trình duyệt, KHÔNG qua axiosClient (tránh phụ thuộc cách axios merge/xoá header cho FormData), tự gắn Authorization từ STORAGE_KEYS.customer.accessToken, không set Content-Type (trình duyệt tự sinh boundary)
 → (HTTP) BE api/controllers/ProfileController.java (updateAvatar, @RequestParam MultipartFile)
 → application/services/ProfileService.java (updateAvatar)
    → infrastructure/file/LocalFileStorageService.java (storeAvatar) — validate JPEG/PNG/WEBP + tối đa 2MB → throw BusinessException(400) nếu sai; lưu file vào uploads/avatars/, trả về đường dẫn "/uploads/avatars/<uuid>.<ext>"
    → domain/repositories/CustomerRepository.java (save avatarUrl mới)
    → LocalFileStorageService.deleteAvatar(oldAvatarUrl) — xoá ảnh cũ SAU khi đã lưu DB thành công (tránh mất avatar nếu save() lỗi giữa chừng)
 ← ApiResponse<ProfileResponse> (200)
FE ← AvatarUploader.tsx gọi onUpdated(response.data.avatarUrl) → ProfilePage.tsx cập nhật state → ảnh hiển thị qua `<img src={API_ORIGIN + avatarUrl}>` (core/api/axiosClient.ts export API_ORIGIN), ảnh được phục vụ tĩnh qua infrastructure/config/WebConfig.java (`/uploads/**`, permitAll trong SecurityConfig vì thẻ `<img>` không đính kèm Bearer Token được)
```

## Hạ tầng dùng chung mà A.2 phụ thuộc vào

Chi tiết đầy đủ nằm ở `00-general/Architecture-and-Codebase.md` (mục "Hạ tầng dùng chung"). A.2 chạm tới:
- `infrastructure/config/security/SecurityConfig.java`, `JwtAuthenticationFilter.java` — kèm riêng khai báo `permitAll` cho `/uploads/**` (chỉ A.2 cần, phục vụ A.2.5).
- `infrastructure/services/UserDetailsServiceImpl.java`, `application/services/JwtService.java` — dùng lại khi A.2.2 cấp token mới sau khi đổi SĐT.
- `application/exceptions/BusinessException.java` + `GlobalExceptionHandler.java`
- `application/constants/SecurityConstants.java` (`CUSTOMER_PREFIX`)
- `core/api/axiosClient.ts`, `shared/hooks/useAuth.ts`, `shared/hooks/useApiErrorHandler.ts` (dùng ở cả 3 tab A.2.2/A.2.3/A.2.4), `shared/components/Button/`, `shared/layouts/CustomerLayout.tsx` (thay cho `shared/components/AppHeader.tsx` cũ, đã bị xoá)
- **Riêng của A.2:** `infrastructure/file/LocalFileStorageService.java` + `infrastructure/config/WebConfig.java` (chỉ A.2.5 dùng, chưa module nào khác cần tới).
