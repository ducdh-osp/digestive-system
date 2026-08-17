package com.digestivesystem.dsbackend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/** Domain Entity — không phụ thuộc JPA. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private UUID id;
    private UUID customerId;
    private String title;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
