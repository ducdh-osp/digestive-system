package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.response.AdminNotificationListResponse;
import com.digestivesystem.dsbackend.application.dtos.response.AdminNotificationResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.domain.entities.Admin;
import com.digestivesystem.dsbackend.domain.entities.AdminNotification;
import com.digestivesystem.dsbackend.domain.repositories.AdminNotificationRepository;
import com.digestivesystem.dsbackend.domain.repositories.AdminRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AdminNotificationService {

    private final AdminNotificationRepository adminNotificationRepository;
    private final AdminRepository adminRepository;

    public AdminNotificationService(AdminNotificationRepository adminNotificationRepository, AdminRepository adminRepository) {
        this.adminNotificationRepository = adminNotificationRepository;
        this.adminRepository = adminRepository;
    }

    @Transactional(transactionManager = "mysqlTransactionManager", readOnly = true)
    public AdminNotificationListResponse list(int page, int size, Authentication authentication) {
        Integer adminId = getCurrentAdmin(authentication).getId();

        var content = adminNotificationRepository.findPageByAdminId(adminId, page, size).stream()
                .map(this::toResponse)
                .toList();
        long total = adminNotificationRepository.countByAdminId(adminId);
        long unreadCount = adminNotificationRepository.countUnreadByAdminId(adminId);

        return AdminNotificationListResponse.of(content, page, size, total, unreadCount);
    }

    @Transactional(transactionManager = "mysqlTransactionManager")
    public AdminNotificationResponse markAsRead(Long notificationId, Authentication authentication) {
        Integer adminId = getCurrentAdmin(authentication).getId();
        AdminNotification notification = findOwnedNotification(notificationId, adminId);

        if (!Boolean.TRUE.equals(notification.getRead())) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = adminNotificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Transactional(transactionManager = "mysqlTransactionManager")
    public void markAllAsRead(Authentication authentication) {
        Integer adminId = getCurrentAdmin(authentication).getId();
        adminNotificationRepository.markAllAsReadByAdminId(adminId);
    }

    @Transactional(transactionManager = "mysqlTransactionManager")
    public void delete(Long notificationId, Authentication authentication) {
        Integer adminId = getCurrentAdmin(authentication).getId();
        findOwnedNotification(notificationId, adminId);
        adminNotificationRepository.deleteByIdAndAdminId(notificationId, adminId);
    }

    private AdminNotification findOwnedNotification(Long notificationId, Integer adminId) {
        return adminNotificationRepository.findByIdAndAdminId(notificationId, adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
    }

    private Admin getCurrentAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        String username = authentication.getName();
        if (username == null || !username.startsWith(SecurityConstants.ADMIN_PREFIX)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        String actualUsername = username.substring(SecurityConstants.ADMIN_PREFIX.length());
        return adminRepository.findByUsernameOrEmail(actualUsername, actualUsername)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
    }

    private AdminNotificationResponse toResponse(AdminNotification notification) {
        return new AdminNotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                Boolean.TRUE.equals(notification.getRead()),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
