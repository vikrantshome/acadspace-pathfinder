package com.naviksha.repository;

import com.naviksha.model.Career;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerRepository extends MongoRepository<Career, String> {
    Optional<Career> findByCareerId(String careerId);
    Optional<Career> findByCareerName(String careerName);
}