package com.digestivesystem.dsbackend.api.controllers;

import com.digestivesystem.dsbackend.application.dtos.response.AdminNotificationListResponse;
import com.digestivesystem.dsbackend.application.dtos.response.AdminNotificationResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ApiResponse;
import com.digestivesystem.dsbackend.application.services.AdminNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Thông báo cá nhân cho Admin — mọi Role đều xem được thông báo của chính mình (khác BR-03 của Audit Log). */
@RestController
@RequestMapping("/api/v1/admin/notifications")
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    public AdminNotificationController(AdminNotificationService adminNotificationService) {
        this.adminNotificationService = adminNotificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminNotificationListResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách thông báo thành công",
                adminNotificationService.list(page, size, authentication)
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<AdminNotificationResponse>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Đánh dấu thông báo đã đọc thành công",
                adminNotificationService.markAsRead(id, authentication)
        ));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication authentication) {
        adminNotificationService.markAllAsRead(authentication);
        return ResponseEntity.ok(ApiResponse.success("Đánh dấu tất cả đã đọc thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(
            @PathVariable Long id,
            Authentication authentication) {
        adminNotificationService.delete(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Xóa thông báo thành công", null));
    }
}
