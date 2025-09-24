package com.naviksha.repository;

import com.naviksha.model.TestProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends MongoRepository<TestProgress, String> {
    Optional<TestProgress> findByUserIdAndTestId(String userId, String testId);
    List<TestProgress> findByUserId(String userId);
}