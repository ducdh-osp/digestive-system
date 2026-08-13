package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.Customer;

import java.util.Optional;

/**
 * Interface tầng Domain — chỉ khai báo hợp đồng, KHÔNG biết gì về JPA/Postgres.
 * Implement thật nằm ở infrastructure/repositories/postgres/CustomerRepositoryImpl.java.
 */
public interface CustomerRepository {
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<Customer> findByEmailIgnoreCase(String email);
    Customer save(Customer customer);
}
