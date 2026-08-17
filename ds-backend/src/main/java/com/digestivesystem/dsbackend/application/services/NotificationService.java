package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.response.NotificationResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.domain.entities.Customer;
import com.digestivesystem.dsbackend.domain.entities.Notification;
import com.digestivesystem.dsbackend.domain.repositories.CustomerRepository;
import com.digestivesystem.dsbackend.domain.repositories.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               CustomerRepository customerRepository) {
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(transactionManager = "postgresTransactionManager", readOnly = true)
    public List<NotificationResponse> list(Authentication authentication) {
        UUID customerId = getCurrentCustomer(authentication).getId();
        return notificationRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public NotificationResponse markAsRead(UUID notificationId, Authentication authentication) {
        UUID customerId = getCurrentCustomer(authentication).getId();
        Notification notification = findOwnedNotification(notificationId, customerId);

        if (!Boolean.TRUE.equals(notification.getRead())) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public void delete(UUID notificationId, Authentication authentication) {
        UUID customerId = getCurrentCustomer(authentication).getId();
        findOwnedNotification(notificationId, customerId);
        notificationRepository.deleteByIdAndCustomerId(notificationId, customerId);
    }

    private Notification findOwnedNotification(UUID notificationId, UUID customerId) {
        return notificationRepository.findByIdAndCustomerId(notificationId, customerId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
    }

    private Customer getCurrentCustomer(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        String username = authentication.getName();
        if (username == null || !username.startsWith(SecurityConstants.CUSTOMER_PREFIX)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        Customer customer = customerRepository
                .findByPhoneNumber(username.substring(SecurityConstants.CUSTOMER_PREFIX.length()))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

        if (!Boolean.TRUE.equals(customer.getIsActive())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa");
        }
        return customer;
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                Boolean.TRUE.equals(notification.getRead()),
                notification.getCreatedAt()
        );
    }
}
