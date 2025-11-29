package com.naviksha.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String twilioSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.verify.service.sid:}")
    private String twilioVerifyServiceSid;

    private final OtpService otpService;

    /**
     * Send a verification code via Twilio Verify when configured; otherwise falls back to the in-memory OtpService and logs the code.
     * @param phone E.164 formatted phone number
     */
    public void sendVerificationCode(String phone) {
        if (twilioSid != null && !twilioSid.isBlank() && twilioAuthToken != null && !twilioAuthToken.isBlank() && twilioVerifyServiceSid != null && !twilioVerifyServiceSid.isBlank()) {
            try {
                com.twilio.Twilio.init(twilioSid, twilioAuthToken);
                com.twilio.rest.verify.v2.service.Verification.creator(twilioVerifyServiceSid, phone)
                        .setChannel("sms")
                        .create();
                log.info("Requested Twilio Verify code for {}", phone);
                return;
            } catch (NoClassDefFoundError | Exception e) {
                log.warn("Twilio Verify send failed for {}: {}. Falling back to local OTP.", phone, e.getMessage());
            }
        }

        // Fallback: generate OTP using local service and log it (for dev / free option)
        String otp = otpService.generateAndSaveOtp(phone);
        log.info("Local OTP for {}: {} (dev fallback)", phone, otp);
    }

    /**
     * Verify a code: prefer Twilio Verify when configured, otherwise check local OtpService.
     * @param phone E.164 phone
     * @param code code to verify
     * @return true if verified
     */
    public boolean verifyCode(String phone, String code) {
        if (twilioSid != null && !twilioSid.isBlank() && twilioAuthToken != null && !twilioAuthToken.isBlank() && twilioVerifyServiceSid != null && !twilioVerifyServiceSid.isBlank()) {
            try {
                com.twilio.Twilio.init(twilioSid, twilioAuthToken);
                com.twilio.rest.verify.v2.service.VerificationCheck verificationCheck =
                        com.twilio.rest.verify.v2.service.VerificationCheck.creator(twilioVerifyServiceSid)
                                .setTo(phone)
                                .setCode(code)
                                .create();
                String status = verificationCheck.getStatus();
                log.info("Twilio Verify check for {} returned status={}", phone, status);
                return "approved".equalsIgnoreCase(status) || "success".equalsIgnoreCase(status);
            } catch (NoClassDefFoundError | Exception e) {
                log.warn("Twilio Verify check failed for {}: {}. Falling back to local OTP.", phone, e.getMessage());
            }
        }

        // Local fallback
        OtpService.OtpResult result = otpService.verify(phone, code);
        log.info("Local OTP verify for {} -> {}", phone, result.getMessage());
        return result.isSuccess();
    }
}
