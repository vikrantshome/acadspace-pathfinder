package com.naviksha.service;

import com.naviksha.model.TestProgress;
import com.naviksha.repository.ProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {
    
    private final ProgressRepository progressRepository;
    
    public TestProgress getProgress(String userId, String testId) {
        // Get all progress entries for this user and test, then return the most recent one
        List<TestProgress> progressList = progressRepository.findByUserIdAndTestId(userId, testId);
        if (progressList.isEmpty()) {
            return null;
        }
        // Return the most recent one (by updatedAt)
        return progressList.stream()
            .max((p1, p2) -> p1.getUpdatedAt().compareTo(p2.getUpdatedAt()))
            .orElse(null);
    }
    
    public List<TestProgress> getAllProgressForUser(String userId) {
        return progressRepository.findByUserId(userId);
    }
    
    public TestProgress saveProgress(TestProgress progress) {
        // Get all progress entries for this user and test
        List<TestProgress> existingProgressList = progressRepository.findByUserIdAndTestId(
            progress.getUserId(), 
            progress.getTestId()
        );
        
        if (!existingProgressList.isEmpty()) {
            // Get the most recent progress entry
            TestProgress existingProgress = existingProgressList.stream()
                .max((p1, p2) -> p1.getUpdatedAt().compareTo(p2.getUpdatedAt()))
                .orElse(null);
            
            if (existingProgress != null) {
                // Update existing progress
                existingProgress.setCurrentQuestionIndex(progress.getCurrentQuestionIndex());
                existingProgress.setAnswers(progress.getAnswers());
                existingProgress.setCompleted(progress.isCompleted());
                return progressRepository.save(existingProgress);
            }
        }
        
        // Create new progress if none exists
        return progressRepository.save(progress);
    }
    
    public void resetProgress(String userId, String testId) {
        List<TestProgress> progressList = progressRepository.findByUserIdAndTestId(userId, testId);
        if (!progressList.isEmpty()) {
            progressRepository.deleteAll(progressList);
        }
    }
    
    public void cleanupDuplicateProgress(String userId) {
        // Get all progress for this user
        List<TestProgress> allProgress = progressRepository.findByUserId(userId);
        
        // Group by testId and keep only the most recent entry for each test
        Map<String, TestProgress> latestProgress = new HashMap<>();
        
        for (TestProgress progress : allProgress) {
            String testId = progress.getTestId();
            if (!latestProgress.containsKey(testId) || 
                progress.getUpdatedAt().isAfter(latestProgress.get(testId).getUpdatedAt())) {
                latestProgress.put(testId, progress);
            }
        }
        
        // Delete all entries except the latest ones
        List<TestProgress> toDelete = allProgress.stream()
            .filter(progress -> !progress.getId().equals(latestProgress.get(progress.getTestId()).getId()))
            .collect(Collectors.toList());
        
        if (!toDelete.isEmpty()) {
            progressRepository.deleteAll(toDelete);
        }
    }
}