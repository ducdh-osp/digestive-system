package com.digestivesystem.dsbackend.infrastructure.aspects;

import com.digestivesystem.dsbackend.application.annotations.Auditable;
import com.digestivesystem.dsbackend.domain.entities.AuditAction;
import com.digestivesystem.dsbackend.infrastructure.repositories.mysql.AuditLogJpaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Xác nhận AuditLogAspect thực sự chặn được method @Auditable qua Spring AOP proxy và ghi
 * đúng 1 dòng vào bảng audit_logs thật (MySQL) — không phải mock. Dự án hiện chưa có nghiệp
 * vụ Admin CRUD nào khác để gắn @Auditable lên (chỉ có Admin Login là read-only), nên bean
 * demo dưới đây đóng vai trò là "lời gọi thực" tối thiểu để chứng minh cơ chế hoạt động đúng,
 * sẵn sàng cho các Service Admin CRUD tương lai chỉ cần thêm annotation này là có audit log.
 */
@SpringBootTest
@Import(AuditLogAspectTest.DemoAuditedService.class)
class AuditLogAspectTest {

    @Component
    static class DemoAuditedService {
        @Auditable(action = AuditAction.UPDATE, entityName = "demo_entity", description = "Test ghi Audit Log tự động")
        public void doSomething() {
        }
    }

    @Autowired
    DemoAuditedService demoAuditedService;

    @Autowired
    AuditLogJpaRepository auditLogJpaRepository;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void auditableMethod_writesAuditLogRow_whenAdminAuthenticated() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ADMIN:admin", null,
                        List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))));

        long before = auditLogJpaRepository.count();
        demoAuditedService.doSomething();
        long after = auditLogJpaRepository.count();

        assertThat(after).isEqualTo(before + 1);

        var lastLog = auditLogJpaRepository.findAll().stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .orElseThrow();
        assertThat(lastLog.getEntityName()).isEqualTo("demo_entity");
        assertThat(lastLog.getAction()).isEqualTo(AuditAction.UPDATE);
        assertThat(lastLog.getDescription()).isEqualTo("Test ghi Audit Log tự động");
        // getId() trên proxy Hibernate LAZY không cần mở lại session — an toàn để assert ngoài transaction.
        assertThat(lastLog.getAdmin().getId()).isEqualTo(1);
    }

    @Test
    void auditableMethod_doesNotThrow_whenNoAuthenticatedAdmin() {
        SecurityContextHolder.clearContext();
        long before = auditLogJpaRepository.count();

        demoAuditedService.doSomething(); // Không có Admin đăng nhập -> aspect bỏ qua, không ném lỗi (BR-07)

        assertThat(auditLogJpaRepository.count()).isEqualTo(before);
    }
}
