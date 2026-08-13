package com.digestivesystem.dsbackend.infrastructure.repositories.mysql;

import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AdminEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Spring Data JPA gateway — chi tiết hạ tầng, chỉ dùng nội bộ bởi AdminRepositoryImpl. */
@Repository
public interface AdminJpaRepository extends JpaRepository<AdminEntity, Integer> {
    Optional<AdminEntity> findByUsernameOrEmail(String username, String email);
}
