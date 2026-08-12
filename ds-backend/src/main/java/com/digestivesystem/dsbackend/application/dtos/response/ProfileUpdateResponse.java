package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateResponse {

    private ProfileResponse profile;

    private String accessToken;

    private String refreshToken;
}