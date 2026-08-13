package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.domain.entities.OtpLog;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.OtpLogEntity;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/** Adapter tầng Infrastructure — implement domain.repositories.OtpLogRepository bằng JPA thật. */
@Repository
public class OtpLogRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.OtpLogRepository {

    private final OtpLogJpaRepository jpaRepository;

    public OtpLogRepositoryImpl(OtpLogJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<OtpLog> findActiveOtp(String phoneNumber, String otpCode, LocalDateTime now) {
        return jpaRepository.findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                phoneNumber, otpCode, now).map(this::toDomain);
    }

    @Override
    public Optional<OtpLog> findLatestUnusedOtp(String phoneNumber, String otpCode) {
        return jpaRepository.findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(
                phoneNumber, otpCode).map(this::toDomain);
    }

    @Override
    public long countSince(String phoneNumber, LocalDateTime since) {
        return jpaRepository.countByPhoneNumberAndCreatedAtAfter(phoneNumber, since);
    }

    @Override
    public OtpLog save(OtpLog otpLog) {
        // Nếu đã có id (đánh dấu is_used): fetch entity gốc trước để giữ nguyên createdAt.
        OtpLogEntity entity = (otpLog.getId() != null)
                ? jpaRepository.findById(otpLog.getId()).orElseGet(OtpLogEntity::new)
                : new OtpLogEntity();

        entity.setPhoneNumber(otpLog.getPhoneNumber());
        entity.setOtpCode(otpLog.getOtpCode());
        entity.setExpiresAt(otpLog.getExpiresAt());
        entity.setIsUsed(otpLog.getIsUsed());

        return toDomain(jpaRepository.save(entity));
    }

    private OtpLog toDomain(OtpLogEntity entity) {
        return new OtpLog(
                entity.getId(),
                entity.getPhoneNumber(),
                entity.getOtpCode(),
                entity.getExpiresAt(),
                entity.getIsUsed(),
                entity.getCreatedAt()
        );
    }
}
