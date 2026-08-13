package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.MedicalProfile;

import java.util.Optional;
import java.util.UUID;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/postgres/MedicalProfileRepositoryImpl.java. */
public interface MedicalProfileRepository {
    Optional<MedicalProfile> findByCustomerId(UUID customerId);
    MedicalProfile save(MedicalProfile medicalProfile);
}
