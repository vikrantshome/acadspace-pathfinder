/**
 * PDF Generation Utility
 * Shared logic for generating career report PDFs using jsPDF
 * Can be used both in frontend and Node.js backend
 */

import jsPDF from 'jspdf';

export interface ReportData {
  studentName: string;
  schoolName?: string;
  grade?: number;
  board?: string;
  vibeScores?: Record<string, number>;
  vibe_scores?: Record<string, number>;
  top5Buckets?: CareerBucket[];
  top5_buckets?: CareerBucket[];
  summaryParagraph?: string;
  enhancedSummary?: string;
  skillRecommendations?: string[];
  careerTrajectoryInsights?: string;
  detailedCareerInsights?: {
    explanations?: Record<string, string>;
    studyPaths?: Record<string, string | string[]>;
  };
}

export interface CareerBucket {
  bucketName: string;
  bucketScore: number;
  topCareers?: CareerMatch[];
}

export interface CareerMatch {
  careerName: string;
  matchScore: number;
  confidence?: string;
  topReasons?: string[];
  studyPath?: string | string[];
  first3Steps?: string[];
}

const RIASEC_LABELS = {
  R: { name: 'Realistic', description: 'Practical, hands-on problem solver' },
  I: { name: 'Investigative', description: 'Analytical, research-oriented thinker' },
  A: { name: 'Artistic', description: 'Creative, innovative, expressive' },
  S: { name: 'Social', description: 'Helpful, collaborative, people-focused' },
  E: { name: 'Enterprising', description: 'Leadership, persuasive, goal-driven' },
  C: { name: 'Conventional', description: 'Organized, detail-oriented, systematic' }
};

/**
 * Generate PDF from report data (same logic as frontend)
 * Returns jsPDF instance
 */
export function generateReportPDF(reportData: ReportData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 15;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 9, isBold: boolean = false, color: string = '#000000') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color);
    
    const lines = pdf.splitTextToSize(text, pageWidth - 30);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 15;
      }
      pdf.text(line, 15, yPosition);
      yPosition += fontSize * 0.35;
    });
    yPosition += 1;
  };

  // Helper function for centered lines
  const addCenteredLine = (isDark: boolean = false) => {
    const space = isDark ? 6 : 5;
    yPosition += space;
    pdf.setDrawColor(isDark ? 0 : 200, isDark ? 0 : 200, isDark ? 0 : 200);
    pdf.setLineWidth(isDark ? 0.5 : 0.2);
    pdf.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += space;
  };

  // Cover Page with Student Info
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Your Dreams to Reality Handbook', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text('Naviksha AI', pageWidth / 2, 35, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 60;

  // Student Information
  addText('Student Information', 12, true, '#2563eb');
  yPosition += 3;
  addText(`Name: ${reportData.studentName}`, 10, true);
  addText(`School: ${reportData.schoolName || 'Your School'}`, 9);
  addText(`Grade: ${reportData.grade || 11} • Board: ${reportData.board || 'CBSE'}`, 9);
  addText(`Report Generated: ${new Date().toLocaleDateString()}`, 8);

  // Summary
  addCenteredLine(true);
  addText('Career Profile Summary', 12, true, '#2563eb');
  yPosition += 2;
  addText(reportData.enhancedSummary || reportData.summaryParagraph || 'Your personalized career analysis is being generated based on your assessment responses.', 9);

  // RIASEC Personality Profile
  addCenteredLine(true);
  addText('RIASEC Personality & Interest Profile', 12, true, '#2563eb');
  yPosition += 2;
  const vibeScores = reportData.vibeScores || reportData.vibe_scores || {};
  Object.entries(vibeScores).forEach(([key, value], index) => {
    const info = RIASEC_LABELS[key as keyof typeof RIASEC_LABELS];
    const score = Number(value) || 0;
    addText(`${info?.name || key}: ${score}%`, 9, true);
    addText(info?.description || '', 8);
    
    if (index < Object.entries(vibeScores).length - 1) {
      addCenteredLine(false);
    }
  });

  // Career Recommendations
  addCenteredLine(true);
  addText('Top 5 Career Recommendations', 12, true, '#2563eb');
  yPosition += 2;
  const top5Buckets = reportData.top5Buckets || reportData.top5_buckets || [];
  top5Buckets.forEach((bucket, index) => {
    addText(`${index + 1}. ${bucket.bucketName} (${bucket.bucketScore}% Match)`, 10, true);
    
    const topCareers = (bucket.topCareers || []).slice(0, 3);
    topCareers.forEach((career, careerIndex) => {
      addText(`   ${career.careerName} - ${career.matchScore}% Match`, 9, true);
      addText(`   Confidence: ${career.confidence || 'N/A'}`, 8);
      
      if (career.topReasons && career.topReasons.length > 0) {
        addText('   Top Reasons:', 8, true);
        career.topReasons.forEach((reason: string) => {
          addText(`   • ${reason}`, 8);
        });
      }
      
      if (career.studyPath) {
        const studyPathText = Array.isArray(career.studyPath) 
          ? career.studyPath.join(', ') 
          : career.studyPath;
        addText(`   Study Path: ${studyPathText}`, 8);
      }
      
      if (career.first3Steps && career.first3Steps.length > 0) {
        addText('   First 3 Steps:', 8, true);
        career.first3Steps.forEach((step: string, stepIndex: number) => {
          addText(`   ${stepIndex + 1}. ${step}`, 8);
        });
      }
      yPosition += 2;
      
      if (careerIndex < topCareers.length - 1) {
        addCenteredLine(false);
      }
    });
    
    if (index < top5Buckets.length - 1) {
      addCenteredLine(false);
    }
  });

  // AI Skills Recommendations
  if (reportData.skillRecommendations && reportData.skillRecommendations.length > 0) {
    addCenteredLine(true);
    addText('AI-Recommended Skills to Develop', 12, true, '#2563eb');
    yPosition += 2;
    reportData.skillRecommendations.forEach((skill: string, index: number) => {
      addText(`${index + 1}. ${skill}`, 9);
      
      if (index < reportData.skillRecommendations.length - 1) {
        addCenteredLine(false);
      }
    });
  }

  // AI Career Trajectory
  if (reportData.careerTrajectoryInsights) {
    addCenteredLine(true);
    addText('Career Trajectory Insights', 12, true, '#2563eb');
    yPosition += 2;
    addText(reportData.careerTrajectoryInsights, 9);
  }

  // AI Detailed Insights
  if (reportData.detailedCareerInsights) {
    addCenteredLine(true);
    addText('Detailed Career Explanations', 12, true, '#2563eb');
    yPosition += 2;
    
    if (reportData.detailedCareerInsights.explanations) {
      const explanations = Object.entries(reportData.detailedCareerInsights.explanations);
      explanations.forEach(([career, explanation], index) => {
        addText(career, 9, true);
        addText(String(explanation), 8);
        yPosition += 2;
        
        if (index < explanations.length - 1) {
          addCenteredLine(false);
        }
      });
    }

    if (reportData.detailedCareerInsights.studyPaths) {
      addCenteredLine(true);
      addText('Personalized Study Paths', 12, true, '#2563eb');
      yPosition += 2;
      const studyPaths = Object.entries(reportData.detailedCareerInsights.studyPaths);
      studyPaths.forEach(([career, path], index) => {
        addText(career, 9, true);
        if (Array.isArray(path)) {
          path.forEach((step: string, stepIndex: number) => {
            addText(`${stepIndex + 1}. ${step}`, 8);
          });
        } else {
          addText(String(path), 8);
        }
        yPosition += 2;
        
        if (index < studyPaths.length - 1) {
          addCenteredLine(false);
        }
      });
    }
  }

  // Next Steps
  addCenteredLine(true);
  addText('Recommended Next Steps', 12, true, '#2563eb');
  yPosition += 2;
  const nextSteps = [
    {
      title: "Explore Career Details",
      description: "Research your top 3-5 career recommendations in depth. Understand daily responsibilities, growth opportunities, and industry trends.",
      timeline: "This week"
    },
    {
      title: "Educational Pathway Planning", 
      description: "Research educational requirements, courses, and institutions that align with your career choices. Plan your subject selection for upcoming grades.",
      timeline: "Next 2 weeks"
    },
    {
      title: "Professional Networking",
      description: "Connect with professionals in your areas of interest through LinkedIn, career events, or through family connections. Conduct informational interviews.",
      timeline: "This month"
    },
    {
      title: "Gain Experience",
      description: "Look for internships, job shadowing opportunities, or volunteer work in your fields of interest. Consider joining relevant clubs or competitions.",
      timeline: "Next 3 months"
    },
    {
      title: "Skill Development",
      description: "Identify and develop key skills relevant to your top career choices. Take online courses, attend workshops, or start personal projects.",
      timeline: "Ongoing"
    }
  ];

  nextSteps.forEach((step, index) => {
    addText(`${index + 1}. ${step.title} (${step.timeline})`, 9, true);
    addText(step.description, 8);
    yPosition += 2;
    
    if (index < nextSteps.length - 1) {
      addCenteredLine(false);
    }
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 8);
    pdf.text('Generated by Naviksha AI', 15, pageHeight - 8);
  }

  return pdf;
}

/**
 * Generate PDF and return as Blob (for frontend download)
 */
export function generatePDFBlob(reportData: ReportData): Blob {
  const pdf = generateReportPDF(reportData);
  return pdf.output('blob');
}

/**
 * Generate PDF and return as base64 string (for backend/email)
 */
export function generatePDFBase64(reportData: ReportData): string {
  const pdf = generateReportPDF(reportData);
  return pdf.output('datauristring');
}

