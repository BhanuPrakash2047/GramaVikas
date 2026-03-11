package com.learn.lld.gramvikash.notification.repository;

import com.learn.lld.gramvikash.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Notification> findByFarmerIdAndIsReadFalse(Long farmerId);
}
