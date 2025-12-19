package com.naviksha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Spring Boot Application class for Naviksha AI Career Guidance Backend
 * 
 * This application provides:
 * - JWT-based authentication and authorization
 * - Career assessment and scoring engine
 * - RESTful APIs for frontend integration
 * - Admin tools for content management
 * - MongoDB integration for data persistence
 * 
 * To run: mvn spring-boot:run
 * To test: mvn test
 * To package: mvn clean package
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableAsync
public class NavikshaApplication {

    public static void main(String[] args) {
        SpringApplication.run(NavikshaApplication.class, args);
    }
}