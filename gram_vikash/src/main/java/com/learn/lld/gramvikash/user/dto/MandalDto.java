package com.learn.lld.gramvikash.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MandalDto {
    private Long id;
    private String name;
    private Long districtId;
}
