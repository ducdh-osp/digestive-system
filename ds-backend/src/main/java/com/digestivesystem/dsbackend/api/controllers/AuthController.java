package com.digestivesystem.dsbackend.api.controllers;

import com.digestivesystem.dsbackend.application.dtos.request.ForgotPasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.LoginRequest;
import com.digestivesystem.dsbackend.application.dtos.request.RegisterRequest;
import com.digestivesystem.dsbackend.application.dtos.request.ResetPasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.VerifyOtpRequest;
import com.digestivesystem.dsbackend.application.dtos.response.ApiResponse;
import com.digestivesystem.dsbackend.application.dtos.response.AuthResponse;
import com.digestivesystem.dsbackend.application.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", authService.verifyOtp(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authService.login(request)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }
}
