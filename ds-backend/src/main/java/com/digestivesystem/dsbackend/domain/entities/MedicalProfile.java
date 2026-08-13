package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/** Domain Entity — không phụ thuộc JPA. Khác với infrastructure/entities/postgres/MedicalProfileEntity.java. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalProfile {
    private UUID id;
    private UUID customerId;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String medicalHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
