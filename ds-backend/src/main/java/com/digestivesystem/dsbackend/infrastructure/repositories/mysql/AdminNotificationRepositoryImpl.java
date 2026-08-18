package com.digestivesystem.dsbackend.infrastructure.repositories.mysql;

import com.digestivesystem.dsbackend.domain.entities.AdminNotification;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AdminNotificationEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Adapter tầng Infrastructure — implement domain.repositories.AdminNotificationRepository bằng JPA thật. */
@Repository
public class AdminNotificationRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.AdminNotificationRepository {

    private final AdminNotificationJpaRepository jpaRepository;
    private final AdminJpaRepository adminJpaRepository;

    public AdminNotificationRepositoryImpl(AdminNotificationJpaRepository jpaRepository, AdminJpaRepository adminJpaRepository) {
        this.jpaRepository = jpaRepository;
        this.adminJpaRepository = adminJpaRepository;
    }

    @Override
    public List<AdminNotification> findPageByAdminId(Integer adminId, int page, int size) {
        return jpaRepository.findByAdmin_IdOrderByCreatedAtDesc(adminId, PageRequest.of(page, size))
                .map(this::toDomain)
                .getContent();
    }

    @Override
    public long countByAdminId(Integer adminId) {
        return jpaRepository.countByAdmin_Id(adminId);
    }

    @Override
    public long countUnreadByAdminId(Integer adminId) {
        return jpaRepository.countByAdmin_IdAndReadFalse(adminId);
    }

    @Override
    public Optional<AdminNotification> findByIdAndAdminId(Long id, Integer adminId) {
        return jpaRepository.findByIdAndAdmin_Id(id, adminId).map(this::toDomain);
    }

    @Override
    public AdminNotification save(AdminNotification notification) {
        AdminNotificationEntity entity = notification.getId() == null
                ? new AdminNotificationEntity()
                : jpaRepository.findById(notification.getId()).orElseGet(AdminNotificationEntity::new);

        if (entity.getAdmin() == null) {
            entity.setAdmin(adminJpaRepository.getReferenceById(notification.getAdminId()));
        }
        entity.setType(notification.getType());
        entity.setTitle(notification.getTitle());
        entity.setMessage(notification.getMessage());
        entity.setRead(Boolean.TRUE.equals(notification.getRead()));
        entity.setReadAt(notification.getReadAt());

        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public void deleteByIdAndAdminId(Long id, Integer adminId) {
        jpaRepository.deleteByIdAndAdmin_Id(id, adminId);
    }

    @Override
    public void markAllAsReadByAdminId(Integer adminId) {
        jpaRepository.markAllAsRead(adminId);
    }

    private AdminNotification toDomain(AdminNotificationEntity entity) {
        return new AdminNotification(
                entity.getId(),
                entity.getAdmin().getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getRead(),
                entity.getReadAt(),
                entity.getCreatedAt()
        );
    }
}
