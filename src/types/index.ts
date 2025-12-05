/**
 * Core TypeScript types for LovableCareers
 * 
 * This file defines all the data structures used throughout the app.
 * These types ensure type safety and help catch errors during development.
 */

export interface Question {
  id: string;
  text: string;
  type: 'likert' | 'single' | 'multi' | 'subjective' | 'numeric-grid' | 'multi+text';
  required: boolean;
  options?: string[];
  instruction?: string;
  riasec_map?: { [key: string]: number };
}

export interface Career {
  careerId: string;
  careerName: string;
  bucket: string;
  riasec_profile: string;
  primarySubjects: string[];
  tags: string[];
  minQualification: string;
  top5_college_courses: string;
  baseParagraph: string;
  microprojects: string;
  why_fit: string;
}

export interface RiasecScores {
  R: number; // Realistic
  I: number; // Investigative  
  A: number; // Artistic
  S: number; // Social
  E: number; // Enterprising
  C: number; // Conventional
}

export interface TestAnswer {
  questionId: string;
  answer: string | string[] | number | { [key: string]: number };
  timestamp: Date;
}

export interface TestProgress {
  userId: string;
  testId: string;
  currentQuestion: number;
  totalQuestions: number;
  answers: TestAnswer[];
  completed: boolean;
  lastSaved: Date;
}

export interface CareerMatch {
  careerName: string;
  matchScore: number;
  topReasons?: string[];
  studyPath?: string[];
  first3Steps?: string[];
  confidence?: string;
  whatWouldChangeRecommendation?: string;
}

export interface CareerBucket {
  bucketName: string;
  bucketScore: number;
  topCareers: CareerMatch[];
}

export interface StudentReport {
  studentName: string;
  grade?: number;
  board?: string;
  vibeScores: RiasecScores;
  edu_stats: { [subject: string]: number };
  extracurriculars?: string[];
  parents?: string[];
  top5_buckets: CareerBucket[];
  summaryParagraph: string;
  reportId: string;
  generatedAt: Date;
  // AI Enhancement fields
  aiEnhanced?: boolean;
  enhancedSummary?: string;
  skillRecommendations?: string[]; // Focused skill names
  detailedSkillRecommendations?: Array<{skill_name?: string; skillName?: string; explanation?: string}>; // For grade < 8: [{skill_name, explanation}]
  careerTrajectoryInsights?: string;
  detailedCareerInsights?: {
    career_name: string;
    explanation: string;
    study_path: string[];
    next_steps: string[];
    confidence: string;
    what_would_change: string;
  }[];
}

export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin?: Date;
  profile: {
    grade?: number;
    board?: string;
    school?: string;
    parentName?: string;
  };
}

export interface UIMicrocopy {
  appName: string;
  onboarding: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    getStartedBtn: string;
  };
  auth: {
    loginEmailPlaceholder: string;
    loginPasswordPlaceholder: string;
    loginBtn: string;
    signupBtn: string;
    invalidCreds: string;
    signupSuccess: string;
  };
  tests: {
    questionProgress: string;
    nextBtn: string;
    backBtn: string;
    completeTestBtn: string;
    saveProgressToast: string;
    resumeTestCTA: string;
    optionalLabel: string;
    requiredLabel: string;
  };
  results: {
    resultsHeadline: string;
    top5Heading: string;
    shareBtn: string;
    downloadPDF: string;
    confidenceLabel: string;
  };
  badges: {
    badgeCompleteTests: string;
    confettiMsg: string;
  };
  admin: {
    adminTitle: string;
    editQuestionnaireBtn: string;
    editCareerBtn: string;
    brandSettings: string;
    previewReport: string;
    seedDataBtn: string;
  };
  errors: {
    networkError: string;
    sheetQuotaError: string;
  };
  placeholders: {
    subjectiveExample: string;
  };
}

export type TestType = 'vibematch' | 'edustats';

export interface ScoringWeights {
  riasec_weight: number;
  subject_weight: number;
  context_weight: number;
  practical_weight: number;
}

export interface SubjectivityKeywords {
  creative: string[];
  hands_on: string[];
  entrepreneurial: string[];
  research: string[];
  service: string[];
  leadership: string[];
  tech_keywords: string[];
  design_keywords: string[];
  sustainability_keywords: string[];
}