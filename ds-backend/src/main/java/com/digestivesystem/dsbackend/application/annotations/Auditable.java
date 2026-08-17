package com.digestivesystem.dsbackend.application.annotations;

import com.digestivesystem.dsbackend.domain.entities.AuditAction;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Đánh dấu 1 method Service thực hiện Create/Update/Delete để AuditLogAspect tự động
 * ghi log vào bảng audit_logs (D.4.1) — Developer không cần tự viết code ghi log thủ công.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    AuditAction action();
    String entityName();
    String description() default "";
}
