package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.domain.entities.MedicalProfile;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.CustomerEntity;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.MedicalProfileEntity;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/** Adapter tầng Infrastructure — implement domain.repositories.MedicalProfileRepository bằng JPA thật. */
@Repository
public class MedicalProfileRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.MedicalProfileRepository {

    private final MedicalProfileJpaRepository jpaRepository;
    private final CustomerJpaRepository customerJpaRepository;

    public MedicalProfileRepositoryImpl(MedicalProfileJpaRepository jpaRepository, CustomerJpaRepository customerJpaRepository) {
        this.jpaRepository = jpaRepository;
        this.customerJpaRepository = customerJpaRepository;
    }

    @Override
    public Optional<MedicalProfile> findByCustomerId(UUID customerId) {
        return jpaRepository.findByCustomer_Id(customerId).map(this::toDomain);
    }

    @Override
    public MedicalProfile save(MedicalProfile medicalProfile) {
        // Nếu đã có id: fetch entity gốc trước để giữ nguyên createdAt.
        MedicalProfileEntity entity = (medicalProfile.getId() != null)
                ? jpaRepository.findById(medicalProfile.getId()).orElseGet(MedicalProfileEntity::new)
                : new MedicalProfileEntity();

        if (entity.getCustomer() == null) {
            // getReferenceById: chỉ tạo proxy tham chiếu FK, không bắn thêm query SELECT.
            CustomerEntity customerRef = customerJpaRepository.getReferenceById(medicalProfile.getCustomerId());
            entity.setCustomer(customerRef);
        }

        entity.setHeightCm(medicalProfile.getHeightCm());
        entity.setWeightKg(medicalProfile.getWeightKg());
        entity.setMedicalHistory(medicalProfile.getMedicalHistory());

        return toDomain(jpaRepository.save(entity));
    }

    private MedicalProfile toDomain(MedicalProfileEntity entity) {
        return new MedicalProfile(
                entity.getId(),
                entity.getCustomer().getId(),
                entity.getHeightCm(),
                entity.getWeightKg(),
                entity.getMedicalHistory(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
