package com.digestivesystem.dsbackend.api.controllers;

import com.digestivesystem.dsbackend.application.dtos.response.AdminLookupResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ApiResponse;
import com.digestivesystem.dsbackend.application.dtos.response.AuditLogResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ExportedFileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.PageResponse;
import com.digestivesystem.dsbackend.application.services.AuditLogService;
import com.digestivesystem.dsbackend.domain.entities.AuditAction;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/** D.4.1 (Xem & Lọc lịch sử hoạt động) + D.4.2 (Xuất file Log) — chỉ SUPER_ADMIN được truy cập (BR-03). */
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) Integer adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDate defaultTo = toDate != null ? toDate : LocalDate.now();
        LocalDate defaultFrom = fromDate != null ? fromDate : defaultTo.minusDays(6); // Mặc định 7 ngày gần nhất

        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử hoạt động thành công",
                auditLogService.list(defaultFrom, defaultTo, action, adminId, page, size)));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) Integer adminId) {

        LocalDate defaultTo = toDate != null ? toDate : LocalDate.now();
        LocalDate defaultFrom = fromDate != null ? fromDate : defaultTo.minusDays(6);

        ExportedFileResponse file = auditLogService.export(defaultFrom, defaultTo, action, adminId, format);

        String encodedFilename = java.net.URLEncoder.encode(file.getFilename(), StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"; filename*=UTF-8''" + encodedFilename)
                .body(file.getContent());
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<AdminLookupResponse>>> listAdminsForFilter() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Admin thành công", auditLogService.listAdminsForFilter()));
    }
}
