package com.naviksha.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class OtpService {

    private static final long OTP_TTL_SECONDS = 5 * 60; // 5 minutes
    private static final int MAX_ATTEMPTS = 5;
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private final ScheduledExecutorService cleaner = Executors.newSingleThreadScheduledExecutor();

    @PostConstruct
    public void init() {
        cleaner.scheduleAtFixedRate(this::cleanup, 1, 1, TimeUnit.MINUTES);
    }

    public String generateAndSaveOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        OtpEntry entry = new OtpEntry(otp, Instant.now().plusSeconds(OTP_TTL_SECONDS));
        entry.setAttempts(0);
        store.put(email.toLowerCase(), entry);
        log.info("Generated OTP for {} -> {}", email, otp);
        return otp;
    }

    public OtpResult verify(String email, String otp) {
        String key = email.toLowerCase();
        OtpEntry entry = store.get(key);
        if (entry == null) {
            return new OtpResult(false, "No OTP found or it has expired");
        }
        if (Instant.now().isAfter(entry.expiresAt)) {
            store.remove(key);
            return new OtpResult(false, "OTP expired");
        }
        if (entry.attempts >= MAX_ATTEMPTS) {
            store.remove(key);
            return new OtpResult(false, "Maximum attempts exceeded");
        }
        entry.attempts++;
        if (!entry.otp.equals(otp)) {
            if (entry.attempts >= MAX_ATTEMPTS) {
                store.remove(key);
                return new OtpResult(false, "OTP incorrect — maximum attempts exceeded");
            }
            return new OtpResult(false, "OTP incorrect");
        }
        // success
        store.remove(key);
        return new OtpResult(true, "OTP verified successfully");
    }

    private void cleanup() {
        Instant now = Instant.now();
        store.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt));
    }

    @Data
    private static class OtpEntry {
        private final String otp;
        private final Instant expiresAt;
        private int attempts;
    }

    @Data
    public static class OtpResult {
        private final boolean success;
        private final String message;
    }
}
