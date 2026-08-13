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

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin hồ sơ thành công", profileService.getProfile(authentication)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileUpdateResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", profileService.updateProfile(request, authentication)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        profileService.changePassword(request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PutMapping("/medical")
    public ResponseEntity<ApiResponse<MedicalProfileResponse>> updateMedicalProfile(
            @Valid @RequestBody UpdateMedicalProfileRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ bệnh lý thành công", profileService.updateMedicalProfile(request, authentication)));
    }
}
