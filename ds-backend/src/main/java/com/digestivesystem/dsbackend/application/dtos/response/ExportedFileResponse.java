package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExportedFileResponse {
    private byte[] content;
    private String filename;
    private String contentType;
}
