package com.naviksha.controller;

import com.naviksha.dto.OtpRequest;
import com.naviksha.dto.OtpResponse;
import com.naviksha.dto.OtpVerifyRequest;
import com.naviksha.service.OtpService;
import com.naviksha.service.SmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "OTP", description = "OTP generation and verification endpoints")
public class OtpController {

    private final SmsService smsService;

    @PostMapping("/send")
    @Operation(summary = "Send OTP to user phone (SMS)")
    public ResponseEntity<OtpResponse> sendOtp(@RequestBody OtpRequest request) {
        if (request == null || request.getPhone() == null || request.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body(new OtpResponse(false, "Phone is required"));
        }
        try {
            // SmsService will use Twilio Verify when configured, otherwise fallback to local OTP generation
            smsService.sendVerificationCode(request.getPhone());
            return ResponseEntity.ok(new OtpResponse(true, "OTP sent"));
        } catch (Exception e) {
            log.error("Failed to send OTP to {}", request.getPhone(), e);
            return ResponseEntity.status(500).body(new OtpResponse(false, "Failed to send OTP"));
        }
    }
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP for user")
    public ResponseEntity<OtpResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        if (request == null || request.getPhone() == null || request.getOtp() == null) {
            return ResponseEntity.badRequest().body(new OtpResponse(false, "Phone and OTP are required"));
        }
        try {
            boolean ok = smsService.verifyCode(request.getPhone(), request.getOtp());
            if (ok) return ResponseEntity.ok(new OtpResponse(true, "OTP verified"));
            return ResponseEntity.ok(new OtpResponse(false, "Invalid or expired OTP"));
        } catch (Exception e) {
            log.error("Error verifying OTP for {}", request.getPhone(), e);
            return ResponseEntity.status(500).body(new OtpResponse(false, "Error verifying OTP"));
        }
    }
}
