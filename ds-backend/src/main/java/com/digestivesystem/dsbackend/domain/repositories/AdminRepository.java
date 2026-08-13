package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.Admin;

import java.util.Optional;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/mysql/AdminRepositoryImpl.java. */
public interface AdminRepository {
    Optional<Admin> findByUsernameOrEmail(String username, String email);
}
