package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.Notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/postgres. */
public interface NotificationRepository {
    List<Notification> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    Optional<Notification> findByIdAndCustomerId(UUID id, UUID customerId);
    Notification save(Notification notification);
    void deleteByIdAndCustomerId(UUID id, UUID customerId);
}
