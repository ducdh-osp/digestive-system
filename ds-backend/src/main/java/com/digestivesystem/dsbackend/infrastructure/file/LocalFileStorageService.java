package com.digestivesystem.dsbackend.infrastructure.file;

import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Lưu file avatar trên đĩa cục bộ của server (thư mục uploads/avatars), phục vụ qua
 * WebConfig.addResourceHandlers ánh xạ /uploads/**. Sau này nếu chuyển sang S3/cloud storage
 * chỉ cần thay class này, phần còn lại (ProfileService, Controller) không cần đổi.
 */
@Service
public class LocalFileStorageService {

    private static final String UPLOAD_DIR = "uploads/avatars";
    private static final long MAX_FILE_SIZE = 2L * 1024 * 1024; // 2MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    public String storeAvatar(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Vui lòng chọn file ảnh");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Kích thước ảnh tối đa 2MB");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WEBP");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/avatars/" + filename;
        } catch (IOException e) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh, vui lòng thử lại");
        }
    }

    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return;
        }
        try {
            String filename = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
            Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(filename));
        } catch (IOException e) {
            // Xoá ảnh cũ thất bại không nên chặn luồng cập nhật ảnh mới.
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
}
