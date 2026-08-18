package com.digestivesystem.dsbackend.application.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception nghiệp vụ dùng chung cho mọi Service — mang theo sẵn HttpStatus và mã lỗi (message
 * code, xem các lớp hằng số trong package {@code application.exceptions.codes}), thay cho kiểu
 * throw RuntimeException("CODE") rồi Controller tự if/else match chuỗi (từng lặp lại y hệt ở
 * AuthController/AdminAuthController/ProfileController).
 *
 * F.1.2 — Trước đây tham số thứ 2 là câu tiếng Việt hiển thị thẳng cho FE; giờ là 1 mã lỗi
 * (vd {@code AuthMessageCodes.PHONE_ALREADY_EXISTS}), GlobalExceptionHandler tra cứu nội dung
 * hiển thị theo mã này qua MessageSource, dịch theo header Accept-Language của request. Dùng mã
 * lỗi làm message của RuntimeException (thay vì câu tiếng Việt tự do) cũng dễ grep trong log hơn.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(HttpStatus status, String code) {
        super(code);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return getMessage();
    }
}
