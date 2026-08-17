package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.infrastructure.entities.postgres.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Spring Data JPA gateway — chỉ dùng nội bộ bởi NotificationRepositoryImpl. */
@Repository
public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {
    List<NotificationEntity> findAllByCustomer_IdOrderByCreatedAtDesc(UUID customerId);
    Optional<NotificationEntity> findByIdAndCustomer_Id(UUID id, UUID customerId);
    void deleteByIdAndCustomer_Id(UUID id, UUID customerId);
}
