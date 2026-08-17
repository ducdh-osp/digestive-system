package com.digestivesystem.dsbackend.domain.repositories;

import com.digestivesystem.dsbackend.domain.entities.Admin;

import java.util.List;
import java.util.Optional;

/** Interface tầng Domain. Implement thật nằm ở infrastructure/repositories/mysql/AdminRepositoryImpl.java. */
public interface AdminRepository {
    Optional<Admin> findByUsernameOrEmail(String username, String email);

    /** Danh sách toàn bộ Admin, sắp xếp theo username — phục vụ dropdown lọc "Nhân viên" ở D.4.1. */
    List<Admin> findAll();
}
