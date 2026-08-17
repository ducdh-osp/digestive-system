package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogResponse {
    private Long id;
    private LocalDateTime createdAt;
    private String adminUsername;
    private String adminRoleName;
    private String action;
    private String entityName;
    private String entityId;
    private String description;
    private String ipAddress;
}
