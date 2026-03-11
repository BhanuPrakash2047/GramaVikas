package com.learn.lld.gramvikash.notification.service;

import com.learn.lld.gramvikash.notification.entity.Notification;
import com.learn.lld.gramvikash.notification.repository.NotificationRepository;
import com.learn.lld.gramvikash.schemes.entity.Scheme;
import com.learn.lld.gramvikash.user.entity.Farmer;
import com.learn.lld.gramvikash.user.entity.Mandal;
import com.learn.lld.gramvikash.user.entity.State;
import com.learn.lld.gramvikash.user.repository.FarmerRepository;
import com.learn.lld.gramvikash.user.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FarmerRepository farmerRepository;
    private final SmsService smsService;
    private final StateRepository stateRepository;

    /**
     * Notify all farmers in the same mandal about a new disease diagnosis.
     */
    public void notifyMandalFarmersAboutDiagnosis(
            Farmer diagnosedFarmer,
            String classifiedDisease,
            String classifiedCrop,
            Double confidence,
            String region,
            String language
    ) {
        if (diagnosedFarmer == null || diagnosedFarmer.getMandal() == null) {
            log.warn("Cannot notify: farmer or mandal is null");
            return;
        }

        Mandal mandal = diagnosedFarmer.getMandal();
        String farmersName = diagnosedFarmer.getFullName() != null ?
                diagnosedFarmer.getFullName() : "A farmer";

        try {
            // Find all other active farmers in the same mandal
            List<Farmer> farmersInMandal = farmerRepository.findByMandal(mandal);

            for (Farmer farmer : farmersInMandal) {
                // Don't send to the farmer who had the diagnosis
                if (farmer.getId().equals(diagnosedFarmer.getId())) {
                    continue;
                }

                // Use the recipient farmer's language or the diagnosis language
                String notificationLanguage = farmer.getLanguage() != null ?
                        farmer.getLanguage().name() : language;

                // Build notification message
                String title = buildTitle(classifiedDisease, notificationLanguage);
                String message = buildMessage(
                        farmersName,
                        classifiedCrop,
                        classifiedDisease,
                        confidence,
                        notificationLanguage
                );
                String details = buildDetails(classifiedCrop, classifiedDisease, region, confidence);

                // Create and save notification
                Notification notification = Notification.builder()
                        .farmer(farmer)
                        .notificationType("DIAGNOSIS_ALERT")
                        .title(title)
                        .message(message)
                        .details(details)
                        .language(notificationLanguage)
                        .isRead(false)
                        .build();

                notificationRepository.save(notification);
                log.info("Notification sent to farmer {} in mandal {}", farmer.getId(), mandal.getId());

                // Send concise SMS to the farmer's mobile number (Twilio 160 char limit)
                String smsText = buildSmsText(classifiedCrop, classifiedDisease, confidence, notificationLanguage);
                smsService.sendSms(farmer.getPhoneNumber(), smsText);
                log.info("SMS queued for farmer {} (phone: {})", farmer.getId(), farmer.getPhoneNumber());
            }
        } catch (Exception e) {
            log.error("Error notifying farmers in mandal {}: {}", mandal.getId(), e.getMessage());
        }
    }

    /**
     * Get all notifications for a farmer.
     */
    public List<Notification> getNotifications(Long farmerId) {
        return notificationRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    /**
     * Get unread notifications for a farmer.
     */
    public List<Notification> getUnreadNotifications(Long farmerId) {
        return notificationRepository.findByFarmerIdAndIsReadFalse(farmerId);
    }

    /**
     * Mark a notification as read.
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    // ── Helper methods ───────────────────────────────────────────────────

    /**
     * Notify farmers about a new POST_DISASTER scheme.
     * If the scheme's state is null (Central), notify ALL active farmers.
     * If the scheme has a state, notify only farmers in that state.
     */
    public void notifyFarmersAboutPostDisasterScheme(Scheme scheme) {
        try {
            List<Farmer> targetFarmers;

            if (scheme.getState() == null || scheme.getState().isBlank()) {
                // Central scheme → notify all active farmers
                targetFarmers = farmerRepository.findByIsActiveTrue();
                log.info("POST_DISASTER central scheme '{}' — notifying ALL {} active farmers",
                        scheme.getSchemeName(), targetFarmers.size());
            } else {
                // State-specific scheme → find the State entity, then notify farmers in that state
                State state = stateRepository.findByName(scheme.getState()).orElse(null);
                if (state == null) {
                    log.warn("State '{}' not found — cannot notify farmers for scheme '{}'",
                            scheme.getState(), scheme.getSchemeName());
                    return;
                }
                targetFarmers = farmerRepository.findByStateAndIsActiveTrue(state);
                log.info("POST_DISASTER scheme '{}' for state '{}' — notifying {} farmers",
                        scheme.getSchemeName(), scheme.getState(), targetFarmers.size());
            }

            for (Farmer farmer : targetFarmers) {
                String lang = farmer.getLanguage() != null ? farmer.getLanguage().name() : "ENGLISH";
                String title = buildSchemeTitle(scheme.getSchemeName(), lang);
                String message = buildSchemeMessage(scheme.getSchemeName(), scheme.getDescription(), lang);
                String smsText = buildSchemeSmsText(scheme.getSchemeName(), lang);

                Notification notification = Notification.builder()
                        .farmer(farmer)
                        .notificationType("POST_DISASTER_SCHEME")
                        .title(title)
                        .message(message)
                        .details(String.format("{\"schemeId\": %d, \"schemeCode\": \"%s\", \"category\": \"%s\"}",
                                scheme.getId(), scheme.getSchemeCode(), scheme.getCategory()))
                        .language(lang)
                        .isRead(false)
                        .build();

                notificationRepository.save(notification);

                if (farmer.getPhoneNumber() != null) {
                    smsService.sendSms(farmer.getPhoneNumber(), smsText);
                }
                log.debug("Scheme notification sent to farmer {}", farmer.getId());
            }

            log.info("Post-disaster scheme notification completed for scheme '{}'", scheme.getSchemeName());
        } catch (Exception e) {
            log.error("Error notifying farmers about post-disaster scheme '{}': {}",
                    scheme.getSchemeName(), e.getMessage());
        }
    }

    // ── Scheme notification helpers ──────────────────────────────────────

    private String buildSchemeTitle(String schemeName, String language) {
        return switch (language.toUpperCase()) {
            case "HI", "HINDI" -> String.format("नई आपदा राहत योजना: %s", schemeName);
            case "TE", "TELUGU" -> String.format("కొత్త విపత్తు సహాయ పథకం: %s", schemeName);
            default -> String.format("New Disaster Relief Scheme: %s", schemeName);
        };
    }

    private String buildSchemeMessage(String schemeName, String description, String language) {
        String desc = description != null && description.length() > 150
                ? description.substring(0, 150) + "..." : (description != null ? description : "");
        return switch (language.toUpperCase()) {
            case "HI", "HINDI" -> String.format(
                    "एक नई आपदा राहत योजना '%s' उपलब्ध है। %s। कृपया ऐप पर विवरण देखें और पात्रता जांचें।",
                    schemeName, desc);
            case "TE", "TELUGU" -> String.format(
                    "కొత్త విపత్తు సహాయ పథకం '%s' అందుబాటులో ఉంది. %s. దయచేసి యాప్‌లో వివరాలు చూడండి.",
                    schemeName, desc);
            default -> String.format(
                    "A new post-disaster relief scheme '%s' is now available. %s. Open the app to check details and eligibility.",
                    schemeName, desc);
        };
    }

    private String buildSchemeSmsText(String schemeName, String language) {
        return switch (language.toUpperCase()) {
            case "HI", "HINDI" -> String.format("GramVikash: नई आपदा राहत योजना '%s' उपलब्ध है। ऐप खोलें।", schemeName);
            case "TE", "TELUGU" -> String.format("GramVikash: కొత్త విపత్తు పథకం '%s' అందుబాటులో. యాప్ తెరవండి.", schemeName);
            default -> String.format("GramVikash: New disaster relief scheme '%s' available. Open app for details.", schemeName);
        };
    }

    private String buildTitle(String disease, String language) {
        return switch (language.toUpperCase()) {
            case "HI", "HINDI" -> String.format("नई बीमारी की सतर्कता: %s", disease);
            case "TE", "TELUGU" -> String.format("వ్యాధి హెచ్చరిక: %s", disease);
            default -> String.format("Disease Alert: %s", disease);
        };
    }

    private String buildMessage(
            String farmersName,
            String crop,
            String disease,
            Double confidence,
            String language
    ) {
        String confidenceStr = String.format("%.0f%%", confidence * 100);
        
        return switch (language.toUpperCase()) {
            case "HI", "HINDI" -> String.format(
                    "आपके क्षेत्र में %s को %s बीमारी (%.0f%% संभावना) की समस्या पाई गई है। " +
                    "यह आपकी फसल को भी प्रभावित कर सकती है। कृपया सावधान रहें।",
                    farmersName, disease, confidence * 100
            );
            case "TE", "TELUGU" -> String.format(
                    "మీ ప్రాంతంలో %s పంటకు %s వ్యాధి (%.0f%% సంభావ్యత) కనుగొనబడింది. " +
                    "ఇది మీ పంటకు కూడా ప్రభావం చేయవచ్చు. దయచేసి జాగ్రత్త వహించండి.",
                    farmersName, disease, confidence * 100
            );
            default -> String.format(
                    "A farmer in your area has been diagnosed with %s on %s (%.0f%% confidence). " +
                    "This disease may spread to your crops. Please be alert.",
                    disease, crop, confidence * 100
            );
        };
    }

    /**
     * Short SMS text — kept under 160 characters for a single Twilio SMS segment.
     */
    private String buildSmsText(String crop, String disease, Double confidence, String language) {
        String pct = String.format("%.0f%%", confidence * 100);
        return switch (language.toUpperCase()) {
            case "HI", "HINDI" -> String.format(
                    "GramVikash: %s में %s (%s) पाई गई। सावधान रहें।", crop, disease, pct);
            case "TE", "TELUGU" -> String.format(
                    "GramVikash: %sలో %s (%s) కనుగొనబడింది. జాగ్రత్త!", crop, disease, pct);
            default -> String.format(
                    "GramVikash Alert: %s on %s (%s). Check your crops.", disease, crop, pct);
        };
    }

    private String buildDetails(String crop, String disease, String region, Double confidence) {
        return String.format(
                "{\"crop\": \"%s\", \"disease\": \"%s\", \"region\": \"%s\", \"confidence\": %.2f}",
                crop, disease, region != null ? region : "Unknown", confidence
        );
    }
}
