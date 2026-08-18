package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.domain.entities.Notification;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.NotificationEntity;
import org.springframework.data.domain.PageRequest;
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
    public List<Notification> findPageByCustomerId(UUID customerId, int page, int size) {
        return jpaRepository.findByCustomer_IdAndDeletedFalseOrderByCreatedAtDesc(customerId, PageRequest.of(page, size))
                .map(this::toDomain)
                .getContent();
    }

    @Override
    public long countByCustomerId(UUID customerId) {
        return jpaRepository.countByCustomer_IdAndDeletedFalse(customerId);
    }

    @Override
    public long countUnreadByCustomerId(UUID customerId) {
        return jpaRepository.countByCustomer_IdAndReadFalseAndDeletedFalse(customerId);
    }

    @Override
    public Optional<Notification> findByIdAndCustomerId(UUID id, UUID customerId) {
        return jpaRepository.findByIdAndCustomer_IdAndDeletedFalse(id, customerId).map(this::toDomain);
    }

    @Override
    public Notification save(Notification notification) {
        NotificationEntity entity = notification.getId() == null
                ? new NotificationEntity()
                : jpaRepository.findById(notification.getId()).orElseGet(NotificationEntity::new);

        if (entity.getCustomer() == null) {
            entity.setCustomer(customerJpaRepository.getReferenceById(notification.getCustomerId()));
        }
        entity.setType(notification.getType());
        entity.setTitle(notification.getTitle());
        entity.setMessage(notification.getMessage());
        entity.setRead(Boolean.TRUE.equals(notification.getRead()));
        entity.setReadAt(notification.getReadAt());

        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public void deleteByIdAndCustomerId(UUID id, UUID customerId) {
        jpaRepository.softDeleteByIdAndCustomerId(id, customerId);
    }

    @Override
    public void markAllAsReadByCustomerId(UUID customerId) {
        jpaRepository.markAllAsRead(customerId);
    }

    private Notification toDomain(NotificationEntity entity) {
        return new Notification(
                entity.getId(),
                entity.getCustomer().getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getRead(),
                entity.getReadAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
