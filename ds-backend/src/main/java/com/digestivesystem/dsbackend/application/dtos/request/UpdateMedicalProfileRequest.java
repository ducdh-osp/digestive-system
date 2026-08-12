package com.digestivesystem.dsbackend.application.dtos.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateMedicalProfileRequest {

    @DecimalMin(
            value = "1.0",
            message = "Chiều cao phải lớn hơn 0"
    )
    private BigDecimal heightCm;

    @DecimalMin(
            value = "1.0",
            message = "Cân nặng phải lớn hơn 0"
    )
    private BigDecimal weightKg;

    private String medicalHistory;
}