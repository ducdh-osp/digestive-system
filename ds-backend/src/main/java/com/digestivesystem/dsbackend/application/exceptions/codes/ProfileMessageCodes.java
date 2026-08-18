package com.digestivesystem.dsbackend.application.exceptions.codes;

/** Mã lỗi riêng của ProfileService (cập nhật hồ sơ cá nhân/đổi mật khẩu). */
public final class ProfileMessageCodes {

    public static final String PHONE_ALREADY_USED = "error.profile.phone-used";
    public static final String EMAIL_ALREADY_USED = "error.profile.email-used";
    public static final String CURRENT_PASSWORD_INCORRECT = "error.profile.current-password-incorrect";
    public static final String NEW_PASSWORD_CONFIRM_MISMATCH = "error.profile.new-password-confirm-mismatch";
    public static final String NEW_PASSWORD_SAME_AS_OLD = "error.profile.new-password-same-as-old";

    private ProfileMessageCodes() {
    }
}
