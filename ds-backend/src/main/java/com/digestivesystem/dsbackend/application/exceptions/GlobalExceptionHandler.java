package com.digestivesystem.dsbackend.application.exceptions;

import com.digestivesystem.dsbackend.application.dtos.response.ApiResponse;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * F.1.2 — Toàn bộ message trả về từ đây (kể cả từ BusinessException do Service khác ném) được dịch
 * theo header Accept-Language qua MessageSource (xem LocaleConfig, Business-rule.md BR-06).
 * BusinessException giờ mang mã lỗi (message code, xem package `application.exceptions.codes`)
 * thay vì câu tiếng Việt tự do — handler này là nơi DUY NHẤT tra cứu mã đó ra nội dung hiển thị.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    public GlobalExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    private String translate(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException e) {
        return ResponseEntity.status(e.getStatus()).body(ApiResponse.error(translate(e.getCode())));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(translate("error.auth.invalid-credentials")));
    }

    /** Ném bởi @PreAuthorize (vd BR-03 module D.4 — chặn Admin không phải SUPER_ADMIN). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(translate("error.access.forbidden")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse(translate("error.validation.default"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(message));
    }
}
