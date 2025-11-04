/**
 * PDF Generation Service
 * Uses the same jsPDF logic as frontend to generate PDFs server-side
 * This is a JavaScript version of the shared PDF generation utility
 */

import express from 'express';
import cors from 'cors';
import { jsPDF } from 'jspdf';

const app = express();
const PORT = process.env.PORT || 5100;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// RIASEC labels matching frontend (same as src/lib/pdf-generator.ts)
const RIASEC_LABELS = {
  R: { name: 'Realistic', description: 'Practical, hands-on problem solver' },
  I: { name: 'Investigative', description: 'Analytical, research-oriented thinker' },
  A: { name: 'Artistic', description: 'Creative, innovative, expressive' },
  S: { name: 'Social', description: 'Helpful, collaborative, people-focused' },
  E: { name: 'Enterprising', description: 'Leadership, persuasive, goal-driven' },
  C: { name: 'Conventional', description: 'Organized, detail-oriented, systematic' }
};

/**
 * Generate PDF from report data (same logic as frontend pdf-generator.ts)
 */
function generatePDF(reportData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 15;

  // Helper function to add text with word wrap
  const addText = (text, fontSize = 9, isBold = false, color = '#000000') => {
    // Ensure text is a string and not empty
    if (!text || typeof text !== 'string') {
      return;
    }
    
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Handle color parsing - support both hex and RGB
    if (color.startsWith('#')) {
      // Hex color: #2563eb -> RGB(37, 99, 235)
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      pdf.setTextColor(r, g, b);
    } else {
      pdf.setTextColor(color);
    }
    
    try {
      const lines = pdf.splitTextToSize(text, pageWidth - 30);
      if (Array.isArray(lines)) {
        lines.forEach((line) => {
          if (typeof line === 'string') {
            if (yPosition > pageHeight - 15) {
              pdf.addPage();
              yPosition = 15;
            }
            pdf.text(line, 15, yPosition);
            yPosition += fontSize * 0.35;
          }
        });
      }
      yPosition += 1;
    } catch (error) {
      console.error('Error adding text to PDF:', error);
      // Fallback: try to add text as-is
      try {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 15;
        }
        pdf.text(String(text).substring(0, 100), 15, yPosition);
        yPosition += fontSize * 0.35;
      } catch (fallbackError) {
        console.error('Fallback text addition also failed:', fallbackError);
      }
    }
  };

  // Helper function for centered lines
  const addCenteredLine = (isDark = false) => {
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
  const studentName = reportData.studentName || 'Student';
  const schoolName = reportData.schoolName || 'Your School';
  const grade = reportData.grade || 11;
  const board = reportData.board || 'CBSE';
  addText(`Name: ${studentName}`, 10, true);
  addText(`School: ${schoolName}`, 9);
  addText(`Grade: ${grade} • Board: ${board}`, 9);
  addText(`Report Generated: ${new Date().toLocaleDateString()}`, 8);

  // Summary
  addCenteredLine(true);
  addText('Career Profile Summary', 12, true, '#2563eb');
  yPosition += 2;
  const summaryText = reportData.enhancedSummary || reportData.summaryParagraph || 'Your personalized career analysis is being generated based on your assessment responses.';
  addText(String(summaryText || ''), 9);

  // RIASEC Personality Profile
  addCenteredLine(true);
  addText('RIASEC Personality & Interest Profile', 12, true, '#2563eb');
  yPosition += 2;
  const vibeScores = reportData.vibeScores || reportData.vibe_scores || {};
  Object.entries(vibeScores).forEach(([key, value], index) => {
    const info = RIASEC_LABELS[key];
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
    // Null-safe property access
    if (!bucket) return;
    const bucketName = bucket.bucketName || 'Unknown Career';
    const bucketScore = bucket.bucketScore || 0;
    addText(`${index + 1}. ${bucketName} (${bucketScore}% Match)`, 10, true);
    
    const topCareers = (bucket.topCareers || []).slice(0, 3);
    topCareers.forEach((career, careerIndex) => {
      // Null-safe property access
      if (!career) return;
      const careerName = career.careerName || 'Unknown Career';
      const matchScore = career.matchScore || 0;
      const confidence = career.confidence || 'N/A';
      
      addText(`   ${careerName} - ${matchScore}% Match`, 9, true);
      addText(`   Confidence: ${confidence}`, 8);
      
      if (career.topReasons && Array.isArray(career.topReasons) && career.topReasons.length > 0) {
        addText('   Top Reasons:', 8, true);
        career.topReasons.forEach((reason) => {
          if (reason && typeof reason === 'string') {
            addText(`   • ${reason}`, 8);
          }
        });
      }
      
      if (career.studyPath) {
        let studyPathText = '';
        if (Array.isArray(career.studyPath)) {
          studyPathText = career.studyPath.filter(s => s && typeof s === 'string').join(', ');
        } else if (typeof career.studyPath === 'string') {
          studyPathText = career.studyPath;
        }
        if (studyPathText) {
          addText(`   Study Path: ${studyPathText}`, 8);
        }
      }
      
      if (career.first3Steps && Array.isArray(career.first3Steps) && career.first3Steps.length > 0) {
        addText('   First 3 Steps:', 8, true);
        career.first3Steps.forEach((step, stepIndex) => {
          if (step && typeof step === 'string') {
            addText(`   ${stepIndex + 1}. ${step}`, 8);
          }
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
  if (reportData.skillRecommendations && Array.isArray(reportData.skillRecommendations) && reportData.skillRecommendations.length > 0) {
    addCenteredLine(true);
    addText('AI-Recommended Skills to Develop', 12, true, '#2563eb');
    yPosition += 2;
    reportData.skillRecommendations.forEach((skill, index) => {
      if (skill && typeof skill === 'string') {
        addText(`${index + 1}. ${skill}`, 9);
        
        if (index < reportData.skillRecommendations.length - 1) {
          addCenteredLine(false);
        }
      }
    });
  }

  // AI Career Trajectory
  if (reportData.careerTrajectoryInsights && typeof reportData.careerTrajectoryInsights === 'string') {
    addCenteredLine(true);
    addText('Career Trajectory Insights', 12, true, '#2563eb');
    yPosition += 2;
    addText(reportData.careerTrajectoryInsights, 9);
  }

  // AI Detailed Insights
  if (reportData.detailedCareerInsights && typeof reportData.detailedCareerInsights === 'object') {
    addCenteredLine(true);
    addText('Detailed Career Explanations', 12, true, '#2563eb');
    yPosition += 2;
    
    if (reportData.detailedCareerInsights.explanations && typeof reportData.detailedCareerInsights.explanations === 'object') {
      const explanations = Object.entries(reportData.detailedCareerInsights.explanations);
      explanations.forEach(([career, explanation], index) => {
        if (career && typeof career === 'string') {
          addText(career, 9, true);
          addText(String(explanation || ''), 8);
          yPosition += 2;
          
          if (index < explanations.length - 1) {
            addCenteredLine(false);
          }
        }
      });
    }

    if (reportData.detailedCareerInsights.studyPaths && typeof reportData.detailedCareerInsights.studyPaths === 'object') {
      addCenteredLine(true);
      addText('Personalized Study Paths', 12, true, '#2563eb');
      yPosition += 2;
      const studyPaths = Object.entries(reportData.detailedCareerInsights.studyPaths);
      studyPaths.forEach(([career, path], index) => {
        if (career && typeof career === 'string') {
          addText(career, 9, true);
          if (Array.isArray(path)) {
            path.forEach((step, stepIndex) => {
              if (step && typeof step === 'string') {
                addText(`${stepIndex + 1}. ${step}`, 8);
              }
            });
          } else if (path != null) {
            addText(String(path), 8);
          }
          yPosition += 2;
          
          if (index < studyPaths.length - 1) {
            addCenteredLine(false);
          }
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pdf-generation-service' });
});

// Generate PDF endpoint
app.post('/generate-pdf', (req, res) => {
  try {
    const reportData = req.body;
    
    if (!reportData || !reportData.studentName) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'reportData with studentName is required' 
      });
    }

    console.log('Generating PDF for student:', reportData.studentName);
    
    // Generate PDF using same logic as frontend
    const pdf = generatePDF(reportData);
    
    // Convert to base64 for transmission
    const pdfBase64 = pdf.output('datauristring');
    
    // Extract base64 data (remove data:application/pdf;base64, prefix)
    const base64Data = pdfBase64.split(',')[1];
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Career_Report_${reportData.studentName.replace(/\s+/g, '_')}.pdf"`);
    
    // Send PDF as binary
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`PDF Generation Service running on port ${PORT}`);
});

