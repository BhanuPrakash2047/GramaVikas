package com.learn.lld.gramvikash.notification.controller;

import com.learn.lld.gramvikash.common.exception.ApiResponse;
import com.learn.lld.gramvikash.notification.entity.Notification;
import com.learn.lld.gramvikash.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for a farmer.
     */
    @GetMapping("/{farmerId}")
    public ResponseEntity<ApiResponse> getNotifications(@PathVariable Long farmerId) {
        List<Notification> notifications = notificationService.getNotifications(farmerId);
        return ResponseEntity.ok(new ApiResponse(200, "Notifications retrieved", notifications));
    }

    /**
     * Get unread notifications for a farmer.
     */
    @GetMapping("/{farmerId}/unread")
    public ResponseEntity<ApiResponse> getUnreadNotifications(@PathVariable Long farmerId) {
        List<Notification> notifications = notificationService.getUnreadNotifications(farmerId);
        return ResponseEntity.ok(new ApiResponse(200, "Unread notifications retrieved", notifications));
    }

    /**
     * Mark a notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(new ApiResponse(200, "Notification marked as read", null));
    }
}
