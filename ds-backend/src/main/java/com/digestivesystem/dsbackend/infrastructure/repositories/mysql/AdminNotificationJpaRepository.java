package com.digestivesystem.dsbackend.infrastructure.repositories.mysql;

import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AdminNotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Spring Data JPA gateway — chỉ dùng nội bộ bởi AdminNotificationRepositoryImpl. */
@Repository
public interface AdminNotificationJpaRepository extends JpaRepository<AdminNotificationEntity, Long> {
    Page<AdminNotificationEntity> findByAdmin_IdOrderByCreatedAtDesc(Integer adminId, Pageable pageable);
    long countByAdmin_Id(Integer adminId);
    long countByAdmin_IdAndReadFalse(Integer adminId);
    Optional<AdminNotificationEntity> findByIdAndAdmin_Id(Long id, Integer adminId);
    void deleteByIdAndAdmin_Id(Long id, Integer adminId);

    @Modifying
    @Query("UPDATE AdminNotificationEntity n SET n.read = true, n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.admin.id = :adminId AND n.read = false")
    int markAllAsRead(@Param("adminId") Integer adminId);
}
