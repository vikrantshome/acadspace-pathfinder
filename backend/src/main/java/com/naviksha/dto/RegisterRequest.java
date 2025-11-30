package com.naviksha.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password should be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    // Optional profile fields
    private String fullName;
    private String schoolName;
    private Integer grade;
    private String board;
    private String mobileNo;
    private String studentID;
}