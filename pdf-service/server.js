/**
 * Enhanced PDF Generation Service
 * Uses the same enhanced jsPDF logic as frontend to generate beautiful PDFs server-side
 * Colorful, engaging career report PDFs with icons, diagrams, and modern styling
 */

import express from 'express';
import cors from 'cors';
import { jsPDF } from 'jspdf';

const app = express();
const PORT = process.env.PORT || 5100;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Color palette
const COLORS = {
  primary: '#6366f1',      // Indigo
  secondary: '#ec4899',    // Pink
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  info: '#3b82f6',         // Blue
  purple: '#a855f7',       // Purple
  teal: '#14b8a6',         // Teal
  orange: '#f97316',       // Orange
  lightBg: '#f8fafc',      // Light background
  darkText: '#1e293b',     // Dark text
  mediumText: '#64748b',   // Medium text
  lightText: '#94a3b8'     // Light text
};

const RIASEC_CONFIG = {
  R: { 
    name: 'Realistic', 
    desc: 'Practical, hands-on problem solver',
    color: '#f97316',
    symbol: 'R'
  },
  I: { 
    name: 'Investigative', 
    desc: 'Analytical, research-oriented thinker',
    color: '#6366f1',
    symbol: 'I'
  },
  A: { 
    name: 'Artistic', 
    desc: 'Creative, innovative, expressive',
    color: '#ec4899',
    symbol: 'A'
  },
  S: { 
    name: 'Social', 
    desc: 'Helpful, collaborative, people-focused',
    color: '#10b981',
    symbol: 'S'
  },
  E: { 
    name: 'Enterprising', 
    desc: 'Leadership, persuasive, goal-driven',
    color: '#f59e0b',
    symbol: 'E'
  },
  C: { 
    name: 'Conventional', 
    desc: 'Organized, detail-oriented, systematic',
    color: '#14b8a6',
    symbol: 'C'
  }
};

/**
 * Generate PDF from report data (same enhanced logic as frontend pdf-generator.ts)
 */
function generatePDF(reportData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 0;

  // Helper: Draw decorative corner elements
  const drawCornerDecor = () => {
    const [r, g, b] = hexToRgb(COLORS.primary);
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(0.5);
    // Top left
    pdf.line(10, 10, 20, 10);
    pdf.line(10, 10, 10, 20);
    // Top right
    pdf.line(pageWidth - 20, 10, pageWidth - 10, 10);
    pdf.line(pageWidth - 10, 10, pageWidth - 10, 20);
  };

  // Helper: Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Helper: Set color from hex
  const setColor = (hex, isText = true) => {
    const [r, g, b] = hexToRgb(hex);
    if (isText) {
      pdf.setTextColor(r, g, b);
    } else {
      pdf.setFillColor(r, g, b);
    }
  };

  // Helper: Add card with shadow effect
  const drawCard = (x, y, w, h, bgColor = '#ffffff') => {
    if (h === 'auto') return; // Height will be calculated later
    // Shadow
    pdf.setFillColor(220, 220, 230);
    pdf.roundedRect(x + 1, y + 1, w, h, 3, 3, 'F');
    // Card
    setColor(bgColor, false);
    pdf.roundedRect(x, y, w, h, 3, 3, 'F');
  };

  // Helper: Add icon circle (without emoji - use solid color circles instead)
  const drawIconCircle = (x, y, radius, color) => {
    setColor(color, false);
    pdf.circle(x, y, radius, 'F');
    // Add white inner circle for depth
    pdf.setFillColor(255, 255, 255);
    pdf.circle(x, y, radius - 1.5, 'F');
    // Add colored center
    setColor(color, false);
    pdf.circle(x, y, radius - 2.5, 'F');
  };

  // Helper: Progress bar
  const drawProgressBar = (x, y, width, percentage, color) => {
    // Background
    pdf.setFillColor(240, 240, 245);
    pdf.roundedRect(x, y, width, 4, 2, 2, 'F');
    // Fill
    setColor(color, false);
    const fillWidth = (width * percentage) / 100;
    pdf.roundedRect(x, y, fillWidth, 4, 2, 2, 'F');
  };

  // Helper: Check page space and add new page if needed
  const checkSpace = (needed) => {
    if (yPos + needed > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
      drawCornerDecor();
      return true;
    }
    return false;
  };

  // ============ COVER PAGE ============
  // Gradient-like background using multiple rectangles
  const gradientSteps = 8;
  for (let i = 0; i < gradientSteps; i++) {
    const startColor = hexToRgb(COLORS.primary);
    const endColor = hexToRgb(COLORS.secondary);
    const ratio = i / gradientSteps;
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i * (pageHeight / gradientSteps), pageWidth, pageHeight / gradientSteps, 'F');
  }

  // Decorative circles
  pdf.setFillColor(255, 255, 255, 0.1);
  pdf.circle(20, 30, 40, 'F');
  pdf.circle(pageWidth - 30, pageHeight - 40, 50, 'F');
  pdf.circle(pageWidth - 20, 60, 30, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(34); // 28 * 1.2
  pdf.setFont('helvetica', 'bold');
  pdf.text('Your Dreams to', pageWidth / 2, 70, { align: 'center' });
  pdf.setFontSize(38); // 32 * 1.2
  pdf.text('Reality Handbook', pageWidth / 2, 85, { align: 'center' });

  // Subtitle
  pdf.setFontSize(19); // 16 * 1.2
  pdf.setFont('helvetica', 'normal');
  pdf.text('Powered by Naviksha AI', pageWidth / 2, 100, { align: 'center' });

  // Student info card
  drawCard(25, 120, pageWidth - 50, 55, '#ffffff');
  
  pdf.setFontSize(17); // 14 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.primary);
  pdf.text('Student Profile', 35, 133);

  pdf.setFontSize(13); // 11 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.darkText);
  pdf.text(reportData.studentName || 'Student', 35, 143);
  
  pdf.setFontSize(11); // 9 * 1.2
  pdf.setFont('helvetica', 'normal');
  setColor(COLORS.mediumText);
  pdf.text(reportData.schoolName || 'Your School', 35, 151);
  pdf.text(`Grade ${reportData.grade || 11} - ${reportData.board || 'CBSE'}`, 35, 158);
  pdf.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 35, 165);

  // Decorative elements
  setColor(COLORS.warning, false);
  pdf.circle(pageWidth - 40, 147, 3, 'F');
  setColor(COLORS.success, false);
  pdf.circle(pageWidth - 35, 155, 2, 'F');
  setColor(COLORS.info, false);
  pdf.circle(pageWidth - 42, 160, 2.5, 'F');

  // Footer quote
  pdf.setFontSize(12); // 10 * 1.2
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(255, 255, 255);
  pdf.text('"Your future starts with the choices you make today"', pageWidth / 2, pageHeight - 30, { align: 'center' });

  // ============ PAGE 2: SUMMARY & RIASEC ============
  pdf.addPage();
  yPos = 25;
  drawCornerDecor();

  // Summary Section
  const grade = reportData.grade || 11;
  const isGradeBelow8 = grade < 8;
  
  // Card dimensions with increased padding
  const cardPadding = 10; // Increased padding from card border
  const cardX = 15;
  const cardWidth = pageWidth - 30;
  const textX = cardX + cardPadding;
  const textWidth = cardWidth - (cardPadding * 2);
  
  // Calculate summary text height dynamically
  pdf.setFontSize(11); // 9 * 1.2
  pdf.setFont('helvetica', 'normal');
  const summaryText = reportData.enhancedSummary || reportData.summaryParagraph || 'Your personalized career analysis is being generated based on your assessment responses.';
  const summaryLines = pdf.splitTextToSize(summaryText, textWidth);
  
  // Calculate title height
  const summaryTitle = isGradeBelow8 ? 'Skill Development Profile Summary' : 'Career Profile Summary';
  pdf.setFontSize(17); // 14 * 1.2
  const titleLines = pdf.splitTextToSize(summaryTitle, textWidth - 25); // Account for icon circle
  const titleHeight = titleLines.length * 6;
  
  // Calculate total card height with proper padding
  const iconRadius = 6;
  const iconY = yPos + cardPadding;
  const titleY = iconY + iconRadius + 3;
  const contentY = titleY + titleHeight + 8; // Increased spacing between title and content
  const contentHeight = summaryLines.length * 4.5;
  const summaryHeight = Math.max(60, contentY + contentHeight + cardPadding - yPos); // Dynamic height with proper padding
  
  drawCard(cardX, yPos, cardWidth, summaryHeight, COLORS.lightBg);
  
  drawIconCircle(textX, iconY, iconRadius, COLORS.info);
  pdf.setFontSize(17); // 14 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.info);
  pdf.text(titleLines, textX + 15, titleY);

  pdf.setFontSize(11); // 9 * 1.2
  pdf.setFont('helvetica', 'normal');
  setColor(COLORS.darkText);
  pdf.text(summaryLines, textX, contentY);

  yPos += summaryHeight + 10;

  // RIASEC Header
  pdf.setFontSize(19); // 16 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.primary);
  pdf.text('RIASEC Personality Profile', 15, yPos);
  
  pdf.setFontSize(10); // 8 * 1.2
  pdf.setFont('helvetica', 'normal');
  setColor(COLORS.mediumText);
  pdf.text('Your unique personality traits and career interests', 15, yPos + 6);

  yPos += 15;

  // RIASEC Cards
  const vibeScores = reportData.vibeScores || reportData.vibe_scores || {};
  const entries = Object.entries(vibeScores);
  const riasecCardWidth = (pageWidth - 40) / 2 - 5;
  const cardHeight = 35;

  entries.forEach(([key, value], index) => {
    const config = RIASEC_CONFIG[key];
    if (!config) return;
    
    const score = Number(value) || 0;
    
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 15 + col * (riasecCardWidth + 10);
    const y = yPos + row * (cardHeight + 8);

    checkSpace(cardHeight + 10);

    // Card
    drawCard(x, y, riasecCardWidth, cardHeight, '#ffffff');
    
    // Icon circle with letter
    drawIconCircle(x + 10, y + 12, 5, config.color);
    pdf.setFontSize(11); // 9 * 1.2
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(config.symbol, x + 8, y + 14);
    
    // Type name
    pdf.setFontSize(13); // 11 * 1.2
    pdf.setFont('helvetica', 'bold');
    setColor(config.color);
    pdf.text(config.name, x + 20, y + 13);
    
    // Score
    pdf.setFontSize(17); // 14 * 1.2
    pdf.setFont('helvetica', 'bold');
    setColor(COLORS.darkText);
    pdf.text(`${score}%`, x + riasecCardWidth - 25, y + 13);
    
    // Description
    pdf.setFontSize(8); // 7 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.mediumText);
    const descLines = pdf.splitTextToSize(config.desc, riasecCardWidth - 25);
    pdf.text(descLines, x + 10, y + 21);
    
    // Progress bar
    drawProgressBar(x + 10, y + cardHeight - 8, riasecCardWidth - 20, score, config.color);
  });

  yPos += Math.ceil(entries.length / 2) * (cardHeight + 8) + 10;

  // ============ CAREER RECOMMENDATIONS (Skip for grade < 8) ============
  // Only show career recommendations for grade >= 8
  if (!isGradeBelow8) {
    pdf.addPage();
    yPos = 25;
    drawCornerDecor();

    pdf.setFontSize(22); // 18 * 1.2
    pdf.setFont('helvetica', 'bold');
    setColor(COLORS.primary);
    pdf.text('Top Career Recommendations', 15, yPos);

    pdf.setFontSize(10); // 8 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.mediumText);
    pdf.text('Personalized career paths based on your unique profile', 15, yPos + 6);

    yPos += 18;

    const top5Buckets = reportData.top5Buckets || reportData.top5_buckets || [];
    const bucketColors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple];

    top5Buckets.forEach((bucket, bucketIndex) => {
    if (!bucket) return;
    checkSpace(70);
    
    const bucketColor = bucketColors[bucketIndex % bucketColors.length];
    
    // Bucket header card
    drawCard(15, yPos, pageWidth - 30, 20, bucketColor);
    
    pdf.setFontSize(14); // 12 * 1.2
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${bucketIndex + 1}. ${bucket.bucketName || 'Career Category'}`, 22, yPos + 10);
    
    pdf.setFontSize(17); // 14 * 1.2
    pdf.text(`${bucket.bucketScore || 0}%`, pageWidth - 35, yPos + 10);
    
    // Match badge
    setColor('#ffffff', false);
    pdf.roundedRect(pageWidth - 50, yPos + 5, 13, 10, 2, 2, 'F');
    pdf.setFontSize(8); // 7 * 1.2
    setColor(bucketColor);
    pdf.text('MATCH', pageWidth - 48.5, yPos + 11);

    yPos += 25;

    // Careers
    const topCareers = (bucket.topCareers || []).slice(0, 3);
    topCareers.forEach((career, careerIndex) => {
      if (!career) return;
      checkSpace(55);
      
      // Career card background will be drawn at the end
      const cardStartY = yPos;
      
      // Career name and score
      pdf.setFontSize(13); // 11 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.darkText);
      pdf.text(career.careerName || 'Career', 28, yPos + 8);
      
      // Match badge
      const matchColor = (career.matchScore || 0) >= 55 ? COLORS.success : (career.matchScore || 0) >= 50 ? COLORS.warning : COLORS.mediumText;
      setColor(matchColor, false);
      pdf.roundedRect(pageWidth - 50, yPos + 3, 20, 8, 2, 2, 'F');
      pdf.setFontSize(11); // 9 * 1.2
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${career.matchScore || 0}%`, pageWidth - 48, yPos + 8);

      let careerYPos = yPos + 15;

      // Confidence
      pdf.setFontSize(8); // 7 * 1.2
      pdf.setFont('helvetica', 'normal');
      setColor(COLORS.mediumText);
      pdf.text(`Confidence: ${career.confidence || 'N/A'}`, 28, careerYPos);
      careerYPos += 6;

      // Top Reasons
      if (career.topReasons && Array.isArray(career.topReasons) && career.topReasons.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.info);
        pdf.text('Why This Fits:', 28, careerYPos);
        careerYPos += 5;

        career.topReasons.forEach((reason) => {
          if (reason && typeof reason === 'string') {
            pdf.setFontSize(8); // 7 * 1.2
            pdf.setFont('helvetica', 'normal');
            setColor(COLORS.darkText);
            const reasonLines = pdf.splitTextToSize(`- ${reason}`, pageWidth - 70);
            pdf.text(reasonLines, 30, careerYPos);
            careerYPos += reasonLines.length * 3;
          }
        });
        careerYPos += 2;
      }

      // Study Path
      if (career.studyPath) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.success);
        pdf.text('Study Path:', 28, careerYPos);
        careerYPos += 5;

        const studyPathText = Array.isArray(career.studyPath) ? career.studyPath.join(' > ') : String(career.studyPath);
        pdf.setFontSize(8); // 7 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        const pathLines = pdf.splitTextToSize(studyPathText, pageWidth - 70);
        pdf.text(pathLines, 30, careerYPos);
        careerYPos += pathLines.length * 3 + 2;
      }

      // First 3 Steps
      if (career.first3Steps && Array.isArray(career.first3Steps) && career.first3Steps.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.warning);
        pdf.text('Get Started:', 28, careerYPos);
        careerYPos += 5;

        career.first3Steps.forEach((step, stepIndex) => {
          if (step && typeof step === 'string') {
            pdf.setFontSize(8); // 7 * 1.2
            pdf.setFont('helvetica', 'normal');
            setColor(COLORS.darkText);
            const stepLines = pdf.splitTextToSize(`${stepIndex + 1}. ${step}`, pageWidth - 70);
            pdf.text(stepLines, 30, careerYPos);
            careerYPos += stepLines.length * 3 + 1;
          }
        });
      }

      // Update card height and draw the card background
      const cardHeight = careerYPos - cardStartY + 5;
      drawCard(20, cardStartY, pageWidth - 40, cardHeight, '#ffffff');
      
      // Redraw all text on top of the card
      pdf.setFontSize(13); // 11 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.darkText);
      pdf.text(career.careerName || 'Career', 28, cardStartY + 8);
      
      // Match badge
      const matchColorRedraw = (career.matchScore || 0) >= 55 ? COLORS.success : (career.matchScore || 0) >= 50 ? COLORS.warning : COLORS.mediumText;
      setColor(matchColorRedraw, false);
      pdf.roundedRect(pageWidth - 50, cardStartY + 3, 20, 8, 2, 2, 'F');
      pdf.setFontSize(11); // 9 * 1.2
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${career.matchScore || 0}%`, pageWidth - 48, cardStartY + 8);

      let textYPos = cardStartY + 15;

      // Confidence
      pdf.setFontSize(8); // 7 * 1.2
      pdf.setFont('helvetica', 'normal');
      setColor(COLORS.mediumText);
      pdf.text(`Confidence: ${career.confidence || 'N/A'}`, 28, textYPos);
      textYPos += 6;

      // Top Reasons
      if (career.topReasons && Array.isArray(career.topReasons) && career.topReasons.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.info);
        pdf.text('Why This Fits:', 28, textYPos);
        textYPos += 5;

        career.topReasons.forEach((reason) => {
          if (reason && typeof reason === 'string') {
            pdf.setFontSize(8); // 7 * 1.2
            pdf.setFont('helvetica', 'normal');
            setColor(COLORS.darkText);
            const reasonLines = pdf.splitTextToSize(`- ${reason}`, pageWidth - 70);
            pdf.text(reasonLines, 30, textYPos);
            textYPos += reasonLines.length * 3;
          }
        });
        textYPos += 2;
      }

      // Study Path
      if (career.studyPath) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.success);
        pdf.text('Study Path:', 28, textYPos);
        textYPos += 5;

        const studyPathText = Array.isArray(career.studyPath) ? career.studyPath.join(' > ') : String(career.studyPath);
        pdf.setFontSize(8); // 7 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        const pathLines = pdf.splitTextToSize(studyPathText, pageWidth - 70);
        pdf.text(pathLines, 30, textYPos);
        textYPos += pathLines.length * 3 + 2;
      }

      // First 3 Steps
      if (career.first3Steps && Array.isArray(career.first3Steps) && career.first3Steps.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.warning);
        pdf.text('Get Started:', 28, textYPos);
        textYPos += 5;

        career.first3Steps.forEach((step, stepIndex) => {
          if (step && typeof step === 'string') {
            pdf.setFontSize(8); // 7 * 1.2
            pdf.setFont('helvetica', 'normal');
            setColor(COLORS.darkText);
            const stepLines = pdf.splitTextToSize(`${stepIndex + 1}. ${step}`, pageWidth - 70);
            pdf.text(stepLines, 30, textYPos);
            textYPos += stepLines.length * 3 + 1;
          }
        });
      }

      yPos = careerYPos + 8;
    });

    yPos += 5;
    });
  }

  // ============ SKILLS & TRAJECTORY ============
  // For grade < 8: Show focused skills first, then detailed skills
  // For grade >= 8: Show simple skill names
  const focusedSkillsRaw = reportData.skillRecommendations || [];
  const detailedSkills = reportData.detailedSkillRecommendations || [];
  
  // For grade >= 8: Parse skillRecommendations - it might be a single string with multiple skills
  let focusedSkills = [];
  if (!isGradeBelow8 && focusedSkillsRaw && Array.isArray(focusedSkillsRaw) && focusedSkillsRaw.length > 0) {
    // Check if first element is a string containing multiple skills
    if (focusedSkillsRaw[0] && typeof focusedSkillsRaw[0] === 'string' && focusedSkillsRaw[0].includes('\n\n')) {
      // Split by double newline to get individual skills
      focusedSkills = focusedSkillsRaw[0].split(/\n\n+/).filter(s => s.trim());
    } else {
      // Already an array of individual skills
      focusedSkills = focusedSkillsRaw;
    }
  } else {
    focusedSkills = focusedSkillsRaw;
  }
  
  // Show focused skills section (for grade < 8) or simple skills (for grade >= 8)
  if ((focusedSkills && Array.isArray(focusedSkills) && focusedSkills.length > 0) || 
      (isGradeBelow8 && detailedSkills && Array.isArray(detailedSkills) && detailedSkills.length > 0)) {
    // For grade >= 8, always start on a new page
    if (!isGradeBelow8) {
      pdf.addPage();
      yPos = 25;
      drawCornerDecor();
    } else if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 25;
      drawCornerDecor();
    }
    
    checkSpace(60);
    
    pdf.setFontSize(22); // 18 * 1.2 (larger for grade < 8)
    pdf.setFont('helvetica', 'bold');
    setColor(isGradeBelow8 ? COLORS.primary : COLORS.purple);
    pdf.text('Skills to Develop', 15, yPos);
    
    pdf.setFontSize(10); // 8 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.mediumText);
    pdf.text(isGradeBelow8 
      ? 'Focus on building foundational skills that will help you explore different areas' 
      : 'Personalized skill development recommendations based on your profile', 15, yPos + 6);
    
    yPos += 18;

    // For grade < 8: Show focused skills first (parse and format like grade >= 8)
    if (isGradeBelow8 && focusedSkills && Array.isArray(focusedSkills) && focusedSkills.length > 0) {
      pdf.setFontSize(16); // 13 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.primary);
      pdf.text('Focused Skills', 15, yPos);
      yPos += 10;

      focusedSkills.forEach((skill, index) => {
        if (!skill || typeof skill !== 'string') return;
        checkSpace(50);
        
        const cardStartY = yPos;
        
        // Parse skill string to extract name and details
        const lines = skill.split('\n').filter(line => line.trim());
        // Handle format: "Skill Name: Logical Thinking" or "1. Logical Thinking" or just "Logical Thinking"
        let skillNameRaw = '';
        if (lines[0]) {
          const firstLine = lines[0].trim();
          // Check for "Skill Name: " prefix
          if (firstLine.startsWith('Skill Name:')) {
            skillNameRaw = firstLine.replace(/^Skill Name:\s*/, '').trim();
          } else {
            // Remove numbering if present
            skillNameRaw = firstLine.replace(/^\d+\.\s*/, '').trim();
          }
        }
        const skillName = `${index + 1}. ${skillNameRaw}`;
        
        // Parse details (Category, Importance Level, Development Method, Timeline)
        const details = {};
        let currentKey = '';
        let currentValue = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Match format: "Category: Academic" or "Importance Level: Critical" (no markdown)
          const simpleMatch = line.match(/^(Category|Importance Level|Timeline):\s*(.+)$/);
          if (simpleMatch) {
            // Save previous key-value if exists
            if (currentKey && currentValue) {
              details[currentKey] = currentValue.trim();
            }
            currentKey = simpleMatch[1].trim();
            currentValue = simpleMatch[2].trim();
          }
          // Match format: "Development Method:" followed by content (may have newlines and bullets)
          else if (line.startsWith('Development Method:')) {
            // Save previous key-value if exists
            if (currentKey && currentValue) {
              details[currentKey] = currentValue.trim();
            }
            currentKey = 'Development Method';
            currentValue = line.replace(/^Development Method:\s*/, '').trim();
          }
          // Match markdown format: - **Category**: Technical or - **Importance Level**: Critical
          else {
            const match = line.match(/^-\s*\*\*([^*]+)\*\*:\s*(.+)$/);
            if (match) {
              // Save previous key-value if exists
              if (currentKey && currentValue) {
                details[currentKey] = currentValue.trim();
              }
              currentKey = match[1].trim();
              currentValue = match[2].trim();
            } else {
              // Try alternative format without leading hyphen
              const altMatch = line.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);
              if (altMatch) {
                // Save previous key-value if exists
                if (currentKey && currentValue) {
                  details[currentKey] = currentValue.trim();
                }
                currentKey = altMatch[1].trim();
                currentValue = altMatch[2].trim();
              } else if (currentKey === 'Development Method') {
                // Continue building Development Method value (may have bullets or newlines)
                currentValue += '\n' + line;
              }
            }
          }
        }
        
        // Save last key-value
        if (currentKey && currentValue) {
          details[currentKey] = currentValue.trim();
        }
        
        // Card dimensions with increased padding (same as detailed career explanations)
        const cardPadding = 10; // Increased padding from card border
        const cardX = 20;
        const cardWidth = pageWidth - 40;
        const textX = cardX + cardPadding;
        const textWidth = cardWidth - (cardPadding * 2);
        
        // Calculate title height (skill name)
        pdf.setFontSize(12); // 10 * 1.2 (skill name)
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(skillName, textWidth);
        const titleHeight = titleLines.length * 4.5;
        
        // Build formatted content with line breaks
        let contentLines = [];
        if (details['Category']) {
          contentLines.push(`Category: ${details['Category']}\n`);
        }
        if (details['Importance Level']) {
          contentLines.push(`Importance Level: ${details['Importance Level']}\n`);
        }
        if (details['Development Method']) {
          contentLines.push(`How to Develop: ${details['Development Method']}\n`);
        }
        if (details['Timeline']) {
          contentLines.push(`Timeline: ${details['Timeline']}\n`);
        }
        
        // If no details parsed, show simple skill name
        if (contentLines.length === 0) {
          contentLines.push(skillNameRaw);
        }
        
        // Calculate content height - split by newlines first, then by width
        pdf.setFontSize(8); // 7 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        let contentHeight = 0;
        const formattedContent = contentLines.join(''); // Join with empty string since each line already has \n
        if (formattedContent) {
          // Split by newlines first to preserve intentional line breaks
          const linesByNewline = formattedContent.split('\n').filter(line => line.trim());
          let totalLines = 0;
          linesByNewline.forEach(line => {
            const wrappedLines = pdf.splitTextToSize(line, textWidth);
            totalLines += wrappedLines.length;
          });
          contentHeight = totalLines * 3.5;
        }
        
        // Calculate total card height with proper padding (same as detailed career explanations)
        const titleY = cardStartY + cardPadding;
        const contentY = titleY + titleHeight + 8; // Increased spacing between title and content
        const cardHeight = Math.max(50, contentY + contentHeight + cardPadding - cardStartY);
        
        drawCard(cardX, cardStartY, cardWidth, cardHeight, '#ffffff');
        
        // Draw text
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, textX, titleY);
        
        // Render content with proper newlines
        if (formattedContent) {
          pdf.setFontSize(8); // 7 * 1.2
          pdf.setFont('helvetica', 'normal');
          setColor(COLORS.mediumText);
          
          // Split by newlines first to preserve intentional line breaks
          const linesByNewline = formattedContent.split('\n').filter(line => line.trim());
          let currentY = contentY;
          linesByNewline.forEach(line => {
            const wrappedLines = pdf.splitTextToSize(line, textWidth);
            pdf.text(wrappedLines, textX, currentY);
            currentY += wrappedLines.length * 3.5;
          });
        }
        
        yPos += cardHeight + 8; // Spacing between cards
      });
      
      yPos += 10;
    }
    
    // For grade < 8: Show detailed skills with headings
    if (isGradeBelow8 && detailedSkills && Array.isArray(detailedSkills) && detailedSkills.length > 0) {
      pdf.setFontSize(16); // 13 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.primary);
      pdf.text('Detailed Skill Explanations', 15, yPos);
      yPos += 10;

      detailedSkills.forEach((skillItem, index) => {
        if (!skillItem) return;
        
        let skillName = (typeof skillItem === 'object' && skillItem !== null) 
          ? (skillItem.skill_name || skillItem.skillName || '') 
          : '';
        const explanation = (typeof skillItem === 'object' && skillItem !== null) 
          ? (skillItem.explanation || '') 
          : String(skillItem);
        
        // If skillName is "Skill Name" (placeholder), extract from explanation
        if (skillName === 'Skill Name' || !skillName || skillName.trim() === '') {
          // Try to extract skill name from explanation (first sentence or first line)
          const explText = String(explanation || '').trim();
          if (explText) {
            // Pattern: "Skill Name helps you..." or "**Skill Name** helps you..."
            const matchBold = explText.match(/^\*\*([^*]+)\*\*/);
            if (matchBold) {
              skillName = matchBold[1].trim();
            } else {
              // Pattern: First word or phrase before "helps" or first sentence
              const matchHelps = explText.match(/^([^.!?\n]+?)(?:\s+helps|\s+helps you|\.|!|\?)/);
              if (matchHelps) {
                skillName = matchHelps[1].trim();
              } else {
                // Take first line or first sentence
                const firstLine = explText.split('\n')[0].split(/[.!?]/)[0].trim();
                if (firstLine && firstLine.length < 50) {
                  skillName = firstLine;
                }
              }
            }
          }
        }
        
        if (!skillName || typeof skillName !== 'string' || skillName.trim() === '') return;
        checkSpace(40);
        
        const cardStartY = yPos;
        
        // Card dimensions with increased padding
        const cardPadding = 10; // Increased padding from card border
        const cardX = 20;
        const cardWidth = pageWidth - 40;
        const textX = cardX + cardPadding;
        const textWidth = cardWidth - (cardPadding * 2);
        
        // Calculate title height
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(skillName, textWidth);
        const titleHeight = titleLines.length * 5;
        
        // Calculate explanation height
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        const explLines = pdf.splitTextToSize(String(explanation || ''), textWidth);
        const explHeight = explLines.length * 4;
        
        // Calculate total card height with proper padding
        const titleY = cardStartY + cardPadding;
        const contentY = titleY + titleHeight + 8; // Increased spacing between title and content
        const cardHeight = Math.max(50, contentY + explHeight + cardPadding - cardStartY);
        
        drawCard(cardX, cardStartY, cardWidth, cardHeight, '#ffffff');
        
        // Redraw text on top
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, textX, titleY);
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        pdf.text(explLines, textX, contentY);
        
        yPos += cardHeight + 8;
      });
    } else if (!isGradeBelow8 && focusedSkills && Array.isArray(focusedSkills) && focusedSkills.length > 0) {
      // For grade >= 8: Parse and show formatted skill cards
      focusedSkills.forEach((skill, index) => {
        if (!skill || typeof skill !== 'string') return;
        
        // Check if we need a new page
        checkSpace(35);
        
        const cardStartY = yPos;
        
        // Parse skill string to extract name and details
        const lines = skill.split('\n').filter(line => line.trim());
        const skillNameRaw = lines[0] ? lines[0].replace(/^\d+\.\s*/, '').trim() : '';
        const skillName = `${index + 1}. ${skillNameRaw}`;
        
        // Parse details (Category, Importance Level, Development Method, Timeline)
        const details = {};
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          // Match format: - **Category**: Technical or - **Importance Level**: Critical
          // Also handle lines with leading spaces: "   - **Category**: Technical"
          const match = line.match(/^-\s*\*\*([^*]+)\*\*:\s*(.+)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            details[key] = value;
          } else {
            // Try alternative format without leading hyphen (in case it's already removed)
            const altMatch = line.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);
            if (altMatch) {
              const key = altMatch[1].trim();
              const value = altMatch[2].trim();
              details[key] = value;
            }
          }
        }
        
        // Debug: Log if no details found
        if (Object.keys(details).length === 0 && lines.length > 1) {
          console.log('No details parsed for skill:', skillName);
          console.log('Lines:', lines.slice(1, 5));
        }
        
        // Card dimensions with minimal padding
        const cardPadding = 8; // Reduced padding
        const cardX = 15;
        const cardWidth = pageWidth - 30;
        const textX = cardX + cardPadding;
        const textWidth = cardWidth - (cardPadding * 2);
        
        // Calculate title height (skill name)
        pdf.setFontSize(12); // 10 * 1.2 (skill name)
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(skillName, textWidth);
        const titleHeight = titleLines.length * 4.5;
        
        // Build formatted content with line breaks
        let contentLines = [];
        if (details['Category']) {
          contentLines.push(`Category: ${details['Category']}\n`);
        }
        if (details['Importance Level']) {
          contentLines.push(`Importance Level: ${details['Importance Level']}\n`);
        }
        if (details['Development Method']) {
          contentLines.push(`How to Develop: ${details['Development Method']}\n`);
        }
        if (details['Timeline']) {
          contentLines.push(`Timeline: ${details['Timeline']}\n`);
        }
        
        // If no details parsed, try to show raw lines (fallback)
        if (contentLines.length === 0 && lines.length > 1) {
          // Show all lines except the first (skill name) as raw content
          const rawContent = lines.slice(1).join('\n\n');
          contentLines.push(rawContent);
        }
        
        // Calculate content height - split by newlines first, then by width
        pdf.setFontSize(8); // 7 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        let contentHeight = 0;
        const formattedContent = contentLines.join(''); // Join with empty string since each line already has \n
        if (formattedContent) {
          // Split by newlines first to preserve intentional line breaks
          const linesByNewline = formattedContent.split('\n').filter(line => line.trim());
          let totalLines = 0;
          linesByNewline.forEach(line => {
            const wrappedLines = pdf.splitTextToSize(line, textWidth);
            totalLines += wrappedLines.length;
          });
          contentHeight = totalLines * 3.5;
        }
        
        // Calculate total card height with minimal padding
        const titleY = cardStartY + cardPadding;
        const contentY = titleY + titleHeight + 5; // Reduced spacing
        const cardHeight = Math.max(35, contentY + contentHeight + cardPadding - cardStartY);
        
        drawCard(cardX, cardStartY, cardWidth, cardHeight, '#ffffff');
        
        // Draw text
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, textX, titleY);
        
        // Render content with proper newlines
        if (formattedContent) {
          pdf.setFontSize(8); // 7 * 1.2
          pdf.setFont('helvetica', 'normal');
          setColor(COLORS.mediumText);
          
          // Split by newlines first to preserve intentional line breaks
          const linesByNewline = formattedContent.split('\n').filter(line => line.trim());
          let currentY = contentY;
          linesByNewline.forEach(line => {
            const wrappedLines = pdf.splitTextToSize(line, textWidth);
            pdf.text(wrappedLines, textX, currentY);
            currentY += wrappedLines.length * 3.5;
          });
        }
        
        yPos += cardHeight + 5; // Reduced spacing between cards
      });
    }
    
    yPos += 10;
  }

  if (reportData.careerTrajectoryInsights && typeof reportData.careerTrajectoryInsights === 'string') {
    // Calculate trajectory card height dynamically
    pdf.setFontSize(11); // 9 * 1.2
    pdf.setFont('helvetica', 'normal');
    const trajectoryLines = pdf.splitTextToSize(reportData.careerTrajectoryInsights, pageWidth - 50);
    const trajectoryHeight = Math.max(50, trajectoryLines.length * 4 + 30); // Dynamic height with padding
    
    checkSpace(trajectoryHeight + 10);
    
    const cardStartY = yPos;
    
    drawCard(15, cardStartY, pageWidth - 30, trajectoryHeight, COLORS.lightBg);
    
    // Title
    drawIconCircle(25, cardStartY + 10, 6, COLORS.teal);
    pdf.setFontSize(17); // 14 * 1.2
    pdf.setFont('helvetica', 'bold');
    setColor(COLORS.teal);
    const trajectoryTitle = isGradeBelow8 ? 'Skill Development Journey' : 'Career Trajectory Insights';
    const titleLines = pdf.splitTextToSize(trajectoryTitle, pageWidth - 50);
    pdf.text(titleLines, 37, cardStartY + 12);
    
    // Content
    pdf.setFontSize(11); // 9 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.darkText);
    const contentStartY = cardStartY + 12 + (titleLines.length * 4) + 5;
    pdf.text(trajectoryLines, 20, contentStartY);
    
    yPos += trajectoryHeight + 10;
  }

  // ============ DETAILED CAREER INSIGHTS (Skip for grade < 8) ============
  // Only show detailed career insights for grade >= 8
  if (!isGradeBelow8 && reportData.detailedCareerInsights && typeof reportData.detailedCareerInsights === 'object') {
    if (reportData.detailedCareerInsights.explanations && typeof reportData.detailedCareerInsights.explanations === 'object') {
      checkSpace(60);
      
      pdf.setFontSize(19); // 16 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.info);
      pdf.text('Detailed Career Explanations', 15, yPos);
      yPos += 12;
      
      const explanations = Object.entries(reportData.detailedCareerInsights.explanations);
      explanations.forEach(([career, explanation], index) => {
        if (!career || typeof career !== 'string') return;
        checkSpace(40);
        
        const cardStartY = yPos;
        
        // Card dimensions with increased padding
        const cardPadding = 20; // Increased padding from card border
        const cardX = 20;
        const cardWidth = pageWidth - 40;
        const textX = cardX + cardPadding;
        const textWidth = cardWidth - (cardPadding * 2);
        
        // Calculate title height
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(career, textWidth);
        const titleHeight = titleLines.length * 5;
        
        // Calculate explanation height
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        const explLines = pdf.splitTextToSize(String(explanation || ''), textWidth);
        const explHeight = explLines.length * 4;
        
        // Calculate total card height with proper padding
        const titleY = cardStartY + cardPadding;
        const contentY = titleY + titleHeight + 8; // Increased spacing between title and content
        const cardHeight = Math.max(50, contentY + explHeight + cardPadding - cardStartY);
        
        drawCard(cardX, cardStartY, cardWidth, cardHeight, '#ffffff');
        
        // Redraw text on top
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, textX, titleY);
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        pdf.text(explLines, textX, contentY);
        
        yPos += cardHeight + 8;
      });
      
      yPos += 5;
    }

    if (reportData.detailedCareerInsights.studyPaths && typeof reportData.detailedCareerInsights.studyPaths === 'object') {
      checkSpace(60);
      
      pdf.setFontSize(19); // 16 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.success);
      pdf.text('Personalized Study Paths', 15, yPos);
      yPos += 12;
      
      const studyPaths = Object.entries(reportData.detailedCareerInsights.studyPaths);
      studyPaths.forEach(([career, path], index) => {
        if (!career || typeof career !== 'string') return;
        checkSpace(50);
        
        const cardStartY = yPos;
        
        // Card dimensions with increased padding
        const cardPadding = 20; // Increased padding from card border
        const cardX = 20;
        const cardWidth = pageWidth - 40;
        const textX = cardX + cardPadding;
        const textWidth = cardWidth - (cardPadding * 2);
        
        // Calculate title height
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(career, textWidth);
        const titleHeight = titleLines.length * 5;
        
        // Calculate path height
        let pathHeight = 0;
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        if (Array.isArray(path)) {
          path.forEach((step) => {
            if (step && typeof step === 'string') {
              const stepLines = pdf.splitTextToSize(`${step}`, textWidth - 15); // Account for numbering
              pathHeight += stepLines.length * 4.5;
            }
          });
        } else {
          const pathLines = pdf.splitTextToSize(String(path || ''), textWidth);
          pathHeight = pathLines.length * 4;
        }
        
        // Calculate total card height with proper padding
        const titleY = cardStartY + cardPadding;
        const contentY = titleY + titleHeight + 8; // Increased spacing between title and content
        const cardHeight = Math.max(50, contentY + pathHeight + cardPadding - cardStartY);
        
        drawCard(cardX, cardStartY, cardWidth, cardHeight, '#ffffff');
        
        // Redraw text on top
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, textX, titleY);
        
        let textY = contentY;
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        
        if (Array.isArray(path)) {
          path.forEach((step, stepIndex) => {
            if (step && typeof step === 'string') {
              const stepLines = pdf.splitTextToSize(`${stepIndex + 1}. ${step}`, textWidth);
              pdf.text(stepLines, textX, textY);
              textY += stepLines.length * 4.5;
            }
          });
        } else {
          const pathLines = pdf.splitTextToSize(String(path || ''), textWidth);
          pdf.text(pathLines, textX, textY);
        }
        
        yPos += cardHeight + 8;
      });
      
      yPos += 10;
    }
  }

  // ============ NEXT STEPS ============
  pdf.addPage();
  yPos = 25;
  drawCornerDecor();

  pdf.setFontSize(22); // 18 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.primary);
  pdf.text('Your Action Plan', 15, yPos);
  
  pdf.setFontSize(10); // 8 * 1.2
  pdf.setFont('helvetica', 'normal');
  setColor(COLORS.mediumText);
  pdf.text('Follow these steps to turn your dreams into reality', 15, yPos + 6);

  yPos += 18;

  // Use AI-generated action plan if available, otherwise fallback to hardcoded
  const actionPlan = reportData.actionPlan || [];
  const nextSteps = actionPlan.length > 0 ? actionPlan : (isGradeBelow8 ? [
    { title: "Build Foundational Skills", desc: "Focus on developing core skills in subjects you enjoy. Practice regularly through fun activities, games, and hands-on projects.", timeline: "Ongoing", color: COLORS.info },
    { title: "Explore Different Areas", desc: "Try different activities and hobbies to discover what interests you most. Join clubs, participate in school activities, and explore new subjects.", timeline: "This month", color: COLORS.success },
    { title: "Practice Through Projects", desc: "Engage in hands-on projects that interest you. Build things, create art, solve puzzles, or work on collaborative projects with friends.", timeline: "Next 2 weeks", color: COLORS.warning },
    { title: "Develop Communication Skills", desc: "Practice expressing your ideas through writing, speaking, and presentations. Join debate clubs, writing groups, or drama activities.", timeline: "This month", color: COLORS.purple },
    { title: "Keep Learning and Growing", desc: "Continue building your skills through practice and exploration. Every small step counts toward your growth and discovery.", timeline: "Ongoing", color: COLORS.teal }
  ] : [
    { title: "Explore Career Details", desc: "Research your top 3-5 career recommendations in depth. Understand daily responsibilities, growth opportunities, and industry trends.", timeline: "This week", color: COLORS.info },
    { title: "Educational Pathway Planning", desc: "Research educational requirements, courses, and institutions that align with your career choices. Plan your subject selection for upcoming grades.", timeline: "Next 2 weeks", color: COLORS.success },
    { title: "Professional Networking", desc: "Connect with professionals in your areas of interest through LinkedIn, career events, or through family connections. Conduct informational interviews.", timeline: "This month", color: COLORS.warning },
    { title: "Gain Experience", desc: "Look for internships, job shadowing opportunities, or volunteer work in your fields of interest. Consider joining relevant clubs or competitions.", timeline: "Next 3 months", color: COLORS.purple },
    { title: "Skill Development", desc: "Identify and develop key skills relevant to your top career choices. Take online courses, attend workshops, or start personal projects.", timeline: "Ongoing", color: COLORS.teal }
  ]);
  
  // Assign colors based on index if not already assigned
  const colorPalette = [COLORS.info, COLORS.success, COLORS.warning, COLORS.purple, COLORS.teal];
  nextSteps.forEach((step, index) => {
    if (!step.color) {
      step.color = colorPalette[index % colorPalette.length];
    }
  });

  nextSteps.forEach((step, index) => {
    checkSpace(40);
    
    const cardStartY = yPos;
    
    // Calculate card height first
    pdf.setFontSize(10); // 8 * 1.2
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(step.desc, pageWidth - 60);
    const stepHeight = descLines.length * 3.5 + 28;
    
    drawCard(15, cardStartY, pageWidth - 30, stepHeight, '#ffffff');
    
    // Redraw all content on top
    drawIconCircle(25, cardStartY + 12, 6, step.color);
    
    // Step number badge
    setColor(step.color, false);
    pdf.roundedRect(pageWidth - 40, cardStartY + 7, 10, 10, 2, 2, 'F');
    pdf.setFontSize(12); // 10 * 1.2
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${index + 1}`, pageWidth - 37, cardStartY + 13);
    
    // Title
    pdf.setFontSize(13); // 11 * 1.2
    pdf.setFont('helvetica', 'bold');
    setColor(COLORS.darkText);
    pdf.text(step.title, 37, cardStartY + 12);
    
    // Timeline badge
    pdf.setFontSize(8); // 7 * 1.2
    pdf.setFont('helvetica', 'normal');
    const timelineTextWidth = pdf.getTextWidth(step.timeline);
    const timelineWidth = timelineTextWidth + 8; // Add proper padding
    setColor(step.color, false);
    pdf.roundedRect(37, cardStartY + 16, timelineWidth, 5, 1, 1, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.text(step.timeline, 39, cardStartY + 19);
    
    // Description
    pdf.setFontSize(10); // 8 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.mediumText);
    pdf.text(descLines, 20, cardStartY + 26);
    
    yPos += stepHeight + 8;
  });

  // Footer message
  yPos += 10;
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = 25;
    drawCornerDecor();
  }

  const msgCardY = yPos;
  drawCard(15, msgCardY, pageWidth - 30, 30, COLORS.lightBg);
  
  pdf.setFontSize(14); // 12 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.primary);
  pdf.text('Remember', pageWidth / 2, msgCardY + 12, { align: 'center' });
  
  pdf.setFontSize(11); // 9 * 1.2
  pdf.setFont('helvetica', 'italic');
  setColor(COLORS.mediumText);
  pdf.text('Every expert was once a beginner. Your journey starts now!', pageWidth / 2, msgCardY + 20, { align: 'center' });

  // Add page numbers and footer to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Page number
    pdf.setFontSize(10); // 8 * 1.2
    setColor(COLORS.lightText);
    pdf.text(`${i}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Footer brand
    pdf.setFontSize(8); // 7 * 1.2
    pdf.text('Generated by Naviksha AI', pageWidth - 15, pageHeight - 8, { align: 'right' });
    pdf.text('Your Career Guide', 15, pageHeight - 8);
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
    
    // Generate PDF using same enhanced logic as frontend
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
