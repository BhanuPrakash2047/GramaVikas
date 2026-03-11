package com.learn.lld.gramvikash.diagnostic.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learn.lld.gramvikash.diagnostic.dto.AgriDashboardResponse;
import com.learn.lld.gramvikash.diagnostic.dto.AgriDashboardResponse.*;
import com.learn.lld.gramvikash.user.entity.Farmer;
import com.learn.lld.gramvikash.user.repository.FarmerRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Loads srikakulam_soil_weather_rag.json at startup and serves
 * personalized dashboard data keyed by district / mandal.
 * <p>
 * No RAG, no LLM — pure structured data lookup.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgriDashboardService {

    private final FarmerRepository farmerRepository;
    private final ObjectMapper objectMapper;

    /** All chunks from the JSON file, keyed by chunk_id */
    private final Map<String, Map<String, Object>> chunkIndex = new LinkedHashMap<>();

    /** Quick lookup: mandal name (lower-case) → list of matching chunks */
    private final Map<String, List<Map<String, Object>>> mandalIndex = new LinkedHashMap<>();

    /** District-level chunks by document_type */
    private final Map<String, Map<String, Object>> districtChunks = new LinkedHashMap<>();

    // ====================================================================
    //  LOAD JSON AT STARTUP
    // ====================================================================

    @PostConstruct
    @SuppressWarnings("unchecked")
    public void loadData() {
        try {
            InputStream is = getClass().getClassLoader()
                    .getResourceAsStream("srikakulam_soil_weather_rag.json");
            if (is == null) {
                log.warn("srikakulam_soil_weather_rag.json not found on classpath — dashboard disabled");
                return;
            }
            List<Map<String, Object>> chunks = objectMapper.readValue(
                    is, new TypeReference<>() {}
            );

            for (Map<String, Object> chunk : chunks) {
                String chunkId = (String) chunk.get("chunk_id");
                String docType = (String) chunk.get("document_type");
                chunkIndex.put(chunkId, chunk);

                // index district-level chunks by doc type
                if (docType != null && !docType.contains("mandal")) {
                    districtChunks.put(docType, chunk);
                }

                // index mandal-level chunks
                indexMandals(chunk);
            }

            log.info("AgriDashboard: loaded {} chunks, {} mandal entries",
                    chunkIndex.size(), mandalIndex.size());
        } catch (Exception e) {
            log.error("Failed to load agri dashboard data: {}", e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private void indexMandals(Map<String, Object> chunk) {
        // single mandal field
        Object m = chunk.get("mandal");
        if (m instanceof String s && !s.isBlank()) {
            mandalIndex.computeIfAbsent(s.toLowerCase(), k -> new ArrayList<>()).add(chunk);
        }
        // array mandals field
        Object ms = chunk.get("mandals");
        if (ms instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof String s) {
                    mandalIndex.computeIfAbsent(s.toLowerCase(), k -> new ArrayList<>()).add(chunk);
                }
            }
        }
    }

    // ====================================================================
    //  PUBLIC API
    // ====================================================================

    /**
     * Build the full personalized dashboard for a farmer.
     */
    public AgriDashboardResponse getDashboard(Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found: " + farmerId));

        String mandalName = farmer.getMandal() != null ? farmer.getMandal().getName() : null;
        String districtName = farmer.getDistrict() != null ? farmer.getDistrict().getName() : null;

        return AgriDashboardResponse.builder()
                .districtOverview(buildDistrictOverview())
                .weatherClimate(buildWeatherClimate())
                .mandalProfile(buildMandalProfile(mandalName))
                .cropRecommendations(buildCropRecommendations(mandalName))
                .soilWarnings(buildSoilWarnings(mandalName))
                .fertilizerRecommendations(buildFertilizerRecs(mandalName))
                .build();
    }

    /**
     * Get dashboard by mandal & district names directly (no farmer lookup).
     */
    public AgriDashboardResponse getDashboardByLocation(String mandalName, String districtName) {
        return AgriDashboardResponse.builder()
                .districtOverview(buildDistrictOverview())
                .weatherClimate(buildWeatherClimate())
                .mandalProfile(buildMandalProfile(mandalName))
                .cropRecommendations(buildCropRecommendations(mandalName))
                .soilWarnings(buildSoilWarnings(mandalName))
                .fertilizerRecommendations(buildFertilizerRecs(mandalName))
                .build();
    }

    // ====================================================================
    //  DISTRICT OVERVIEW
    // ====================================================================

    @SuppressWarnings("unchecked")
    private DistrictOverview buildDistrictOverview() {
        Map<String, Object> c = districtChunks.get("district_profile");
        if (c == null) return null;

        Map<String, Object> soil = districtChunks.get("soil_profile");
        List<String> deficiencies = soil != null
                ? getList(soil, "common_deficiencies_across_district")
                : List.of();

        return DistrictOverview.builder()
                .district(str(c, "district"))
                .state(str(c, "state"))
                .agroClimaticZone(str(c, "agro_climatic_zone"))
                .totalMandals(intVal(c, "total_mandals"))
                .cultivableLandHa(dbl(c, "cultivable_land_ha"))
                .cultivableLandPct(dbl(c, "cultivable_land_pct"))
                .majorRivers(getList(c, "major_rivers"))
                .irrigationProjects(getList(c, "irrigation_projects"))
                .ruralPopulationPct(dbl(c, "population_rural_pct"))
                .agriculturalWorkersPct(dbl(c, "agricultural_workers_pct"))
                .commonDeficiencies(deficiencies)
                .build();
    }

    // ====================================================================
    //  WEATHER & CLIMATE
    // ====================================================================

    @SuppressWarnings("unchecked")
    private WeatherClimate buildWeatherClimate() {
        Map<String, Object> c = districtChunks.get("climate_weather_profile");
        if (c == null) return null;

        Map<String, Object> tempMap = (Map<String, Object>) c.get("annual_temperature");
        Map<String, Object> rainMap = (Map<String, Object>) c.get("rainfall");
        Map<String, Object> seasonsMap = (Map<String, Object>) c.get("seasons");
        Map<String, Object> cycloneMap = (Map<String, Object>) c.get("cyclone_risk");
        Map<String, Object> diseaseMap = (Map<String, Object>) c.get("disease_risk_by_weather");

        // seasons
        Map<String, SeasonInfo> seasons = new LinkedHashMap<>();
        if (seasonsMap != null) {
            for (var entry : seasonsMap.entrySet()) {
                if (entry.getValue() instanceof Map<?, ?> sMap) {
                    Map<String, Object> s = (Map<String, Object>) sMap;
                    seasons.put(entry.getKey(), SeasonInfo.builder()
                            .period(str(s, "period"))
                            .rainfallMm(str(s, "rainfall_mm"))
                            .temperatureRange(str(s, "temperature_range_celsius") != null
                                    ? str(s, "temperature_range_celsius")
                                    : str(s, "temperature_celsius"))
                            .humidityPct(str(s, "humidity_pct"))
                            .mainCrops(getList(s, "main_crops"))
                            .riskFactors(getList(s, "risk_factors"))
                            .note(str(s, "note"))
                            .build());
                }
            }
        }

        // cyclone
        CycloneRisk cyclone = null;
        if (cycloneMap != null) {
            cyclone = CycloneRisk.builder()
                    .riskLevel(str(cycloneMap, "risk_level"))
                    .peakSeason(str(cycloneMap, "peak_season"))
                    .coastlineKm(intVal(cycloneMap, "coastline_km"))
                    .note(str(cycloneMap, "note"))
                    .build();
        }

        // disease risks
        List<DiseaseRisk> diseaseRisks = new ArrayList<>();
        if (diseaseMap != null) {
            for (var entry : diseaseMap.entrySet()) {
                if (entry.getValue() instanceof Map<?, ?> dMap) {
                    Map<String, Object> d = (Map<String, Object>) dMap;
                    diseaseRisks.add(DiseaseRisk.builder()
                            .disease(entry.getKey().replace("_", " "))
                            .trigger(str(d, "trigger"))
                            .peakMonths(getList(d, "peak_months"))
                            .highRiskMandals(getList(d, "high_risk_mandals"))
                            .build());
                }
            }
        }

        return WeatherClimate.builder()
                .climateClassification(str(c, "climate_classification"))
                .meanTempCelsius(tempMap != null ? dbl(tempMap, "mean_celsius") : null)
                .summerMaxCelsius(tempMap != null ? dbl(tempMap, "summer_max_celsius") : null)
                .winterMinCelsius(tempMap != null ? dbl(tempMap, "winter_min_celsius") : null)
                .annualRainfallMm(rainMap != null ? dbl(rainMap, "annual_normal_mm") : null)
                .rainyDaysAnnually(rainMap != null ? dbl(rainMap, "rainy_days_annually") : null)
                .seasons(seasons)
                .cycloneRisk(cyclone)
                .diseaseRisks(diseaseRisks)
                .build();
    }

    // ====================================================================
    //  MANDAL PROFILE
    // ====================================================================

    @SuppressWarnings("unchecked")
    private MandalProfile buildMandalProfile(String mandalName) {
        if (mandalName == null) return null;

        // find mandal-specific chunk
        List<Map<String, Object>> chunks = mandalIndex.get(mandalName.toLowerCase());
        Map<String, Object> c = null;
        if (chunks != null) {
            c = chunks.stream()
                    .filter(ch -> "mandal_soil_profile".equals(ch.get("document_type")))
                    .findFirst().orElse(chunks.get(0));
        }

        // fallback: try matching from district soil_profile's soil_distribution
        if (c == null) {
            return buildMandalProfileFromDistrictSoil(mandalName);
        }

        // nutrient status
        Map<String, NutrientInfo> nutrients = new LinkedHashMap<>();
        Object ns = c.get("nutrient_status");
        if (ns instanceof Map<?, ?> nsMap) {
            for (var entry : ((Map<String, Object>) nsMap).entrySet()) {
                if (entry.getValue() instanceof Map<?, ?> nMap) {
                    Map<String, Object> n = (Map<String, Object>) nMap;
                    String rec = str(n, "recommendation_kg_ha");
                    if (rec == null) rec = str(n, "recommendation");
                    nutrients.put(entry.getKey(), NutrientInfo.builder()
                            .status(str(n, "status"))
                            .recommendation(rec)
                            .build());
                }
            }
        }

        // crop calendar
        Map<String, CropCalendarEntry> cropCal = new LinkedHashMap<>();
        Object cc = c.get("crop_calendar");
        if (cc instanceof Map<?, ?> ccMap) {
            for (var entry : ((Map<String, Object>) ccMap).entrySet()) {
                if (entry.getValue() instanceof Map<?, ?> cMap) {
                    Map<String, Object> cal = (Map<String, Object>) cMap;
                    cropCal.put(entry.getKey(), CropCalendarEntry.builder()
                            .sowing(str(cal, "sowing"))
                            .harvest(str(cal, "harvest"))
                            .mainCrop(str(cal, "main_crop") != null ? str(cal, "main_crop") : str(cal, "crop"))
                            .note(str(cal, "note"))
                            .build());
                }
            }
        }

        return MandalProfile.builder()
                .mandal(mandalName)
                .district(str(c, "district"))
                .geography(str(c, "geography"))
                .soilType(str(c, "soil_type"))
                .phRange(str(c, "pH"))
                .organicMatter(str(c, "organic_matter"))
                .nutrientStatus(nutrients)
                .majorCrops(getList(c, "major_crops"))
                .irrigationSource(str(c, "irrigation_source"))
                .irrigationType(str(c, "irrigation_type"))
                .cropCalendar(cropCal)
                .commonIssues(getList(c, "common_issues"))
                .specialFeatures(str(c, "special_features"))
                .build();
    }

    /**
     * If no dedicated mandal chunk exists, find the mandal in the district
     * soil_distribution and build a minimal profile from there.
     */
    @SuppressWarnings("unchecked")
    private MandalProfile buildMandalProfileFromDistrictSoil(String mandalName) {
        Map<String, Object> soilChunk = districtChunks.get("soil_profile");
        if (soilChunk == null) return null;

        Object sd = soilChunk.get("soil_distribution");
        if (!(sd instanceof Map<?, ?> sdMap)) return null;

        for (var entry : ((Map<String, Object>) sdMap).entrySet()) {
            Map<String, Object> soilInfo = (Map<String, Object>) entry.getValue();
            List<String> mandals = getList(soilInfo, "location_mandals");
            boolean found = mandals.stream()
                    .anyMatch(m -> m.equalsIgnoreCase(mandalName));
            if (found) {
                Map<String, Object> chars = (Map<String, Object>) soilInfo.get("characteristics");
                Map<String, NutrientInfo> nutrients = new LinkedHashMap<>();
                Object ns = soilInfo.get("nutrient_status");
                if (ns instanceof Map<?, ?> nsMap) {
                    for (var ne : ((Map<String, Object>) nsMap).entrySet()) {
                        nutrients.put(ne.getKey(), NutrientInfo.builder()
                                .status(ne.getValue().toString())
                                .build());
                    }
                }

                return MandalProfile.builder()
                        .mandal(mandalName)
                        .district(str(soilChunk, "district"))
                        .soilType(entry.getKey().replace("_", " "))
                        .phRange(chars != null ? str(chars, "pH_range") : null)
                        .organicMatter(chars != null ? str(chars, "organic_matter") : null)
                        .nutrientStatus(nutrients)
                        .majorCrops(getList(soilInfo, "suitable_crops"))
                        .commonIssues(List.of())
                        .build();
            }
        }
        return null;
    }

    // ====================================================================
    //  CROP RECOMMENDATIONS
    // ====================================================================

    @SuppressWarnings("unchecked")
    private CropRecommendations buildCropRecommendations(String mandalName) {
        if (mandalName == null) return null;

        // try mandal-specific first
        List<Map<String, Object>> chunks = mandalIndex.get(mandalName.toLowerCase());
        if (chunks != null) {
            Map<String, Object> c = chunks.stream()
                    .filter(ch -> "mandal_soil_profile".equals(ch.get("document_type")))
                    .findFirst().orElse(chunks.get(0));
            return CropRecommendations.builder()
                    .soilType(str(c, "soil_type"))
                    .bestCrops(getList(c, "major_crops"))
                    .note("Based on " + mandalName + " mandal soil profile and local conditions")
                    .build();
        }

        // fallback: find from district soil distribution
        Map<String, Object> soilChunk = districtChunks.get("soil_profile");
        if (soilChunk == null) return null;

        Object sd = soilChunk.get("soil_distribution");
        if (sd instanceof Map<?, ?> sdMap) {
            for (var entry : ((Map<String, Object>) sdMap).entrySet()) {
                Map<String, Object> soilInfo = (Map<String, Object>) entry.getValue();
                List<String> mandals = getList(soilInfo, "location_mandals");
                if (mandals.stream().anyMatch(m -> m.equalsIgnoreCase(mandalName))) {
                    return CropRecommendations.builder()
                            .soilType(entry.getKey().replace("_", " "))
                            .bestCrops(getList(soilInfo, "suitable_crops"))
                            .note("Recommended crops for " + entry.getKey().replace("_", " ")
                                    + " soil in " + mandalName)
                            .build();
                }
            }
        }
        return null;
    }

    // ====================================================================
    //  SOIL WARNINGS (informational, not critical alerts)
    // ====================================================================

    @SuppressWarnings("unchecked")
    private List<String> buildSoilWarnings(String mandalName) {
        List<String> warnings = new ArrayList<>();
        if (mandalName == null) return warnings;

        // from mandal chunk
        List<Map<String, Object>> chunks = mandalIndex.get(mandalName.toLowerCase());
        if (chunks != null) {
            for (Map<String, Object> c : chunks) {
                List<String> issues = getList(c, "common_issues");
                warnings.addAll(issues);

                // additional warnings from nutrient status
                Object ns = c.get("nutrient_status");
                if (ns instanceof Map<?, ?> nsMap) {
                    for (var entry : ((Map<String, Object>) nsMap).entrySet()) {
                        if (entry.getValue() instanceof Map<?, ?> nMap) {
                            Map<String, Object> n = (Map<String, Object>) nMap;
                            String status = str(n, "status");
                            if (status != null && (status.toLowerCase().contains("deficient")
                                    || status.toLowerCase().contains("very low"))) {
                                warnings.add(capitalize(entry.getKey()) + ": " + status);
                            }
                        }
                    }
                }
            }
        }

        // district-level common deficiencies
        Map<String, Object> soilChunk = districtChunks.get("soil_profile");
        if (soilChunk != null) {
            List<String> districtDef = getList(soilChunk, "common_deficiencies_across_district");
            warnings.addAll(districtDef);
        }

        // deduplicate
        return warnings.stream().distinct().collect(Collectors.toList());
    }

    // ====================================================================
    //  FERTILIZER RECOMMENDATIONS
    // ====================================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildFertilizerRecs(String mandalName) {
        Map<String, Object> fertChunk = districtChunks.get("fertilizer_nutrient_recommendations");
        if (fertChunk == null) return Map.of();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("avg_fertilizer_use_kg_ha", fertChunk.get("fertilizer_use_avg_kg_ha"));
        result.put("note", fertChunk.get("note"));

        // try to get crop-wise recs
        Object cwr = fertChunk.get("crop_wise_recommendations");
        if (cwr instanceof Map<?, ?> cwrMap) {
            // filter to crops relevant to this mandal
            List<String> mandalCrops = List.of();
            if (mandalName != null) {
                MandalProfile mp = buildMandalProfile(mandalName);
                if (mp != null && mp.getMajorCrops() != null) {
                    mandalCrops = mp.getMajorCrops();
                }
            }

            Map<String, Object> relevantRecs = new LinkedHashMap<>();
            for (var entry : ((Map<String, Object>) cwrMap).entrySet()) {
                String cropKey = entry.getKey().toLowerCase();
                boolean relevant = mandalCrops.isEmpty();  // if no mandal crops, show all
                for (String mc : mandalCrops) {
                    if (cropKey.contains(mc.toLowerCase()) || mc.toLowerCase().contains(cropKey.split("_")[0])) {
                        relevant = true;
                        break;
                    }
                }
                // also include if mandal name is in the crop key (e.g., "coconut_kaviti_sompeta")
                if (mandalName != null && cropKey.contains(mandalName.toLowerCase())) {
                    relevant = true;
                }
                if (relevant) {
                    relevantRecs.put(entry.getKey(), entry.getValue());
                }
            }
            result.put("crop_wise", relevantRecs);
        }

        return result;
    }

    // ====================================================================
    //  UTILS
    // ====================================================================

    private String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }

    private Double dbl(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof Number n ? n.doubleValue() : null;
    }

    private Integer intVal(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof Number n ? n.intValue() : null;
    }

    @SuppressWarnings("unchecked")
    private List<String> getList(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v instanceof List<?> list) {
            return list.stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
