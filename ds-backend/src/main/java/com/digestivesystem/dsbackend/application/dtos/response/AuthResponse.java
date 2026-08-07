package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private CustomerDto user;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CustomerDto {
        private UUID id;
        private String fullName;
        private String phoneNumber;
    }
}
