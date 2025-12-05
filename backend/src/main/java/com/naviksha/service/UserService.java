package com.naviksha.service;

import com.naviksha.dto.RegisterRequest;
import com.naviksha.model.User;
import com.naviksha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SequenceService sequenceService;
    
    public User createUser(RegisterRequest request) {
        String studentID = request.getStudentID();
        if (studentID == null || studentID.isEmpty()) {
            studentID = sequenceService.getNextStudentID();
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .name(request.getName())
            .fullName(request.getFullName())
            .parentName(request.getParentName())
            .schoolName(request.getSchoolName())
            .grade(request.getGrade())
            .board(request.getBoard())
            .mobileNo(request.getMobileNo())
            .studentID(studentID)
            .city(request.getCity()) // Added city field
            .build();
        
        return userRepository.save(user);
    }

    public User createOrUpdateUser(RegisterRequest request) {
        User existingUser = null;

        // Try to find user by studentID first
        if (request.getStudentID() != null && !request.getStudentID().isEmpty()) {
            existingUser = userRepository.findByStudentID(request.getStudentID()).orElse(null);
        }

        // If not found by studentID, try by email
        if (existingUser == null && request.getEmail() != null && !request.getEmail().isEmpty()) {
            existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        }
        
        // If not found by email, try by mobileNo, but only if mobileNo is not empty
        if (existingUser == null && request.getMobileNo() != null && !request.getMobileNo().trim().isEmpty()) {
            existingUser = userRepository.findByMobileNo(request.getMobileNo()).orElse(null);
        }

        if (existingUser != null) {
            // Update existing user
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                existingUser.setEmail(request.getEmail());
            }
            if (request.getName() != null && !request.getName().isEmpty()) {
                existingUser.setName(request.getName());
            }
            if (request.getFullName() != null && !request.getFullName().isEmpty()) {
                existingUser.setFullName(request.getFullName());
            }
            if (request.getParentName() != null && !request.getParentName().isEmpty()) {
                existingUser.setParentName(request.getParentName());
            }
            if (request.getSchoolName() != null && !request.getSchoolName().isEmpty()) {
                existingUser.setSchoolName(request.getSchoolName());
            }
            if (request.getGrade() != null) {
                existingUser.setGrade(request.getGrade());
            }
            if (request.getBoard() != null && !request.getBoard().isEmpty()) {
                existingUser.setBoard(request.getBoard());
            }
            if (request.getMobileNo() != null && !request.getMobileNo().isEmpty()) {
                existingUser.setMobileNo(request.getMobileNo());
            }
            if (request.getCity() != null && !request.getCity().isEmpty()) {
                existingUser.setCity(request.getCity());
            }
            // Only update password if provided
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            existingUser.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(existingUser);
        } else {
            // Create new user
            String studentID = request.getStudentID();
            if (studentID == null || studentID.isEmpty()) {
                studentID = sequenceService.getNextStudentID();
            }

            User newUser = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .fullName(request.getFullName())
                .parentName(request.getParentName())
                .schoolName(request.getSchoolName())
                .grade(request.getGrade())
                .board(request.getBoard())
                .mobileNo(request.getMobileNo())
                .studentID(studentID)
                .city(request.getCity())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            return userRepository.save(newUser);
        }
    }
    
    
    public Optional<User> findByStudentId(String studentId) {
        return userRepository.findByStudentID(studentId);
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
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