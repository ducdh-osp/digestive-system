package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.AdminNotification;

import java.util.List;
import java.util.Optional;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/mysql. */
public interface AdminNotificationRepository {
    List<AdminNotification> findPageByAdminId(Integer adminId, int page, int size);
    long countByAdminId(Integer adminId);
    long countUnreadByAdminId(Integer adminId);
    Optional<AdminNotification> findByIdAndAdminId(Long id, Integer adminId);
    AdminNotification save(AdminNotification notification);
    void deleteByIdAndAdminId(Long id, Integer adminId);
    void markAllAsReadByAdminId(Integer adminId);
}
