package com.naviksha.dto;

import com.naviksha.model.StudentReport;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PuppeteerRequest {
    private StudentReport reportData;
    private String userId;
    private String mobileNo;
    private String studentID;
    private String studentName;
}
