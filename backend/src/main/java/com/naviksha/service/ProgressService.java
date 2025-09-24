package com.naviksha.service;

import com.naviksha.model.TestProgress;
import com.naviksha.repository.ProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {
    
    private final ProgressRepository progressRepository;
    
    public TestProgress getProgress(String userId, String testId) {
        return progressRepository.findByUserIdAndTestId(userId, testId).orElse(null);
    }
    
    public List<TestProgress> getAllProgressForUser(String userId) {
        return progressRepository.findByUserId(userId);
    }
    
    public TestProgress saveProgress(TestProgress progress) {
        return progressRepository.save(progress);
    }
    
    public void resetProgress(String userId, String testId) {
        progressRepository.findByUserIdAndTestId(userId, testId)
            .ifPresent(progressRepository::delete);
    }
}