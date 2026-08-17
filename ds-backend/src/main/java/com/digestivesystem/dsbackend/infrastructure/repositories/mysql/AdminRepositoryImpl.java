package com.digestivesystem.dsbackend.infrastructure.repositories.mysql;

import com.digestivesystem.dsbackend.domain.entities.Admin;
import com.digestivesystem.dsbackend.domain.entities.Role;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.AdminEntity;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.RoleEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Adapter tầng Infrastructure — implement domain.repositories.AdminRepository bằng JPA thật. */
@Repository
public class AdminRepositoryImpl implements com.digestivesystem.dsbackend.domain.repositories.AdminRepository {

    private final AdminJpaRepository jpaRepository;

    public AdminRepositoryImpl(AdminJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<Admin> findByUsernameOrEmail(String username, String email) {
        return jpaRepository.findByUsernameOrEmail(username, email).map(this::toDomain);
    }

    @Override
    public List<Admin> findAll() {
        return jpaRepository.findAllByOrderByUsernameAsc().stream().map(this::toDomain).toList();
    }

    private Admin toDomain(AdminEntity entity) {
        return new Admin(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getPasswordHash(),
                toDomainRole(entity.getRole()),
                entity.getIsActive(),
                entity.getLastLogin()
        );
    }

    private Role toDomainRole(RoleEntity entity) {
        return new Role(entity.getId(), entity.getRoleName(), entity.getDescription());
    }
}
