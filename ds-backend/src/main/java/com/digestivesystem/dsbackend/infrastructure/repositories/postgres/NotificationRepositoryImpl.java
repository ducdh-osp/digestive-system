package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.domain.entities.Notification;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.NotificationEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Adapter tầng Infrastructure — ánh xạ domain Notification sang JPA/PostgreSQL. */
@Repository
public class NotificationRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.NotificationRepository {

    private final NotificationJpaRepository jpaRepository;
    private final CustomerJpaRepository customerJpaRepository;

    public NotificationRepositoryImpl(NotificationJpaRepository jpaRepository,
                                      CustomerJpaRepository customerJpaRepository) {
        this.jpaRepository = jpaRepository;
        this.customerJpaRepository = customerJpaRepository;
    }

    @Override
    public List<Notification> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId) {
        return jpaRepository.findAllByCustomer_IdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Notification> findByIdAndCustomerId(UUID id, UUID customerId) {
        return jpaRepository.findByIdAndCustomer_Id(id, customerId).map(this::toDomain);
    }

    @Override
    public Notification save(Notification notification) {
        NotificationEntity entity = notification.getId() == null
                ? new NotificationEntity()
                : jpaRepository.findById(notification.getId()).orElseGet(NotificationEntity::new);

        if (entity.getCustomer() == null) {
            entity.setCustomer(customerJpaRepository.getReferenceById(notification.getCustomerId()));
        }
        entity.setTitle(notification.getTitle());
        entity.setMessage(notification.getMessage());
        entity.setRead(Boolean.TRUE.equals(notification.getRead()));

        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public void deleteByIdAndCustomerId(UUID id, UUID customerId) {
        jpaRepository.deleteByIdAndCustomer_Id(id, customerId);
    }

    private Notification toDomain(NotificationEntity entity) {
        return new Notification(
                entity.getId(),
                entity.getCustomer().getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getRead(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
