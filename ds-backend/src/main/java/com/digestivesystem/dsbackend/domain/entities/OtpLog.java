package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/** Domain Entity — không phụ thuộc JPA. Khác với infrastructure/entities/postgres/OtpLogEntity.java. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OtpLog {
    private UUID id;
    private String phoneNumber;
    private String otpCode;
    private LocalDateTime expiresAt;
    private Boolean isUsed;
    private LocalDateTime createdAt;
}
