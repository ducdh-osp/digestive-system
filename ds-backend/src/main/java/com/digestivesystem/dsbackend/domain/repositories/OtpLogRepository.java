package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.OtpLog;

import java.time.LocalDateTime;
import java.util.Optional;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/postgres/OtpLogRepositoryImpl.java. */
public interface OtpLogRepository {
    /** OTP còn hiệu lực: đúng phone+code, chưa dùng, chưa hết hạn. */
    Optional<OtpLog> findActiveOtp(String phoneNumber, String otpCode, LocalDateTime now);

    /** OTP đúng phone+code, chưa dùng — không lọc hết hạn, dùng để phân biệt OTP sai hẳn vs OTP đã hết hạn. */
    Optional<OtpLog> findLatestUnusedOtp(String phoneNumber, String otpCode);

    long countSince(String phoneNumber, LocalDateTime since);

    OtpLog save(OtpLog otpLog);
}
