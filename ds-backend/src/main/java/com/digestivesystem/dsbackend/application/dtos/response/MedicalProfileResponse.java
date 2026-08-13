package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalProfileResponse {

    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String medicalHistory;
}