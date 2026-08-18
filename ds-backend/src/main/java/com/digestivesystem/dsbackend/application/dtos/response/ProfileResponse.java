package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {

    private UUID id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String avatarUrl;
    private String theme;
    private MedicalProfileResponse medicalProfile;
}