package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Domain Entity — không phụ thuộc JPA. Khác với infrastructure/entities/mysql/RoleEntity.java. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    private Integer id;
    private String roleName;
    private String description;
}
