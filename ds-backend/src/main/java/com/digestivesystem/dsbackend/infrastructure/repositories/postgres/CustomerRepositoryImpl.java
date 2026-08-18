package com.digestivesystem.dsbackend.infrastructure.repositories.postgres;

import com.digestivesystem.dsbackend.domain.entities.Customer;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.CustomerEntity;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Adapter tầng Infrastructure — implement domain.repositories.CustomerRepository bằng JPA thật. */
@Repository
public class CustomerRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.CustomerRepository {

    private final CustomerJpaRepository jpaRepository;

    public CustomerRepositoryImpl(CustomerJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<Customer> findByPhoneNumber(String phoneNumber) {
        return jpaRepository.findByPhoneNumber(phoneNumber).map(this::toDomain);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        return jpaRepository.existsByPhoneNumber(phoneNumber);
    }

    @Override
    public Optional<Customer> findByEmailIgnoreCase(String email) {
        return jpaRepository.findByEmailIgnoreCase(email).map(this::toDomain);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

    @Override
    public Customer save(Customer customer) {
        // Nếu đã có id: fetch entity gốc rồi mới ghi đè field thay đổi, tránh Hibernate merge
        // ghi đè mất giá trị createdAt (do đối tượng mới dựng tay luôn có createdAt = null).
        CustomerEntity entity = (customer.getId() != null)
                ? jpaRepository.findById(customer.getId()).orElseGet(CustomerEntity::new)
                : new CustomerEntity();

        entity.setFullName(customer.getFullName());
        entity.setPhoneNumber(customer.getPhoneNumber());
        entity.setEmail(customer.getEmail());
        entity.setPasswordHash(customer.getPasswordHash());
        entity.setIsActive(customer.getIsActive());
        entity.setAvatarUrl(customer.getAvatarUrl());

        return toDomain(jpaRepository.save(entity));
    }

    private Customer toDomain(CustomerEntity entity) {
        return new Customer(
                entity.getId(),
                entity.getFullName(),
                entity.getPhoneNumber(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getIsActive(),
                entity.getAvatarUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
