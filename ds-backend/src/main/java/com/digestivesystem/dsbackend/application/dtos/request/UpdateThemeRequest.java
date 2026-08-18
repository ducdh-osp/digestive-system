package com.digestivesystem.dsbackend.application.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateThemeRequest {

    @NotBlank(message = "Giao diện không được để trống")
    @Pattern(regexp = "^(light|dark)$", message = "Giao diện chỉ nhận giá trị 'light' hoặc 'dark'")
    private String theme;
}
