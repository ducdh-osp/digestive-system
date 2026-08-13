package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.infrastructure.entities.postgres.OtpLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/** Spring Data JPA gateway — chi tiết hạ tầng, chỉ dùng nội bộ bởi OtpLogRepositoryImpl. */
@Repository
public interface OtpLogJpaRepository extends JpaRepository<OtpLogEntity, UUID> {
    Optional<OtpLogEntity> findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String phoneNumber, String otpCode, LocalDateTime now);

    Optional<OtpLogEntity> findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(
            String phoneNumber, String otpCode);

    long countByPhoneNumberAndCreatedAtAfter(String phoneNumber, LocalDateTime time);
}
