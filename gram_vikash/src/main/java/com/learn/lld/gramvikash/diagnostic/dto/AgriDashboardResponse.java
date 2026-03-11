package com.learn.lld.gramvikash.diagnostic.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Complete personalized dashboard response for a farmer.
 * Combines district overview + weather + mandal soil profile + crop recommendations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgriDashboardResponse {

    // ── district overview ───────────────────────────────────────────────
    private DistrictOverview districtOverview;

    // ── weather & climate ───────────────────────────────────────────────
    private WeatherClimate weatherClimate;

    // ── mandal-specific profile ─────────────────────────────────────────
    private MandalProfile mandalProfile;

    // ── personalized recommendations ────────────────────────────────────
    private CropRecommendations cropRecommendations;

    // ── soil warnings (not alerts, just informational) ──────────────────
    private List<String> soilWarnings;

    // ── fertilizer recommendations for the mandal ───────────────────────
    private Map<String, Object> fertilizerRecommendations;

    // ====================================================================
    //  INNER DTOs
    // ====================================================================

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DistrictOverview {
        private String district;
        private String state;
        private String agroClimaticZone;
        private Integer totalMandals;
        private Double cultivableLandHa;
        private Double cultivableLandPct;
        private List<String> majorRivers;
        private List<String> irrigationProjects;
        private Double ruralPopulationPct;
        private Double agriculturalWorkersPct;
        private List<String> commonDeficiencies;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class WeatherClimate {
        private String climateClassification;
        private Double meanTempCelsius;
        private Double summerMaxCelsius;
        private Double winterMinCelsius;
        private Double annualRainfallMm;
        private Double rainyDaysAnnually;
        private Map<String, SeasonInfo> seasons;
        private CycloneRisk cycloneRisk;
        private List<DiseaseRisk> diseaseRisks;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SeasonInfo {
        private String period;
        private String rainfallMm;
        private String temperatureRange;
        private String humidityPct;
        private List<String> mainCrops;
        private List<String> riskFactors;
        private String note;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CycloneRisk {
        private String riskLevel;
        private String peakSeason;
        private Integer coastlineKm;
        private String note;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DiseaseRisk {
        private String disease;
        private String trigger;
        private List<String> peakMonths;
        private List<String> highRiskMandals;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MandalProfile {
        private String mandal;
        private String district;
        private String geography;
        private String soilType;
        private String phRange;
        private String organicMatter;
        private Map<String, NutrientInfo> nutrientStatus;
        private List<String> majorCrops;
        private String irrigationSource;
        private String irrigationType;
        private Map<String, CropCalendarEntry> cropCalendar;
        private List<String> commonIssues;
        private String specialFeatures;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NutrientInfo {
        private String status;
        private String recommendation;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CropCalendarEntry {
        private String sowing;
        private String harvest;
        private String mainCrop;
        private String note;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CropRecommendations {
        private String soilType;
        private List<String> bestCrops;
        private String note;
    }
}
