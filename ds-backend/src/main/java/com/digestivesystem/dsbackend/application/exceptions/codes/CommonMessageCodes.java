package com.digestivesystem.dsbackend.application.exceptions.codes;

/**
 * Mã lỗi dùng chung bởi từ 2 Service trở lên (vd. ProfileService, NotificationService,
 * AdminNotificationService, AdminDashboardService đều copy cùng logic getCurrentCustomer() và
 * ném cùng 3 lỗi này) — gom về đây thay vì khai báo trùng lặp trong từng lớp *MessageCodes riêng,
 * đúng tinh thần "tận dụng tối đa" thay vì tạo mã lỗi mới cho cùng 1 nội dung.
 */
public final class CommonMessageCodes {

    public static final String NOT_AUTHENTICATED = "error.common.not-authenticated";
    public static final String ACCOUNT_NOT_FOUND = "error.common.account-not-found";
    public static final String ACCOUNT_LOCKED = "error.common.account-locked";

    /** Dùng chung cho login Customer (AuthService) và Admin (AdminAuthService) — cùng 1 nội dung. */
    public static final String INVALID_CREDENTIALS = "error.auth.invalid-credentials";

    private CommonMessageCodes() {
    }
}
