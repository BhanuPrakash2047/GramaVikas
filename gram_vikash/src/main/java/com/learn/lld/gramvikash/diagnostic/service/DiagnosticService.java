package com.learn.lld.gramvikash.diagnostic.service;

import com.learn.lld.gramvikash.diagnostic.dto.DiagnosticRequest;
import com.learn.lld.gramvikash.diagnostic.dto.DiagnosticResponse;
import com.learn.lld.gramvikash.diagnostic.entity.DiagnosticSession;
import com.learn.lld.gramvikash.diagnostic.repository.DiagnosticSessionRepository;
import com.learn.lld.gramvikash.notification.service.NotificationService;
import com.learn.lld.gramvikash.user.entity.Farmer;
import com.learn.lld.gramvikash.user.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiagnosticService {

    private final DiagnosticSessionRepository sessionRepository;
    private final FarmerRepository farmerRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    @Value("${python.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    // ── web diagnosis ───────────────────────────────────────────────────

    /**
     * Full web pipeline: text + optional image → Python service → persist → notify → respond.
     */
    public DiagnosticResponse diagnoseWeb(DiagnosticRequest request, MultipartFile image) {

        log.info("Web diagnosis request – farmerID={}", request.getFarmerId());

        // resolve farmer & defaults
        Farmer farmer = null;
        String region = request.getRegion();
        String language = request.getLanguage() != null ? request.getLanguage() : "en";

        if (request.getFarmerId() != null) {
            farmer = farmerRepository.findById(request.getFarmerId()).orElse(null);
            if (farmer != null) {
                if (region == null && farmer.getState() != null) {
                    region = farmer.getState().getName();
                }
                if (farmer.getLanguage() != null) {
                    language = mapLanguage(farmer.getLanguage().name());
                }
            }
        }

        // call Python service
        Map<String, Object> py = callPythonDiagnose(request.getUserQuery(), language, region, image);

        // persist session
        DiagnosticSession session = DiagnosticSession.builder()
                .farmer(farmer)
                .userQuery(request.getUserQuery())
                .classifiedCrop(str(py, "classified_crop"))
                .classifiedDisease(str(py, "classified_disease"))
                .classificationConfidence(dbl(py, "confidence"))
                .diagnosisResponse(str(py, "diagnosis"))
                .source(str(py, "source"))
                .sourceType("WEB")
                .language(language)
                .region(region)
                .regionSpecific(bool(py, "region_specific"))
                .build();

        session = sessionRepository.save(session);

        // notify other farmers in the same mandal
        if (farmer != null && farmer.getMandal() != null) {
            try {
                notificationService.notifyMandalFarmersAboutDiagnosis(
                        farmer,
                        session.getClassifiedDisease(),
                        session.getClassifiedCrop(),
                        session.getClassificationConfidence(),
                        region,
                        language
                );
            } catch (Exception e) {
                log.error("Error notifying farmers in mandal: {}", e.getMessage());
                // Don't fail the diagnosis on notification error
            }
        }

        // build concise response
        Map<String, Object> managementAdvice = map(py, "management_advice");
        Map<String, Object> conciseAdvice = optimizeManagementAdvice(managementAdvice);

        return DiagnosticResponse.builder()
                .sessionId(session.getId())
                .classifiedDisease(session.getClassifiedDisease())
                .classifiedCrop(session.getClassifiedCrop())
                .confidence(session.getClassificationConfidence())
                .diagnosis(session.getDiagnosisResponse())
                .symptomsMatched(list(py, "symptoms_matched"))
                .managementAdvice(conciseAdvice)
                .regionSpecific(session.getRegionSpecific())
                .source(session.getSource())
                .language(session.getLanguage())
                .build();
    }

    // ── history ─────────────────────────────────────────────────────────

    public List<DiagnosticSession> getHistory(Long farmerId) {
        return sessionRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    // ── Python client ───────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> callPythonDiagnose(
            String query, String language, String region, MultipartFile image
    ) {
        String url = pythonServiceUrl + "/api/v1/diagnose";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("user_query", query);
        body.add("language", language);
        if (region != null) body.add("region", region);

        if (image != null && !image.isEmpty()) {
            try {
                ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
                    @Override
                    public String getFilename() {
                        return image.getOriginalFilename();
                    }
                };
                body.add("image", resource);
            } catch (Exception e) {
                log.error("Failed to read image: {}", e.getMessage());
            }
        }

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class
            );
            return response.getBody() != null ? response.getBody() : fallback();
        } catch (Exception e) {
            log.error("Python service call failed: {}", e.getMessage());
            return fallback();
        }
    }

    // ── helpers ─────────────────────────────────────────────────────────

    private String mapLanguage(String enumName) {
        return switch (enumName.toUpperCase()) {
            case "HINDI" -> "hi";
            case "TELUGU" -> "te";
            default -> "en";
        };
    }

    private Map<String, Object> fallback() {
        Map<String, Object> m = new HashMap<>();
        m.put("diagnosis", "Service temporarily unavailable. Please try again later.");
        m.put("source", "error");
        m.put("classified_crop", null);
        m.put("classified_disease", null);
        m.put("confidence", 0.0);
        m.put("region_specific", false);
        m.put("symptoms_matched", List.of());
        m.put("management_advice", Map.of());
        return m;
    }

    /**
     * Optimize management advice: keep only top 2-3 recommendations per category for conciseness.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> optimizeManagementAdvice(Map<String, Object> advice) {
        Map<String, Object> optimized = new HashMap<>();

        for (Map.Entry<String, Object> entry : advice.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof List) {
                List<?> list = (List<?>) value;
                // Keep max 2-3 items per category
                int limit = "cultural".equalsIgnoreCase(key) ? 2 : 2;
                optimized.put(key, list.stream().limit(limit).toList());
            } else {
                optimized.put(key, value);
            }
        }

        return optimized;
    }

    private String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }

    private Double dbl(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof Number ? ((Number) v).doubleValue() : null;
    }

    private Boolean bool(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof Boolean ? (Boolean) v : false;
    }

    @SuppressWarnings("unchecked")
    private List<String> list(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof List ? (List<String>) v : List.of();
    }

    

    @SuppressWarnings("unchecked")
    private Map<String, Object> map(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof Map ? (Map<String, Object>) v : Map.of();
    }
}
