package com.naviksha.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String email;
    
    @Indexed(unique = true, sparse = true)
    private String studentID;
    
    @Indexed(sparse = true)
    private String mobileNo;
    
    private String password;
    private String name;
    
    @Builder.Default
    private Set<String> roles = Set.of("ROLE_USER");
    
    @Builder.Default
    private boolean active = true;
    
    // Profile fields
    private String fullName;
    private String parentName;
    private String schoolName;
    private Integer grade;
    private String board;
    private String city; // Added city field
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}