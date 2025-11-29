package com.naviksha.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String email;
    private String phone;
    private String otp;
}
