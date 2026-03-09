package com.naviksha.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * School Controller
 * 
 * Provides endpoints for retrieving school data for frontend dropdowns.
 */
@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Schools", description = "School data endpoints")
public class SchoolController {

    private final MongoTemplate mongoTemplate;

    @GetMapping
    @Operation(summary = "Get list of schools", description = "Retrieve a distinct, alphabetically sorted list of all school names present in the database.")
    public ResponseEntity<List<String>> getSchools() {
        try {
            log.info("Fetching distinct school names");
            
            // Get all unique school names from the users collection
            List<String> schools = mongoTemplate.findDistinct("schoolName", com.naviksha.model.User.class, String.class);
            
            // Filter out null/empty values and sort alphabetically
            List<String> sortedSchools = schools.stream()
                    .filter(name -> name != null && !name.trim().isEmpty())
                    .sorted((a, b) -> a.compareToIgnoreCase(b))
                    .collect(Collectors.toList());
                    
            log.info("Found {} distinct schools", sortedSchools.size());
            return ResponseEntity.ok(sortedSchools);
            
        } catch (Exception e) {
            log.error("Error fetching school list", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
