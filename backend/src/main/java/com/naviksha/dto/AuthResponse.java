package com.naviksha.dto;

import com.naviksha.model.User;
import lombok.Data;
import java.util.List;

@Data
public class AuthResponse {
    private String token;
    private User user;
    private String message;
    private List<User> profiles;

    public AuthResponse(String token, User user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
    }

    public AuthResponse(String token, User user, String message, List<User> profiles) {
        this.token = token;
        this.user = user;
        this.message = message;
        this.profiles = profiles;
    }
}