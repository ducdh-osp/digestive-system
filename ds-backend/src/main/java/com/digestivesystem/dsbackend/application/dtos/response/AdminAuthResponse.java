package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuthResponse {
    private String accessToken;
    private String refreshToken;
    private AdminDto admin;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminDto {
        private Integer id;
        private String username;
        private String email;
        private String role;
    }
}
