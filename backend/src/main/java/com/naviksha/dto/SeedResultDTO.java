package com.naviksha.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class SeedResultDTO {
    private int careersImported;
    private int testsImported;
    private int usersCreated;
    private String message;
}