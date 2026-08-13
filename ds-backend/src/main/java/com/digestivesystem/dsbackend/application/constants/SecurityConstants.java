package com.digestivesystem.dsbackend.application.constants;

/**
 * Tiền tố định danh JWT (BR-08 module A.1) — phân biệt luồng dữ liệu Customer (Postgres)
 * và Admin (MySQL) trong UserDetailsServiceImpl, tránh leo quyền dù trùng username/SĐT.
 */
public final class SecurityConstants {

    public static final String CUSTOMER_PREFIX = "CUSTOMER:";
    public static final String ADMIN_PREFIX = "ADMIN:";

    private SecurityConstants() {
    }
}
