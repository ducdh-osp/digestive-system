package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.infrastructure.entities.postgres.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/** Spring Data JPA gateway — chỉ dùng nội bộ bởi NotificationRepositoryImpl. */
@Repository
public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {
    Page<NotificationEntity> findByCustomer_IdAndDeletedFalseOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
    long countByCustomer_IdAndDeletedFalse(UUID customerId);
    long countByCustomer_IdAndReadFalseAndDeletedFalse(UUID customerId);
    Optional<NotificationEntity> findByIdAndCustomer_IdAndDeletedFalse(UUID id, UUID customerId);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.read = true, n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.customer.id = :customerId AND n.read = false AND n.deleted = false")
    int markAllAsRead(@Param("customerId") UUID customerId);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.deleted = true, n.deletedAt = CURRENT_TIMESTAMP " +
            "WHERE n.id = :id AND n.customer.id = :customerId AND n.deleted = false")
    int softDeleteByIdAndCustomerId(@Param("id") UUID id, @Param("customerId") UUID customerId);
}
