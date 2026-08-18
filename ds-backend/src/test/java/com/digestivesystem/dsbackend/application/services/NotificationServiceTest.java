package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.response.NotificationListResponse;
import com.digestivesystem.dsbackend.application.dtos.response.NotificationResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.domain.entities.Customer;
import com.digestivesystem.dsbackend.domain.entities.Notification;
import com.digestivesystem.dsbackend.domain.repositories.CustomerRepository;
import com.digestivesystem.dsbackend.domain.repositories.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private static final String PHONE_NUMBER = "0901234567";

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private Authentication authentication;

    private NotificationService notificationService;
    private UUID customerId;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, customerRepository);
        customerId = UUID.randomUUID();

        Customer customer = new Customer(
                customerId,
                "Nguyễn Văn A",
                PHONE_NUMBER,
                null,
                "password-hash",
                true,
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(SecurityConstants.CUSTOMER_PREFIX + PHONE_NUMBER);
        when(customerRepository.findByPhoneNumber(PHONE_NUMBER)).thenReturn(Optional.of(customer));
    }

    @Test
    void listOnlyQueriesNotificationsForCurrentCustomer() {
        Notification notification = notification(false);
        when(notificationRepository.findPageByCustomerId(customerId, 0, 10))
                .thenReturn(List.of(notification));
        when(notificationRepository.countByCustomerId(customerId)).thenReturn(1L);
        when(notificationRepository.countUnreadByCustomerId(customerId)).thenReturn(1L);

        NotificationListResponse result = notificationService.list(0, 10, authentication);

        assertEquals(1, result.getContent().size());
        assertEquals(notification.getId(), result.getContent().getFirst().getId());
        assertEquals(1L, result.getUnreadCount());
        verify(notificationRepository).findPageByCustomerId(customerId, 0, 10);
    }

    @Test
    void markAsReadUpdatesOwnedNotification() {
        Notification notification = notification(false);
        when(notificationRepository.findByIdAndCustomerId(notification.getId(), customerId))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);

        NotificationResponse result = notificationService.markAsRead(notification.getId(), authentication);

        assertTrue(result.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsReadDoesNotExposeAnotherCustomersNotification() {
        UUID anotherCustomersNotificationId = UUID.randomUUID();
        when(notificationRepository.findByIdAndCustomerId(anotherCustomersNotificationId, customerId))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> notificationService.markAsRead(anotherCustomersNotificationId, authentication)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAllAsReadDelegatesToRepositoryForCurrentCustomer() {
        notificationService.markAllAsRead(authentication);

        verify(notificationRepository).markAllAsReadByCustomerId(customerId);
    }

    @Test
    void deleteSoftDeletesOwnedNotification() {
        Notification notification = notification(false);
        when(notificationRepository.findByIdAndCustomerId(notification.getId(), customerId))
                .thenReturn(Optional.of(notification));

        notificationService.delete(notification.getId(), authentication);

        verify(notificationRepository).deleteByIdAndCustomerId(notification.getId(), customerId);
    }

    @Test
    void deleteDoesNotTouchAnotherCustomersNotification() {
        UUID anotherCustomersNotificationId = UUID.randomUUID();
        when(notificationRepository.findByIdAndCustomerId(anotherCustomersNotificationId, customerId))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> notificationService.delete(anotherCustomersNotificationId, authentication)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        verify(notificationRepository, never()).deleteByIdAndCustomerId(
                anotherCustomersNotificationId,
                customerId
        );
    }

    private Notification notification(boolean read) {
        return new Notification(
                UUID.randomUUID(),
                customerId,
                "SYSTEM",
                "Nhắc nhở sức khỏe",
                "Bạn có lịch tái khám.",
                read,
                read ? LocalDateTime.now() : null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }
}
