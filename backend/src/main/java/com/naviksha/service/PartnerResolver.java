package com.naviksha.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@Slf4j
public class PartnerResolver {

    private static final String NAVIKSHA = "naviksha";
    private static final String ALLEN = "allen";
    private static final String NLP = "nlp";

    @Value("${app.default-partner:naviksha}")
    private String defaultPartner;

    public String resolveReportPartner(Object rawPartner) {
        String normalizedPartner = normalize(rawPartner);
        return normalizedPartner != null ? normalizedPartner : getDefaultPartner();
    }

    public String normalize(Object rawPartner) {
        if (rawPartner == null) {
            return null;
        }

        String value = String.valueOf(rawPartner).trim().toLowerCase(Locale.ROOT);
        if (value.isEmpty()) {
            return null;
        }

        return switch (value) {
            case NAVIKSHA -> NAVIKSHA;
            case ALLEN -> ALLEN;
            case NLP, "next education" -> NLP;
            default -> {
                log.warn("Unsupported partner value '{}'. Falling back to default partner.", value);
                yield null;
            }
        };
    }

    public String getDefaultPartner() {
        String normalizedDefault = normalizeDefaultPartner(defaultPartner);
        if (normalizedDefault != null) {
            return normalizedDefault;
        }

        log.warn("Invalid DEFAULT_PARTNER value '{}'. Falling back to '{}'.", defaultPartner, NAVIKSHA);
        return NAVIKSHA;
    }

    private String normalizeDefaultPartner(Object rawPartner) {
        if (rawPartner == null) {
            return null;
        }

        String value = String.valueOf(rawPartner).trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case NAVIKSHA -> NAVIKSHA;
            case ALLEN -> ALLEN;
            default -> null;
        };
    }
}
