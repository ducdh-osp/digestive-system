package com.digestivesystem.dsbackend.infrastructure.aspects;

import com.digestivesystem.dsbackend.application.annotations.Auditable;
import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.services.AuditLogService;
import com.digestivesystem.dsbackend.domain.entities.Admin;
import com.digestivesystem.dsbackend.domain.repositories.AdminRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * Chặn mọi method Service được đánh dấu @Auditable, tự động ghi 1 bản ghi vào audit_logs
 * (D.4.1) — không cần Developer tự viết code ghi log thủ công ở từng Service.
 *
 * Dùng @AfterReturning (không phải @Around/@Before): chỉ ghi log khi hành động THỰC SỰ
 * thành công (method trả về bình thường, không ném exception) — một CREATE/UPDATE/DELETE
 * thất bại giữa chừng sẽ không tạo ra bản ghi log giả.
 *
 * Mọi lỗi trong quá trình ghi log (mất kết nối MySQL tạm thời, không xác định được Admin...)
 * chỉ được log cảnh báo, TUYỆT ĐỐI không ném lại exception — theo BR-07, một tính năng phụ
 * (Audit Log) không được phép làm sập luồng nghiệp vụ chính vừa mới chạy xong thành công.
 */
@Aspect
@Component
public class AuditLogAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditLogAspect.class);

    private final AuditLogService auditLogService;
    private final AdminRepository adminRepository;

    public AuditLogAspect(AuditLogService auditLogService, AdminRepository adminRepository) {
        this.auditLogService = auditLogService;
        this.adminRepository = adminRepository;
    }

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void logAudit(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            Integer adminId = resolveCurrentAdminId();
            if (adminId == null) {
                log.warn("AuditLogAspect: bỏ qua ghi log cho {} — không xác định được Admin đang đăng nhập",
                        joinPoint.getSignature());
                return;
            }

            String entityId = resolveEntityId(joinPoint, result);
            String description = auditable.description().isBlank()
                    ? defaultDescription(auditable, entityId)
                    : auditable.description();

            auditLogService.record(adminId, auditable.action(), auditable.entityName(), entityId, description, resolveClientIp());
        } catch (Exception e) {
            // BR-07: lỗi ghi log không được ảnh hưởng luồng nghiệp vụ chính đã chạy xong.
            log.warn("AuditLogAspect: ghi Audit Log thất bại cho {} — {}", joinPoint.getSignature(), e.getMessage(), e);
        }
    }

    private Integer resolveCurrentAdminId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        if (username == null || !username.startsWith(SecurityConstants.ADMIN_PREFIX)) {
            return null;
        }
        String actualUsername = username.substring(SecurityConstants.ADMIN_PREFIX.length());
        return adminRepository.findByUsernameOrEmail(actualUsername, actualUsername).map(Admin::getId).orElse(null);
    }

    private String resolveClientIp() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            return servletAttrs.getRequest().getRemoteAddr();
        }
        return null;
    }

    /** Cố gắng suy ra ID đối tượng bị tác động: ưu tiên result.getId(), rồi tới argument đầu tiên có getId(). */
    private String resolveEntityId(JoinPoint joinPoint, Object result) {
        String fromResult = extractId(result);
        if (fromResult != null) {
            return fromResult;
        }
        for (Object arg : joinPoint.getArgs()) {
            String fromArg = extractId(arg);
            if (fromArg != null) {
                return fromArg;
            }
        }
        return null;
    }

    private String extractId(Object target) {
        if (target == null) {
            return null;
        }
        try {
            Method getId = target.getClass().getMethod("getId");
            Object id = getId.invoke(target);
            return id != null ? id.toString() : null;
        } catch (ReflectiveOperationException e) {
            return null;
        }
    }

    private String defaultDescription(Auditable auditable, String entityId) {
        String action = switch (auditable.action()) {
            case CREATE -> "Tạo mới";
            case UPDATE -> "Cập nhật";
            case DELETE -> "Xoá";
        };
        return action + " " + auditable.entityName() + (entityId != null ? " #" + entityId : "");
    }
}
