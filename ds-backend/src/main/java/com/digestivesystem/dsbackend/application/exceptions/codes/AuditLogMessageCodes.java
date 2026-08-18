package com.digestivesystem.dsbackend.application.exceptions.codes;

/** Mã lỗi riêng của AuditLogService (lọc/xuất file Nhật ký hệ thống, module D.4). */
public final class AuditLogMessageCodes {

    public static final String EXPORT_RANGE_TOO_LARGE = "error.auditLog.export-range-too-large";
    public static final String NO_DATA_TO_EXPORT = "error.auditLog.no-data-to-export";
    public static final String INVALID_EXPORT_FORMAT = "error.auditLog.invalid-export-format";
    public static final String INVALID_DATE_RANGE = "error.auditLog.invalid-date-range";
    public static final String EXPORT_FAILED = "error.auditLog.export-failed";

    private AuditLogMessageCodes() {
    }
}
