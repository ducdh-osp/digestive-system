package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Domain Entity — không phụ thuộc JPA. Khác với infrastructure/entities/mysql/AdminEntity.java. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin {
    private Integer id;
    private String username;
    private String email;
    private String passwordHash;
    private Role role;
    private Boolean isActive;
    private LocalDateTime lastLogin;
}
