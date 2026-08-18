package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.dtos.response.AdminLookupResponse;
import com.digestivesystem.dsbackend.application.dtos.response.AuditLogResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ExportedFileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.PageResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.application.exceptions.codes.AuditLogMessageCodes;
import com.digestivesystem.dsbackend.domain.entities.Admin;
import com.digestivesystem.dsbackend.domain.entities.AuditAction;
import com.digestivesystem.dsbackend.domain.entities.AuditLog;
import com.digestivesystem.dsbackend.domain.repositories.AdminRepository;
import com.digestivesystem.dsbackend.domain.repositories.AuditLogRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private static final int MAX_EXPORT_RANGE_DAYS = 90; // BR-04
    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final String[] EXPORT_HEADERS = {"Thời gian", "Admin thực hiện", "Hành động", "Đối tượng", "Mô tả", "Địa chỉ IP"};

    private final AuditLogRepository auditLogRepository;
    private final AdminRepository adminRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, AdminRepository adminRepository) {
        this.auditLogRepository = auditLogRepository;
        this.adminRepository = adminRepository;
    }

    /**
     * Ghi 1 bản ghi Audit Log — luôn chạy trong transaction MySQL riêng (REQUIRES_NEW) để
     * không phụ thuộc/ảnh hưởng transaction của luồng nghiệp vụ chính đang gọi nó (BR-07).
     * AuditLogAspect chịu trách nhiệm bọc try/catch quanh lời gọi này — lỗi ở đây không được rethrow.
     */
    @Transactional(transactionManager = "mysqlTransactionManager", propagation = Propagation.REQUIRES_NEW)
    public void record(Integer adminId, AuditAction action, String entityName, String entityId, String description, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setDescription(description);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }

    @Transactional(transactionManager = "mysqlTransactionManager", readOnly = true)
    public PageResponse<AuditLogResponse> list(LocalDate fromDate, LocalDate toDate, AuditAction action, Integer adminId, int page, int size) {
        validateRange(fromDate, toDate);
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime toExclusive = toDate.plusDays(1).atStartOfDay();

        List<AuditLog> logs = auditLogRepository.search(from, toExclusive, action, adminId, page, size);
        long total = auditLogRepository.count(from, toExclusive, action, adminId);
        Map<Integer, Admin> adminById = indexAdmins();

        List<AuditLogResponse> content = logs.stream().map(log -> toResponse(log, adminById)).toList();
        return PageResponse.of(content, page, size, total);
    }

    @Transactional(transactionManager = "mysqlTransactionManager", readOnly = true)
    public ExportedFileResponse export(LocalDate fromDate, LocalDate toDate, AuditAction action, Integer adminId, String format) {
        validateRange(fromDate, toDate);
        long rangeDays = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        if (rangeDays > MAX_EXPORT_RANGE_DAYS) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, AuditLogMessageCodes.EXPORT_RANGE_TOO_LARGE);
        }

        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime toExclusive = toDate.plusDays(1).atStartOfDay();
        List<AuditLog> logs = auditLogRepository.searchAll(from, toExclusive, action, adminId);
        if (logs.isEmpty()) {
            throw new BusinessException(HttpStatus.NOT_FOUND, AuditLogMessageCodes.NO_DATA_TO_EXPORT);
        }

        Map<Integer, Admin> adminById = indexAdmins();
        String filename = "audit-log_" + fromDate + "_" + toDate + "." + format;

        if ("csv".equalsIgnoreCase(format)) {
            return new ExportedFileResponse(buildCsv(logs, adminById), filename, "text/csv");
        } else if ("xlsx".equalsIgnoreCase(format)) {
            return new ExportedFileResponse(buildXlsx(logs, adminById), filename,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
        throw new BusinessException(HttpStatus.BAD_REQUEST, AuditLogMessageCodes.INVALID_EXPORT_FORMAT);
    }

    @Transactional(transactionManager = "mysqlTransactionManager", readOnly = true)
    public List<AdminLookupResponse> listAdminsForFilter() {
        return adminRepository.findAll().stream()
                .map(a -> new AdminLookupResponse(a.getId(), a.getUsername(), a.getRole().getRoleName()))
                .toList();
    }

    private void validateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null || fromDate.isAfter(toDate)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, AuditLogMessageCodes.INVALID_DATE_RANGE);
        }
    }

    private Map<Integer, Admin> indexAdmins() {
        return adminRepository.findAll().stream().collect(Collectors.toMap(Admin::getId, a -> a));
    }

    private AuditLogResponse toResponse(AuditLog log, Map<Integer, Admin> adminById) {
        Admin admin = adminById.get(log.getAdminId());
        return new AuditLogResponse(
                log.getId(),
                log.getCreatedAt(),
                admin != null ? admin.getUsername() : null,
                admin != null ? admin.getRole().getRoleName() : null,
                log.getAction().name(),
                log.getEntityName(),
                log.getEntityId(),
                log.getDescription(),
                log.getIpAddress()
        );
    }

    private String adminLabel(AuditLog log, Map<Integer, Admin> adminById) {
        Admin admin = adminById.get(log.getAdminId());
        return admin != null ? admin.getUsername() + " (" + admin.getRole().getRoleName() + ")" : "N/A";
    }

    private String entityLabel(AuditLog log) {
        return log.getEntityId() != null ? log.getEntityName() + "#" + log.getEntityId() : log.getEntityName();
    }

    /** SXSSFWorkbook (streaming) thay vì XSSFWorkbook thường — tránh load hết dữ liệu vào RAM khi log lớn. */
    private byte[] buildXlsx(List<AuditLog> logs, Map<Integer, Admin> adminById) {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit Log");
            Row header = sheet.createRow(0);
            for (int i = 0; i < EXPORT_HEADERS.length; i++) {
                header.createCell(i).setCellValue(EXPORT_HEADERS[i]);
            }

            int rowIdx = 1;
            for (AuditLog log : logs) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(log.getCreatedAt().format(DISPLAY_FORMAT));
                row.createCell(1).setCellValue(adminLabel(log, adminById));
                row.createCell(2).setCellValue(log.getAction().name());
                row.createCell(3).setCellValue(entityLabel(log));
                row.createCell(4).setCellValue(log.getDescription() != null ? log.getDescription() : "");
                row.createCell(5).setCellValue(log.getIpAddress() != null ? log.getIpAddress() : "");
            }

            workbook.write(out);
            workbook.dispose();
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, AuditLogMessageCodes.EXPORT_FAILED);
        }
    }

    private byte[] buildCsv(List<AuditLog> logs, Map<Integer, Admin> adminById) {
        StringBuilder sb = new StringBuilder("﻿"); // BOM UTF-8 để Excel đọc đúng tiếng Việt
        sb.append(String.join(",", EXPORT_HEADERS)).append('\n');

        for (AuditLog log : logs) {
            sb.append(csvEscape(log.getCreatedAt().format(DISPLAY_FORMAT))).append(',')
                    .append(csvEscape(adminLabel(log, adminById))).append(',')
                    .append(csvEscape(log.getAction().name())).append(',')
                    .append(csvEscape(entityLabel(log))).append(',')
                    .append(csvEscape(log.getDescription())).append(',')
                    .append(csvEscape(log.getIpAddress()))
                    .append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
