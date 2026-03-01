package com.naviksha.service;

import com.naviksha.dto.ReportSummaryDTO;
import com.naviksha.model.AdminAudit;
import com.naviksha.model.CareerBucket;
import com.naviksha.model.CareerMatch;
import com.naviksha.model.Report;
import com.naviksha.model.StudentReport;
import com.naviksha.model.User;
import com.naviksha.repository.ProgressRepository;
import com.naviksha.repository.ReportRepository;
import com.naviksha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final CareerService careerService;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final ProgressRepository progressRepository;
    
    public void logAction(String adminUser, String action, String details) {
        log.info("Admin action - User: {}, Action: {}, Details: {}", adminUser, action, details);
    }
    
    public List<AdminAudit> getAuditLogs(int page, int size) {
        // Implementation would typically query audit log collection
        return List.of();
    }
    
    public Map<String, Object> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalReportsGenerated = reportRepository.count();
        long totalTestsTaken = progressRepository.count();
        long careerCount = careerService.getAllCareers().size();
        
        return Map.of(
            "totalUsers", totalUsers,
            "totalTestsTaken", totalTestsTaken,
            "totalReportsGenerated", totalReportsGenerated,
            "totalCareers", careerCount,
            "systemStatus", "operational"
        );
    }

    public Page<ReportSummaryDTO> getReportsSummary(Pageable pageable) {
        Page<Report> reportPage = reportRepository.findAll(pageable);
        List<Report> reports = reportPage.getContent();

        // Extract user IDs to fetch associated users in bulk
        List<String> userIds = reports.stream()
                .map(Report::getUserId)
                .distinct()
                .collect(Collectors.toList());

        List<User> users = (List<User>) userRepository.findAllById(userIds);
        Map<String, User> userMap = new HashMap<>();
        for (User user : users) {
            userMap.put(user.getId(), user);
        }

        List<ReportSummaryDTO> dtos = reports.stream().map(report -> {
            User user = userMap.get(report.getUserId());
            StudentReport studentReport = report.getReportData();

            String topBucket1 = "Unknown";
            String topBucket2 = null;
            String topBucket3 = null;
            String topCareer1 = null;
            String topCareer2 = null;
            String topCareer3 = null;

            if (studentReport != null && studentReport.getTop5Buckets() != null) {
                List<CareerBucket> buckets = studentReport.getTop5Buckets();
                if (buckets.size() > 0) topBucket1 = buckets.get(0).getBucketName();
                if (buckets.size() > 1) topBucket2 = buckets.get(1).getBucketName();
                if (buckets.size() > 2) topBucket3 = buckets.get(2).getBucketName();
                
                // Top careers usually come from the first bucket's top careers
                if (buckets.size() > 0 && buckets.get(0).getTopCareers() != null) {
                    List<CareerMatch> topMatches = buckets.get(0).getTopCareers();
                    if (topMatches.size() > 0) topCareer1 = topMatches.get(0).getCareerName();
                    if (topMatches.size() > 1) topCareer2 = topMatches.get(1).getCareerName();
                    if (topMatches.size() > 2) topCareer3 = topMatches.get(2).getCareerName();
                }
            }
            
            Integer vibeR = null, vibeI = null, vibeA = null, vibeS = null, vibeE = null, vibeC = null;
            if (studentReport != null && studentReport.getVibeScores() != null) {
                Map<String, Integer> vs = studentReport.getVibeScores();
                vibeR = vs.get("R");
                vibeI = vs.get("I");
                vibeA = vs.get("A");
                vibeS = vs.get("S");
                vibeE = vs.get("E");
                vibeC = vs.get("C");
            }

            return ReportSummaryDTO.builder()
                    .studentID(user != null ? user.getStudentID() : null)
                    .studentName(user != null ? (user.getFullName() != null ? user.getFullName() : user.getName()) : (studentReport != null ? studentReport.getStudentName() : null))
                    .mobileNo(user != null ? user.getMobileNo() : null)
                    .email(user != null ? user.getEmail() : null)
                    .city(user != null ? user.getCity() : null)
                    .state(user != null ? user.getState() : null)
                    .schoolName(studentReport != null && studentReport.getSchoolName() != null ? studentReport.getSchoolName() : (user != null ? user.getSchoolName() : null))
                    .active(user != null ? user.isActive() : null)
                    .fullName(user != null ? user.getFullName() : null)
                    .parentName(user != null ? user.getParentName() : null)
                    .grade(studentReport != null && studentReport.getGrade() != null ? studentReport.getGrade() : (user != null ? user.getGrade() : null))
                    .board(studentReport != null && studentReport.getBoard() != null ? studentReport.getBoard() : (user != null ? user.getBoard() : null))
                    .partner(studentReport != null ? studentReport.getPartner() : null)
                    .extracurriculars(studentReport != null && studentReport.getExtracurriculars() != null ? String.join(", ", studentReport.getExtracurriculars()) : null)
                    .parentCareers(studentReport != null && studentReport.getParents() != null ? String.join(", ", studentReport.getParents()) : null)
                    .topBucket1(topBucket1)
                    .topBucket2(topBucket2)
                    .topBucket3(topBucket3)
                    .topCareer1(topCareer1)
                    .topCareer2(topCareer2)
                    .topCareer3(topCareer3)
                    .vibeR(vibeR)
                    .vibeI(vibeI)
                    .vibeA(vibeA)
                    .vibeS(vibeS)
                    .vibeE(vibeE)
                    .vibeC(vibeC)
                    .eduStats(studentReport != null ? studentReport.getEduStats() : null)
                    .aiEnhanced(studentReport != null && studentReport.getAiEnhanced() != null ? studentReport.getAiEnhanced() : false)
                    .createdAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null)
                    .updatedAt(user != null && user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
                    .build();
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, reportPage.getTotalElements());
    }
}