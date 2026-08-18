package com.digestivesystem.dsbackend.application.exceptions.codes;

/** Mã lỗi riêng của AuthService (đăng ký/đăng nhập/quên mật khẩu Customer). */
public final class AuthMessageCodes {

    public static final String PHONE_ALREADY_EXISTS = "error.auth.phone-exists";
    public static final String OTP_RATE_LIMIT_EXCEEDED = "error.auth.otp-rate-limit";
    public static final String OTP_EXPIRED = "error.auth.otp-expired";
    public static final String OTP_INVALID = "error.auth.otp-invalid";
    public static final String OTP_INVALID_OR_EXPIRED = "error.auth.otp-invalid-or-expired";
    public static final String ACCOUNT_LOCKED_CONTACT_SUPPORT = "error.auth.account-locked-contact-support";
    public static final String PHONE_NOT_FOUND = "error.auth.phone-not-found";

    private AuthMessageCodes() {
    }
}
