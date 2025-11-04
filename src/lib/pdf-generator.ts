/**
 * Enhanced PDF Generation Utility with Beautiful Design
 * Colorful, engaging career report PDFs with icons, diagrams, and modern styling
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
  skillRecommendations?: string[]; // Focused skill names
  detailedSkillRecommendations?: Array<{skill_name?: string; skillName?: string; explanation?: string}>; // For grade < 8: [{skill_name, explanation}]
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

export function generateReportPDF(reportData: ReportData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 0;

  // Helper: Draw decorative corner elements
  const drawCornerDecor = () => {
    pdf.setDrawColor(COLORS.primary);
    pdf.setLineWidth(0.5);
    // Top left
    pdf.line(10, 10, 20, 10);
    pdf.line(10, 10, 10, 20);
    // Top right
    pdf.line(pageWidth - 20, 10, pageWidth - 10, 10);
    pdf.line(pageWidth - 10, 10, pageWidth - 10, 20);
  };

  // Helper: Draw rounded rectangle
  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fillColor?: string, strokeColor?: string) => {
    if (fillColor) {
      const [red, green, blue] = hexToRgb(fillColor);
      pdf.setFillColor(red, green, blue);
    }
    if (strokeColor) {
      const [red, green, blue] = hexToRgb(strokeColor);
      pdf.setDrawColor(red, green, blue);
    }
    pdf.roundedRect(x, y, w, h, r, r, fillColor ? 'FD' : 'S');
  };

  // Helper: Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Helper: Set color from hex
  const setColor = (hex: string, isText: boolean = true) => {
    const [r, g, b] = hexToRgb(hex);
    if (isText) {
      pdf.setTextColor(r, g, b);
    } else {
      pdf.setFillColor(r, g, b);
    }
  };

  // Helper: Add card with shadow effect
  const drawCard = (x: number, y: number, w: number, h: number | 'auto', bgColor: string = '#ffffff') => {
    if (h === 'auto') return; // Height will be calculated later
    // Shadow
    pdf.setFillColor(220, 220, 230);
    pdf.roundedRect(x + 1, y + 1, w, h, 3, 3, 'F');
    // Card
    setColor(bgColor, false);
    pdf.roundedRect(x, y, w, h, 3, 3, 'F');
  };

  // Helper: Add icon circle (without emoji - use solid color circles instead)
  const drawIconCircle = (x: number, y: number, radius: number, color: string) => {
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
  const drawProgressBar = (x: number, y: number, width: number, percentage: number, color: string) => {
    // Background
    pdf.setFillColor(240, 240, 245);
    pdf.roundedRect(x, y, width, 4, 2, 2, 'F');
    // Fill
    setColor(color, false);
    const fillWidth = (width * percentage) / 100;
    pdf.roundedRect(x, y, fillWidth, 4, 2, 2, 'F');
  };

  // Helper: Check page space and add new page if needed
  const checkSpace = (needed: number) => {
    if (yPos + needed > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
      drawCornerDecor();
      return true;
    }
    return false;
  };

  // Helper: Add text with wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 9, color: string = COLORS.darkText, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    setColor(color);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * fontSize * 0.4;
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
  pdf.text(reportData.studentName, 35, 143);
  
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
  
  // Calculate summary text height dynamically
  pdf.setFontSize(11); // 9 * 1.2
  pdf.setFont('helvetica', 'normal');
  const summaryText = reportData.enhancedSummary || reportData.summaryParagraph || 'Your personalized career analysis is being generated based on your assessment responses.';
  const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - 50);
  const summaryHeight = Math.max(45, summaryLines.length * 4 + 25); // Dynamic height based on content
  
  drawCard(15, yPos, pageWidth - 30, summaryHeight, COLORS.lightBg);
  
  drawIconCircle(25, yPos + 10, 6, COLORS.info);
  pdf.setFontSize(17); // 14 * 1.2
  pdf.setFont('helvetica', 'bold');
  setColor(COLORS.info);
  
  // Wrap title if too long for grade < 8
  const summaryTitle = isGradeBelow8 ? 'Skill Development Profile Summary' : 'Career Profile Summary';
  pdf.setFontSize(17); // 14 * 1.2
  const titleLines = pdf.splitTextToSize(summaryTitle, pageWidth - 50);
  pdf.text(titleLines, 37, yPos + 12);

  pdf.setFontSize(11); // 9 * 1.2
  pdf.setFont('helvetica', 'normal');
  setColor(COLORS.darkText);
  pdf.text(summaryLines, 20, yPos + 22);

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
  const cardWidth = (pageWidth - 40) / 2 - 5;
  const cardHeight = 35;

  entries.forEach(([key, value], index) => {
    const config = RIASEC_CONFIG[key as keyof typeof RIASEC_CONFIG];
    const score = Number(value) || 0;
    
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 15 + col * (cardWidth + 10);
    const y = yPos + row * (cardHeight + 8);

    checkSpace(cardHeight + 10);

    // Card
    drawCard(x, y, cardWidth, cardHeight, '#ffffff');
    
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
    pdf.text(`${score}%`, x + cardWidth - 25, y + 13);
    
    // Description
    pdf.setFontSize(8); // 7 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.mediumText);
    const descLines = pdf.splitTextToSize(config.desc, cardWidth - 25);
    pdf.text(descLines, x + 10, y + 21);
    
    // Progress bar
    drawProgressBar(x + 10, y + cardHeight - 8, cardWidth - 20, score, config.color);
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
    checkSpace(70);
    
    const bucketColor = bucketColors[bucketIndex % bucketColors.length];
    
    // Bucket header card
    drawCard(15, yPos, pageWidth - 30, 20, bucketColor);
    
    pdf.setFontSize(14); // 12 * 1.2
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${bucketIndex + 1}. ${bucket.bucketName}`, 22, yPos + 10);
    
    pdf.setFontSize(17); // 14 * 1.2
    pdf.text(`${bucket.bucketScore}%`, pageWidth - 35, yPos + 10);
    
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
      checkSpace(55);
      
      // Career card background will be drawn at the end
      const cardStartY = yPos;
      
      // Career name and score
      pdf.setFontSize(13); // 11 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.darkText);
      pdf.text(career.careerName, 28, yPos + 8);
      
      // Match badge
      const matchColor = career.matchScore >= 55 ? COLORS.success : career.matchScore >= 50 ? COLORS.warning : COLORS.mediumText;
      setColor(matchColor, false);
      pdf.roundedRect(pageWidth - 50, yPos + 3, 20, 8, 2, 2, 'F');
      pdf.setFontSize(11); // 9 * 1.2
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${career.matchScore}%`, pageWidth - 48, yPos + 8);

      let careerYPos = yPos + 15;

      // Confidence
      pdf.setFontSize(8); // 7 * 1.2
      pdf.setFont('helvetica', 'normal');
      setColor(COLORS.mediumText);
      pdf.text(`Confidence: ${career.confidence || 'N/A'}`, 28, careerYPos);
      careerYPos += 6;

      // Top Reasons
      if (career.topReasons && career.topReasons.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.info);
        pdf.text('Why This Fits:', 28, careerYPos);
        careerYPos += 5;

        career.topReasons.forEach((reason: string) => {
          pdf.setFontSize(8); // 7 * 1.2
          pdf.setFont('helvetica', 'normal');
          setColor(COLORS.darkText);
          const reasonLines = pdf.splitTextToSize(`- ${reason}`, pageWidth - 70);
          pdf.text(reasonLines, 30, careerYPos);
          careerYPos += reasonLines.length * 3;
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

        const studyPathText = Array.isArray(career.studyPath) ? career.studyPath.join(' > ') : career.studyPath;
        pdf.setFontSize(8); // 7 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        const pathLines = pdf.splitTextToSize(studyPathText, pageWidth - 70);
        pdf.text(pathLines, 30, careerYPos);
        careerYPos += pathLines.length * 3 + 2;
      }

      // First 3 Steps
      if (career.first3Steps && career.first3Steps.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.warning);
        pdf.text('Get Started:', 28, careerYPos);
        careerYPos += 5;

        career.first3Steps.forEach((step: string, stepIndex: number) => {
          pdf.setFontSize(8); // 7 * 1.2
          pdf.setFont('helvetica', 'normal');
          setColor(COLORS.darkText);
          const stepLines = pdf.splitTextToSize(`${stepIndex + 1}. ${step}`, pageWidth - 70);
          pdf.text(stepLines, 30, careerYPos);
          careerYPos += stepLines.length * 3 + 1;
        });
      }

      // Update card height and draw the card background
      const cardHeight = careerYPos - cardStartY + 5;
      drawCard(20, cardStartY, pageWidth - 40, cardHeight, '#ffffff');
      
      // Redraw all text on top of the card
      pdf.setFontSize(13); // 11 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.darkText);
      pdf.text(career.careerName, 28, cardStartY + 8);
      
      // Match badge
      const matchColorRedraw = career.matchScore >= 55 ? COLORS.success : career.matchScore >= 50 ? COLORS.warning : COLORS.mediumText;
      setColor(matchColorRedraw, false);
      pdf.roundedRect(pageWidth - 50, cardStartY + 3, 20, 8, 2, 2, 'F');
      pdf.setFontSize(11); // 9 * 1.2
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${career.matchScore}%`, pageWidth - 48, cardStartY + 8);

      let textYPos = cardStartY + 15;

      // Confidence
      pdf.setFontSize(8); // 7 * 1.2
      pdf.setFont('helvetica', 'normal');
      setColor(COLORS.mediumText);
      pdf.text(`Confidence: ${career.confidence || 'N/A'}`, 28, textYPos);
      textYPos += 6;

      // Top Reasons
      if (career.topReasons && career.topReasons.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.info);
        pdf.text('Why This Fits:', 28, textYPos);
        textYPos += 5;

        career.topReasons.forEach((reason: string) => {
          pdf.setFontSize(8); // 7 * 1.2
          pdf.setFont('helvetica', 'normal');
          setColor(COLORS.darkText);
          const reasonLines = pdf.splitTextToSize(`- ${reason}`, pageWidth - 70);
          pdf.text(reasonLines, 30, textYPos);
          textYPos += reasonLines.length * 3;
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

        const studyPathText = Array.isArray(career.studyPath) ? career.studyPath.join(' > ') : career.studyPath;
        pdf.setFontSize(8); // 7 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        const pathLines = pdf.splitTextToSize(studyPathText, pageWidth - 70);
        pdf.text(pathLines, 30, textYPos);
        textYPos += pathLines.length * 3 + 2;
      }

      // First 3 Steps
      if (career.first3Steps && career.first3Steps.length > 0) {
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.warning);
        pdf.text('Get Started:', 28, textYPos);
        textYPos += 5;

        career.first3Steps.forEach((step: string, stepIndex: number) => {
          pdf.setFontSize(8); // 7 * 1.2
          pdf.setFont('helvetica', 'normal');
          setColor(COLORS.darkText);
          const stepLines = pdf.splitTextToSize(`${stepIndex + 1}. ${step}`, pageWidth - 70);
          pdf.text(stepLines, 30, textYPos);
          textYPos += stepLines.length * 3 + 1;
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
  const focusedSkills = reportData.skillRecommendations || [];
  const detailedSkills = reportData.detailedSkillRecommendations || [];
  
  // Show focused skills section (for grade < 8) or simple skills (for grade >= 8)
  if (focusedSkills.length > 0 || (isGradeBelow8 && detailedSkills.length > 0)) {
    if (yPos > pageHeight - 40 || !isGradeBelow8) {
      pdf.addPage();
      yPos = 25;
      drawCornerDecor();
    }
    
    checkSpace(60);
    
    pdf.setFontSize(22); // 18 * 1.2 (larger for grade < 8)
    pdf.setFont('helvetica', 'bold');
    setColor(isGradeBelow8 ? COLORS.primary : COLORS.purple);
    pdf.text(isGradeBelow8 ? 'Recommended Skills to Develop' : 'AI-Recommended Skills to Develop', 15, yPos);
    
    pdf.setFontSize(10); // 8 * 1.2
    pdf.setFont('helvetica', 'normal');
    setColor(COLORS.mediumText);
    pdf.text(isGradeBelow8 
      ? 'Focus on building foundational skills that will help you explore different areas' 
      : 'Personalized skill development recommendations based on your profile', 15, yPos + 6);
    
    yPos += 18;

    // For grade < 8: Show focused skills first (simple names)
    if (isGradeBelow8 && focusedSkills.length > 0) {
      pdf.setFontSize(16); // 13 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.primary);
      pdf.text('Focused Skills', 15, yPos);
      yPos += 10;

      focusedSkills.forEach((skill: string, index: number) => {
        checkSpace(20);
        
        const cardY = yPos;
        drawCard(20, cardY, pageWidth - 40, 15, '#ffffff');
        
        // Colored indicator dot
        setColor([COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.teal][index % 5], false);
        pdf.circle(26, cardY + 6, 1.5, 'F');
        
        // Skill name
        pdf.setFontSize(11); // 9 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(skill, 40, cardY + 8);
        
        yPos += 18;
      });
      
      yPos += 10;
    }
    
    // For grade < 8: Show detailed skills with headings
    if (isGradeBelow8 && detailedSkills.length > 0) {
      pdf.setFontSize(16); // 13 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.primary);
      pdf.text('Detailed Skill Explanations', 15, yPos);
      yPos += 10;

      detailedSkills.forEach((skillItem: any, index: number) => {
        const skillName = typeof skillItem === 'object' ? (skillItem.skill_name || skillItem.skillName || '') : '';
        const explanation = typeof skillItem === 'object' ? (skillItem.explanation || '') : String(skillItem);
        
        if (!skillName && !explanation) return;
        
        checkSpace(30);
        
        const cardStartY = yPos;
        
        // Calculate title height (same as career explanations)
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(skillName, pageWidth - 60);
        const titleHeight = titleLines.length * 4;
        
        // Calculate explanation height (same as career explanations)
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        const explLines = pdf.splitTextToSize(String(explanation || ''), pageWidth - 60);
        const explHeight = explLines.length * 3.5;
        
        const cardHeight = titleHeight + explHeight + 12;
        drawCard(20, cardStartY, pageWidth - 40, cardHeight, '#ffffff');
        
        // Redraw text on top (same as career explanations)
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, 28, cardStartY + 8);
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        pdf.text(explLines, 28, cardStartY + 8 + titleHeight + 2);
        
        yPos += cardHeight + 8;
      });
    } else if (!isGradeBelow8 && focusedSkills.length > 0) {
      // For grade >= 8: Show simple skill names
      focusedSkills.forEach((skill: string, index: number) => {
        checkSpace(20);
        
        const cardY = yPos;
        drawCard(20, cardY, pageWidth - 40, 15, '#ffffff');
        
        // Colored indicator dot
        setColor([COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.teal][index % 5], false);
        pdf.circle(26, cardY + 6, 1.5, 'F');
        
        // Skill name
        pdf.setFontSize(11); // 9 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        pdf.text(`${index + 1}. ${skill}`, 40, cardY + 8);
        
        yPos += 18;
      });
    }
    
    yPos += 10;
  }

  if (reportData.careerTrajectoryInsights) {
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
  if (!isGradeBelow8 && reportData.detailedCareerInsights) {
    if (reportData.detailedCareerInsights.explanations) {
      checkSpace(60);
      
      pdf.setFontSize(19); // 16 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.info);
      pdf.text('Detailed Career Explanations', 15, yPos);
      yPos += 12;
      
      const explanations = Object.entries(reportData.detailedCareerInsights.explanations);
      explanations.forEach(([career, explanation], index) => {
        checkSpace(30);
        
        const cardStartY = yPos;
        
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(career, pageWidth - 60);
        const titleHeight = titleLines.length * 4;
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        const explLines = pdf.splitTextToSize(String(explanation), pageWidth - 60);
        const explHeight = explLines.length * 3.5;
        
        const cardHeight = titleHeight + explHeight + 12;
        drawCard(20, cardStartY, pageWidth - 40, cardHeight, '#ffffff');
        
        // Redraw text on top
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, 28, cardStartY + 8);
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.mediumText);
        pdf.text(explLines, 28, cardStartY + 8 + titleHeight + 2);
        
        yPos += cardHeight + 8;
      });
      
      yPos += 5;
    }

    if (reportData.detailedCareerInsights.studyPaths) {
      checkSpace(60);
      
      pdf.setFontSize(19); // 16 * 1.2
      pdf.setFont('helvetica', 'bold');
      setColor(COLORS.success);
      pdf.text('Personalized Study Paths', 15, yPos);
      yPos += 12;
      
      const studyPaths = Object.entries(reportData.detailedCareerInsights.studyPaths);
      studyPaths.forEach(([career, path], index) => {
        checkSpace(40);
        
        const cardStartY = yPos;
        
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        const titleLines = pdf.splitTextToSize(career, pageWidth - 60);
        const titleHeight = titleLines.length * 4;
        
        let pathHeight = 0;
        if (Array.isArray(path)) {
          pathHeight = path.length * 4;
        } else {
          const pathLines = pdf.splitTextToSize(String(path), pageWidth - 60);
          pathHeight = pathLines.length * 3.5;
        }
        
        const cardHeight = titleHeight + pathHeight + 15;
        drawCard(20, cardStartY, pageWidth - 40, cardHeight, '#ffffff');
        
        // Redraw text on top
        pdf.setFontSize(12); // 10 * 1.2
        pdf.setFont('helvetica', 'bold');
        setColor(COLORS.darkText);
        pdf.text(titleLines, 28, cardStartY + 8);
        
        let textY = cardStartY + 8 + titleHeight + 4;
        
        pdf.setFontSize(10); // 8 * 1.2
        pdf.setFont('helvetica', 'normal');
        setColor(COLORS.darkText);
        
        if (Array.isArray(path)) {
          path.forEach((step: string, stepIndex: number) => {
            pdf.text(`${stepIndex + 1}. ${step}`, 30, textY);
            textY += 4;
          });
        } else {
          const pathLines = pdf.splitTextToSize(String(path), pageWidth - 60);
          pdf.text(pathLines, 28, textY);
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

  const nextSteps = isGradeBelow8 ? [
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
  ];

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

export function generatePDFBlob(reportData: ReportData): Blob {
  const pdf = generateReportPDF(reportData);
  return pdf.output('blob');
}

export function generatePDFBase64(reportData: ReportData): string {
  const pdf = generateReportPDF(reportData);
  return pdf.output('datauristring');
}