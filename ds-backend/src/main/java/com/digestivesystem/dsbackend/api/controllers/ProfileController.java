package com.digestivesystem.dsbackend.api.controllers;

import com.digestivesystem.dsbackend.application.dtos.request.ChangePasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.UpdateMedicalProfileRequest;
import com.digestivesystem.dsbackend.application.dtos.request.UpdateProfileRequest;
import com.digestivesystem.dsbackend.application.dtos.response.ApiResponse;
import com.digestivesystem.dsbackend.application.dtos.response.MedicalProfileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ProfileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ProfileUpdateResponse;
import com.digestivesystem.dsbackend.application.services.ProfileService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // =========================================================
    // 1. XEM THÔNG TIN CÁ NHÂN
    // GET /api/v1/profile
    // =========================================================
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            Authentication authentication
    ) {
        try {

            ProfileResponse response =
                    profileService.getProfile(authentication);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Lấy thông tin hồ sơ thành công",
                            response
                    )
            );

        } catch (RuntimeException e) {

            if ("UNAUTHORIZED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                ApiResponse.error(
                                        "Bạn chưa đăng nhập"
                                )
                        );
            }

            if ("USER_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                ApiResponse.error(
                                        "Không tìm thấy tài khoản"
                                )
                        );
            }

            if ("USER_BANNED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                ApiResponse.error(
                                        "Tài khoản của bạn đã bị khóa"
                                )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            ApiResponse.error(e.getMessage())
                    );
        }
    }

    // =========================================================
    // 2. CẬP NHẬT THÔNG TIN CÁ NHÂN
    // PUT /api/v1/profile
    // =========================================================
    @PutMapping
    public ResponseEntity<ApiResponse<ProfileUpdateResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        try {

            ProfileUpdateResponse response =
                    profileService.updateProfile(
                            request,
                            authentication
                    );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Cập nhật hồ sơ thành công",
                            response
                    )
            );

        } catch (RuntimeException e) {

            if ("PHONE_EXISTS".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                ApiResponse.error(
                                        "Số điện thoại đã được sử dụng"
                                )
                        );
            }

            if ("EMAIL_EXISTS".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                ApiResponse.error(
                                        "Email đã được sử dụng"
                                )
                        );
            }

            if ("UNAUTHORIZED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                ApiResponse.error(
                                        "Bạn chưa đăng nhập"
                                )
                        );
            }

            if ("USER_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                ApiResponse.error(
                                        "Không tìm thấy tài khoản"
                                )
                        );
            }

            if ("USER_BANNED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                ApiResponse.error(
                                        "Tài khoản của bạn đã bị khóa"
                                )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            ApiResponse.error(e.getMessage())
                    );
        }
    }

    // =========================================================
    // 3. ĐỔI MẬT KHẨU
    // PUT /api/v1/profile/password
    // =========================================================
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        try {

            profileService.changePassword(
                    request,
                    authentication
            );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Đổi mật khẩu thành công",
                            null
                    )
            );

        } catch (RuntimeException e) {

            if ("OLD_PASSWORD_INVALID".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                ApiResponse.error(
                                        "Mật khẩu hiện tại không chính xác"
                                )
                        );
            }

            if ("PASSWORD_CONFIRM_NOT_MATCH".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                ApiResponse.error(
                                        "Xác nhận mật khẩu mới không khớp"
                                )
                        );
            }

            if ("NEW_PASSWORD_SAME_AS_OLD".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                ApiResponse.error(
                                        "Mật khẩu mới không được giống mật khẩu cũ"
                                )
                        );
            }

            if ("UNAUTHORIZED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                ApiResponse.error(
                                        "Bạn chưa đăng nhập"
                                )
                        );
            }

            if ("USER_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                ApiResponse.error(
                                        "Không tìm thấy tài khoản"
                                )
                        );
            }

            if ("USER_BANNED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                ApiResponse.error(
                                        "Tài khoản của bạn đã bị khóa"
                                )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            ApiResponse.error(e.getMessage())
                    );
        }
    }

    // =========================================================
    // 4. CẬP NHẬT HỒ SƠ BỆNH LÝ
    // PUT /api/v1/profile/medical
    // =========================================================
    @PutMapping("/medical")
    public ResponseEntity<ApiResponse<MedicalProfileResponse>> updateMedicalProfile(
            @Valid @RequestBody UpdateMedicalProfileRequest request,
            Authentication authentication
    ) {
        try {

            MedicalProfileResponse response =
                    profileService.updateMedicalProfile(
                            request,
                            authentication
                    );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Cập nhật hồ sơ bệnh lý thành công",
                            response
                    )
            );

        } catch (RuntimeException e) {

            if ("UNAUTHORIZED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                ApiResponse.error(
                                        "Bạn chưa đăng nhập"
                                )
                        );
            }

            if ("USER_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                ApiResponse.error(
                                        "Không tìm thấy tài khoản"
                                )
                        );
            }

            if ("USER_BANNED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                ApiResponse.error(
                                        "Tài khoản của bạn đã bị khóa"
                                )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            ApiResponse.error(e.getMessage())
                    );
        }
    }
}