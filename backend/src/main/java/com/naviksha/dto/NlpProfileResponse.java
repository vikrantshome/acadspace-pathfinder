package com.naviksha.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class NlpProfileResponse {
    private int code;
    private String msg;
    private NlpUser user;

    @Data
    public static class NlpUser {
        @JsonProperty("id")
        private String id;
        private String name;
        private String gender;
        private String grade;
        private String mastergrade;
        
        @JsonProperty("schoolName")
        @JsonAlias({"schoolname", "SchoolName"})
        private String schoolNameCamel;

        @JsonProperty("school_name")
        private String schoolNameSnake;

        public String getSchoolName() {
            if (schoolNameSnake != null && !schoolNameSnake.isEmpty()) {
                return schoolNameSnake;
            }
            return schoolNameCamel;
        }

        public void setSchoolName(String schoolName) {
            this.schoolNameCamel = schoolName;
            this.schoolNameSnake = schoolName;
        }
    }
}
