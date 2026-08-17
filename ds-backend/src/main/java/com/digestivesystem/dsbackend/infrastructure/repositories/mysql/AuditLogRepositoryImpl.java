package com.digestivesystem.dsbackend.infrastructure.repositories.mysql;

import com.digestivesystem.dsbackend.domain.entities.AuditAction;
import com.digestivesystem.dsbackend.domain.entities.AuditLog;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AdminEntity;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AuditLogEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Adapter tầng Infrastructure — implement domain.repositories.AuditLogRepository bằng JPA thật. */
@Repository
public class AuditLogRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.AuditLogRepository {

    private final AuditLogJpaRepository jpaRepository;
    private final AdminJpaRepository adminJpaRepository;

    public AuditLogRepositoryImpl(AuditLogJpaRepository jpaRepository, AdminJpaRepository adminJpaRepository) {
        this.jpaRepository = jpaRepository;
        this.adminJpaRepository = adminJpaRepository;
    }

    @Override
    public AuditLog save(AuditLog auditLog) {
        AuditLogEntity entity = new AuditLogEntity();
        // getReferenceById: chỉ tạo proxy tham chiếu FK, không bắn thêm query SELECT.
        AdminEntity adminRef = adminJpaRepository.getReferenceById(auditLog.getAdminId());
        entity.setAdmin(adminRef);
        entity.setAction(auditLog.getAction());
        entity.setEntityName(auditLog.getEntityName());
        entity.setEntityId(auditLog.getEntityId());
        entity.setDescription(auditLog.getDescription());
        entity.setIpAddress(auditLog.getIpAddress());

        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public List<AuditLog> search(LocalDateTime fromDate, LocalDateTime toDate, AuditAction action, Integer adminId, int page, int size) {
        return jpaRepository.search(fromDate, toDate, action, adminId, PageRequest.of(page, size))
                .map(this::toDomain)
                .getContent();
    }

    @Override
    public long count(LocalDateTime fromDate, LocalDateTime toDate, AuditAction action, Integer adminId) {
        return jpaRepository.countByFilter(fromDate, toDate, action, adminId);
    }

    @Override
    public List<AuditLog> searchAll(LocalDateTime fromDate, LocalDateTime toDate, AuditAction action, Integer adminId) {
        return jpaRepository.searchAll(fromDate, toDate, action, adminId).stream().map(this::toDomain).toList();
    }

    private AuditLog toDomain(AuditLogEntity entity) {
        return new AuditLog(
                entity.getId(),
                entity.getAdmin().getId(),
                entity.getAction(),
                entity.getEntityName(),
                entity.getEntityId(),
                entity.getDescription(),
                entity.getIpAddress(),
                entity.getCreatedAt()
        );
    }
}
