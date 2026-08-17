package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.AuditAction;
import com.digestivesystem.dsbackend.domain.entities.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/mysql/AuditLogRepositoryImpl.java. */
public interface AuditLogRepository {

    AuditLog save(AuditLog auditLog);

    /** Trang kết quả theo bộ lọc (D.4.1) — sắp xếp mới nhất trước. */
    List<AuditLog> search(LocalDateTime fromDate, LocalDateTime toDate, AuditAction action, Integer adminId, int page, int size);

    /** Tổng số bản ghi khớp bộ lọc — phục vụ phân trang. */
    long count(LocalDateTime fromDate, LocalDateTime toDate, AuditAction action, Integer adminId);

    /** Toàn bộ bản ghi khớp bộ lọc, không phân trang — phục vụ Export (D.4.2). */
    List<AuditLog> searchAll(LocalDateTime fromDate, LocalDateTime toDate, AuditAction action, Integer adminId);
}
