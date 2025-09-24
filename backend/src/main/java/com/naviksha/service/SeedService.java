package com.naviksha.service;

import com.naviksha.dto.SeedResultDTO;
import com.naviksha.model.Career;
import com.naviksha.model.User;
import com.naviksha.repository.CareerRepository;
import com.naviksha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.opencsv.CSVReader;

import java.io.InputStreamReader;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeedService {
    
    private final CareerRepository careerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public SeedResultDTO seedDatabase() {
        log.info("Starting database seeding...");
        
        int careersImported = seedCareers();
        int usersCreated = seedUsers();
        
        return SeedResultDTO.builder()
            .careersImported(careersImported)
            .testsImported(2) // vibematch + edustats
            .usersCreated(usersCreated)
            .message("Database seeded successfully")
            .build();
    }
    
    private int seedCareers() {
        try {
            ClassPathResource resource = new ClassPathResource("data/career_mappings.csv");
            CSVReader reader = new CSVReader(new InputStreamReader(resource.getInputStream()));
            
            String[] headers = reader.readNext(); // Skip header
            String[] line;
            int count = 0;
            
            while ((line = reader.readNext()) != null) {
                Career career = Career.builder()
                    .careerId(line[0])
                    .careerName(line[1])
                    .bucket(line[2])
                    .riasecProfile(line[3])
                    .primarySubjects(line[4])
                    .tags(line[5])
                    .minQualification(line[6])
                    .top5CollegeCourses(line[7])
                    .baseParagraph(line[8])
                    .microprojects(line[9])
                    .whyFit(line[10])
                    .build();
                
                if (!careerRepository.findByCareerId(career.getCareerId()).isPresent()) {
                    careerRepository.save(career);
                    count++;
                }
            }
            
            log.info("Imported {} careers", count);
            return count;
        } catch (Exception e) {
            log.error("Error seeding careers", e);
            return 0;
        }
    }
    
    private int seedUsers() {
        try {
            // Create admin user if doesn't exist
            if (!userRepository.existsByEmail("admin@naviksha.ai")) {
                User admin = User.builder()
                    .email("admin@naviksha.ai")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Admin User")
                    .roles(Set.of("ROLE_ADMIN", "ROLE_USER"))
                    .build();
                
                userRepository.save(admin);
                log.info("Created admin user");
                return 1;
            }
            return 0;
        } catch (Exception e) {
            log.error("Error seeding users", e);
            return 0;
        }
    }
}