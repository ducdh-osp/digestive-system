package com.digestivesystem.dsbackend.infrastructure.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;

/**
 * F.1.2 — Đa ngôn ngữ cho thông báo lỗi hệ thống (Việt/Anh), đọc header Accept-Language do FE gửi lên.
 * Áp dụng cho mọi message trả về từ GlobalExceptionHandler, kể cả BusinessException do các Service
 * ném (đã refactor sang mã lỗi — xem package `application.exceptions.codes`).
 */
@Configuration
public class LocaleConfig {

    /**
     * Mỗi domain (common, auth, adminAuth, profile, notification, auditLog, fileStorage...) giữ
     * file properties riêng trong `src/main/resources/i18n/` — dễ tìm/sửa hơn 1 file dùng chung
     * cho toàn bộ hệ thống — rồi khai báo hết basename ở đây để MessageSource tra cứu gộp qua cả
     * danh sách. Thêm domain mới chỉ cần thêm 1 dòng vào đây + 2 file `<domain>_vi/en.properties`.
     */
    private static final String[] MESSAGE_BASENAMES = {
        "i18n/common",
        "i18n/auth",
        "i18n/adminAuth",
        "i18n/profile",
        "i18n/notification",
        "i18n/auditLog",
        "i18n/fileStorage",
    };

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(List.of(Locale.forLanguageTag("vi"), Locale.forLanguageTag("en")));
        resolver.setDefaultLocale(Locale.forLanguageTag("vi"));
        return resolver;
    }

    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames(MESSAGE_BASENAMES);
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setDefaultLocale(Locale.forLanguageTag("vi"));
        messageSource.setUseCodeAsDefaultMessage(true);
        return messageSource;
    }
}
