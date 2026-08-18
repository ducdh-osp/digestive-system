package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Domain Entity — không phụ thuộc JPA. Thông báo cá nhân cho Admin (tách bảng khỏi notifications của Customer vì khác Database — MySQL). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotification {
    private Long id;
    private Integer adminId;
    private String type;
    private String title;
    private String message;
    private Boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
