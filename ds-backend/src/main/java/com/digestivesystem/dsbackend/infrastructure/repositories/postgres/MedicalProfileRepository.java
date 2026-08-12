package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.infrastructure.entities.postgres.Customer;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.MedicalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalProfileRepository
        extends JpaRepository<MedicalProfile, UUID> {

    Optional<MedicalProfile> findByCustomer(Customer customer);
}