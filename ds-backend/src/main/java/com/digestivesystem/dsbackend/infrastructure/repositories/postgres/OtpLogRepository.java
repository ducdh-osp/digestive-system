package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.infrastructure.entities.postgres.OtpLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpLogRepository extends JpaRepository<OtpLog, UUID> {
    Optional<OtpLog> findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String phoneNumber, String otpCode, LocalDateTime now);

    Optional<OtpLog> findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(
            String phoneNumber, String otpCode);

    long countByPhoneNumberAndCreatedAtAfter(String phoneNumber, LocalDateTime time);
}
