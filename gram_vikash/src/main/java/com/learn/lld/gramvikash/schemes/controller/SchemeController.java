package com.learn.lld.gramvikash.schemes.controller;

import com.learn.lld.gramvikash.common.exception.ApiResponse;
import com.learn.lld.gramvikash.schemes.dto.*;
import com.learn.lld.gramvikash.schemes.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
public class SchemeController {

    @Autowired
    private SchemeService schemeService;

    // ======================== 1. CREATE SCHEME (Admin) ========================

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> createScheme(@RequestBody CreateSchemeRequest request) {
        try {
            SchemeDetailResponse response = schemeService.createScheme(request);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.CREATED.value(), "Scheme created successfully", response),
                    HttpStatus.CREATED
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST.value(), "Scheme creation failed", e.getMessage()),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    // ======================== 2. BROWSE SCHEMES (Public) ========================

    @GetMapping("/browse")
    public ResponseEntity<ApiResponse> browseSchemes(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "EN") String language) {
        try {
            List<SchemeCardResponse> schemes = schemeService.browseSchemes(state, category, language);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.OK.value(), "Schemes retrieved successfully", schemes),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error retrieving schemes", e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ======================== 3. SCHEME DETAIL + FAQ (Public) ========================

    @GetMapping("/{schemeId}")
    public ResponseEntity<ApiResponse> getSchemeDetail(
            @PathVariable Long schemeId,
            @RequestParam(required = false, defaultValue = "EN") String language) {
        try {
            SchemeDetailResponse response = schemeService.getSchemeDetail(schemeId, language);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.OK.value(), "Scheme detail retrieved successfully", response),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND.value(), "Scheme not found", e.getMessage()),
                    HttpStatus.NOT_FOUND
            );
        }
    }

    // ======================== 4. SAVE USER KNOWN FIELDS ========================

    @PostMapping("/user-fields")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> saveUserKnownFields(@RequestBody UserFieldRequest request) {
        try {
            String result = schemeService.saveUserKnownFields(request);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.OK.value(), "User fields saved successfully", result),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST.value(), "Failed to save user fields", e.getMessage()),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    // ======================== 5. CHECK ELIGIBILITY ========================

    @PostMapping("/check-eligibility")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> checkEligibility(@RequestBody EligibilityCheckRequest request) {
        try {
            EligibilityResultResponse response = schemeService.checkEligibility(request);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.OK.value(), "Eligibility check completed", response),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST.value(), "Eligibility check failed", e.getMessage()),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    // ======================== 6. GET MISSING FIELDS FOR A SCHEME ========================

    /**
     * Returns all scheme eligibility rules whose required field is missing
     * from the farmer's profile. The frontend uses this to ask targeted
     * questions before running the actual eligibility check.
     *
     * GET /api/schemes/{schemeId}/missing-fields?farmerId=3
     */
    @GetMapping("/{schemeId}/missing-fields")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getMissingFields(
            @PathVariable Long schemeId,
            @RequestParam Long farmerId) {
        try {
            MissingFieldsResponse response = schemeService.getMissingFields(schemeId, farmerId);
            String message = response.isProfileComplete()
                    ? "Profile is complete for this scheme"
                    : response.getMissingFields().size() + " field(s) missing – please answer the questions";
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.OK.value(), message, response),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST.value(), "Failed to check missing fields", e.getMessage()),
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}
