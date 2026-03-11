package com.learn.lld.gramvikash.diagnostic.controller;

import com.learn.lld.gramvikash.common.exception.ApiResponse;
import com.learn.lld.gramvikash.diagnostic.dto.AgriDashboardResponse;
import com.learn.lld.gramvikash.diagnostic.service.AgriDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Personalized Agri Dashboard Controller.
 *
 * <pre>
 *   GET /api/diagnostic/dashboard/{farmerId}
 *       → Full personalized dashboard (district + weather + mandal soil + crop recs + warnings)
 *
 *   GET /api/diagnostic/dashboard/location?mandal=Etcherla&district=Srikakulam
 *       → Dashboard by location (no farmer login required)
 * </pre>
 */
@RestController
@RequestMapping("/api/diagnostic/dashboard")
@RequiredArgsConstructor
public class AgriDashboardController {

    private final AgriDashboardService dashboardService;

    /**
     * Personalized dashboard for a logged-in farmer.
     * Uses farmer's mandal & district to fetch all relevant data.
     */
    @GetMapping("/{farmerId}")
    public ResponseEntity<ApiResponse> getFarmerDashboard(@PathVariable Long farmerId) {
        AgriDashboardResponse dashboard = dashboardService.getDashboard(farmerId);
        return ResponseEntity.ok(new ApiResponse(200, "Dashboard loaded", dashboard));
    }

    /**
     * Dashboard by mandal & district name (public, no farmer required).
     * Useful for guest users or demo purposes.
     */
    @GetMapping("/location")
    public ResponseEntity<ApiResponse> getDashboardByLocation(
            @RequestParam("mandal") String mandal,
            @RequestParam(value = "district", defaultValue = "Srikakulam") String district
    ) {
        AgriDashboardResponse dashboard = dashboardService.getDashboardByLocation(mandal, district);
        return ResponseEntity.ok(new ApiResponse(200, "Dashboard loaded", dashboard));
    }
}
