package com.digestivesystem.dsbackend.application.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception nghiệp vụ dùng chung cho mọi Service — mang theo sẵn HttpStatus và message
 * hiển thị cho FE, thay cho kiểu throw RuntimeException("CODE") rồi Controller tự
 * if/else match chuỗi (từng lặp lại y hệt ở AuthController/AdminAuthController/ProfileController).
 * GlobalExceptionHandler sẽ bắt exception này ở tầng trên cùng và format thành ApiResponse.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
