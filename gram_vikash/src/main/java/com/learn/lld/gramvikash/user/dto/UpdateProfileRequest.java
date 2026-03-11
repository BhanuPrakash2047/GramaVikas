package com.learn.lld.gramvikash.user.dto;

import com.learn.lld.gramvikash.user.enums.Language;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private LocalDate dob;
    private Language language;
    private Long stateId;
    private Long districtId;
    private Long mandalId;
    private Double latitude;
    private Double longitude;
}
