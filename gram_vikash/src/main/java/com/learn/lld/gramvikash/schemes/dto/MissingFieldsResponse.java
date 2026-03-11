package com.learn.lld.gramvikash.schemes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingFieldsResponse {

    private Long schemeId;
    private String schemeName;
    private String schemeCode;
    private boolean profileComplete;
    private List<MissingField> missingFields;

    /**
     * Each missing field represents a question the frontend should ask the user.
     * It carries the full rule metadata so the frontend can build appropriate
     * input controls (number picker, dropdown, yes/no toggle, etc.).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MissingField {
        private String fieldName;       // e.g. "landSize", "income", "isBPL"
        private String fieldType;       // NUMBER, STRING, BOOLEAN
        private String operator;        // >=, <=, =, IN, etc.
        private String expectedValue;   // the rule's value for context (e.g. "2", "Paddy,Wheat")
        private String groupName;       // which eligibility group this belongs to
        private String question;        // human-readable question text
    }
}
