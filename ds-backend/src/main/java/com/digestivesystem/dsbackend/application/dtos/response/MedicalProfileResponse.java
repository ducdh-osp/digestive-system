package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalProfileResponse {

    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String medicalHistory;
}