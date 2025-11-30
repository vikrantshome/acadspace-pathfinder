package com.naviksha.service;

import com.naviksha.dto.RegisterRequest;
import com.naviksha.model.User;
import com.naviksha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SequenceService sequenceService;
    
    public User createUser(RegisterRequest request) {
        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .name(request.getName())
            .fullName(request.getFullName())
            .schoolName(request.getSchoolName())
            .grade(request.getGrade())
            .board(request.getBoard())
            .mobileNo(request.getMobileNo())
            .studentID(sequenceService.getNextStudentID())
            .build();
        
        return userRepository.save(user);
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public User findUserByLookup(com.naviksha.dto.LookupRequest request) {
        if (request.getStudentID() != null && !request.getStudentID().isEmpty()) {
            return userRepository.findByStudentID(request.getStudentID()).orElse(null);
        }
        if (request.getMobileNo() != null && !request.getMobileNo().isEmpty()) {
            return userRepository.findByMobileNo(request.getMobileNo()).orElse(null);
        }
        return null;
    }

    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
}