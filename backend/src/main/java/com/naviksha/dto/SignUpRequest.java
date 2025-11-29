package com.naviksha.dto;

import lombok.Data;

@Data
public class SignUpRequest {
    private String name;
    private String email;
    private String password;
    private String mobileNo;
    private String studentID;
}
