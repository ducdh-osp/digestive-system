package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.infrastructure.entities.postgres.MedicalProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/** Spring Data JPA gateway — chi tiết hạ tầng, chỉ dùng nội bộ bởi MedicalProfileRepositoryImpl. */
@Repository
public interface MedicalProfileJpaRepository extends JpaRepository<MedicalProfileEntity, UUID> {
    Optional<MedicalProfileEntity> findByCustomer_Id(UUID customerId);
}
