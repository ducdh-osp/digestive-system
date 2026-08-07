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
import org.springframework.http.HttpStatus;
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
        try {
            authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi", null));
        } catch (RuntimeException e) {
            if ("PHONE_EXISTS".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Số điện thoại đã tồn tại"));
            }
            if ("TOO_MANY_REQUESTS".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(ApiResponse.error("Bạn đã vượt quá số lần nhận mã trong ngày."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse response = authService.verifyOtp(request);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", response));
        } catch (RuntimeException e) {
            if ("INVALID_OTP".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Mã xác thực không đúng hoặc đã hết hạn"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("USER_BANNED")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Tài khoản hoặc mật khẩu không chính xác."));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi", null));
        } catch (RuntimeException e) {
            if ("USER_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Số điện thoại không tồn tại"));
            }
            if ("TOO_MANY_REQUESTS".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(ApiResponse.error("Bạn đã vượt quá số lần nhận mã trong ngày."));
            }
            if ("USER_BANNED".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
        } catch (RuntimeException e) {
            if ("INVALID_OTP".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Mã xác thực không đúng hoặc đã hết hạn"));
            }
            if ("USER_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Số điện thoại không tồn tại"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }
}
