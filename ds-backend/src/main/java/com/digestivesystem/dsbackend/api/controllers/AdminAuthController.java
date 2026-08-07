package com.digestivesystem.dsbackend.api.controllers;

import com.digestivesystem.dsbackend.application.dtos.request.AdminLoginRequest;
import com.digestivesystem.dsbackend.application.dtos.response.AdminAuthResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ApiResponse;
import com.digestivesystem.dsbackend.application.services.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminAuthResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AdminAuthResponse response = adminAuthService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập CMS thành công", response));
        } catch (RuntimeException e) {
            if ("ADMIN_BANNED".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Tài khoản đã bị vô hiệu hóa."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Tài khoản hoặc mật khẩu không chính xác."));
        }
    }
}
