package com.naviksha.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class NlpProfileResponse {
    private int code;
    private String msg;
    private NlpUser user;

    @Data
    public static class NlpUser {
        @JsonProperty("Id")
        private String id;
        private String name;
        private String gender;
        private String grade;
        private String mastergrade;
        @JsonProperty("school_name")
        private String schoolName;
    }
}
