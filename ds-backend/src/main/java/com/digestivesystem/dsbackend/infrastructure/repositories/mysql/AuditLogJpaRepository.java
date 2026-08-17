package com.digestivesystem.dsbackend.infrastructure.repositories.mysql;

import com.digestivesystem.dsbackend.domain.entities.AuditAction;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Spring Data JPA gateway — chi tiết hạ tầng, chỉ dùng nội bộ bởi AuditLogRepositoryImpl. */
@Repository
public interface AuditLogJpaRepository extends JpaRepository<AuditLogEntity, Long> {

    String FILTER_JPQL = "FROM AuditLogEntity a WHERE a.createdAt >= :fromDate AND a.createdAt < :toDateExclusive " +
            "AND (:action IS NULL OR a.action = :action) AND (:adminId IS NULL OR a.admin.id = :adminId)";

    @Query("SELECT a " + FILTER_JPQL + " ORDER BY a.createdAt DESC")
    Page<AuditLogEntity> search(@Param("fromDate") LocalDateTime fromDate,
                                 @Param("toDateExclusive") LocalDateTime toDateExclusive,
                                 @Param("action") AuditAction action,
                                 @Param("adminId") Integer adminId,
                                 Pageable pageable);

    @Query("SELECT a " + FILTER_JPQL + " ORDER BY a.createdAt DESC")
    List<AuditLogEntity> searchAll(@Param("fromDate") LocalDateTime fromDate,
                                    @Param("toDateExclusive") LocalDateTime toDateExclusive,
                                    @Param("action") AuditAction action,
                                    @Param("adminId") Integer adminId);

    @Query("SELECT COUNT(a) " + FILTER_JPQL)
    long countByFilter(@Param("fromDate") LocalDateTime fromDate,
                        @Param("toDateExclusive") LocalDateTime toDateExclusive,
                        @Param("action") AuditAction action,
                        @Param("adminId") Integer adminId);
}
