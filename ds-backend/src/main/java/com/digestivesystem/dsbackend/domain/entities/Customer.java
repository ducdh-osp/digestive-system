package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity — đại diện thực thể nghiệp vụ Customer, KHÔNG phụ thuộc JPA/Hibernate.
 * Khác với infrastructure/entities/postgres/CustomerEntity.java (bản ánh xạ DB thật).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    private UUID id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String passwordHash;
    private Boolean isActive;
    private String avatarUrl;
    private String theme;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
