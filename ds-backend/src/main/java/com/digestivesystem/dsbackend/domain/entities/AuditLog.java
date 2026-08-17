package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Domain Entity — không phụ thuộc JPA. Khác với infrastructure/entities/mysql/AuditLogEntity.java. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    private Long id;
    private Integer adminId;
    private AuditAction action;
    private String entityName;
    private String entityId;
    private String description;
    private String ipAddress;
    private LocalDateTime createdAt;
}
