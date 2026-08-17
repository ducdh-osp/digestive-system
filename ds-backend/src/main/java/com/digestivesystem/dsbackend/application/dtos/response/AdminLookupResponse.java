package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO gọn cho dropdown lọc "Nhân viên" ở màn D.4.1 — không lộ email/trạng thái tài khoản. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminLookupResponse {
    private Integer id;
    private String username;
    private String roleName;
}
