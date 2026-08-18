package com.digestivesystem.dsbackend.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationListResponse {
    private List<NotificationResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private long unreadCount;

    public static NotificationListResponse of(List<NotificationResponse> content, int page, int size,
                                                long totalElements, long unreadCount) {
        int totalPages = (int) Math.ceil(totalElements / (double) size);
        return new NotificationListResponse(content, page, size, totalElements, totalPages, unreadCount);
    }
}
