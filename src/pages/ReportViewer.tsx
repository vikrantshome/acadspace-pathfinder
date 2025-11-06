/**
 * ReportViewer - Professional Career Report matching PDF format
 * Displays comprehensive career analysis and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Share2, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Target,
  ArrowRight,
  CheckCircle2,
  Award,
  Lightbulb,
  Users,
  Briefcase,
  GraduationCap,
  MapPin,
  Loader2,
  Home
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { apiService } from '@/lib/api';
import { AIFallbackNotice } from '@/components/AIFallbackNotice';
import { generatePDFBlob, type ReportData } from '@/lib/pdf-generator';

const ReportViewer = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId?: string }>();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check auth and fetch report data
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchReportData();
    }
  }, [user, authLoading, navigate, reportId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      if (reportId) {
        // Fetch specific report by ID from Java backend
        const report = await apiService.getReport(reportId);
        console.log('Using report from database:', {
          reportId: reportId,
          aiEnhanced: report?.aiEnhanced,
          hasEnhancedSummary: !!report?.enhancedSummary,
          hasSkillRecommendations: !!report?.skillRecommendations
        });
        setReportData(report);
      } else if (user?.id) {
        // Fetch user's latest report from Java backend
        const reports = await apiService.getUserReports(user.id);
        
        if (reports && reports.length > 0) {
          const latestReport = reports[0];
          console.log('Using latest report from database:', {
            reportId: latestReport.id,
            aiEnhanced: latestReport.reportData?.aiEnhanced,
            hasEnhancedSummary: !!latestReport.reportData?.enhancedSummary,
            hasSkillRecommendations: !!latestReport.reportData?.skillRecommendations
          });
          setReportData(latestReport.reportData);
        } else {
          // Load demo report for now
          const demoReport = await apiService.getDemoReport();
          setReportData(demoReport);
        }
      } else {
        // Load demo report for now
        const demoReport = await apiService.getDemoReport();
        setReportData(demoReport);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback to demo report
      try {
        const demoReport = await apiService.getDemoReport();
        setReportData(demoReport);
      } catch (demoError) {
        console.error('Error fetching demo report:', demoError);
      }
    } finally {
      setLoading(false);
    }
  };

  const riasecLabels = {
    R: { name: 'Realistic', description: 'Practical, hands-on problem solver' },
    I: { name: 'Investigative', description: 'Analytical, research-oriented thinker' },
    A: { name: 'Artistic', description: 'Creative, innovative, expressive' },
    S: { name: 'Social', description: 'Helpful, collaborative, people-focused' },
    E: { name: 'Enterprising', description: 'Leadership, persuasive, goal-driven' },
    C: { name: 'Conventional', description: 'Organized, detail-oriented, systematic' }
  };

  const handleDownload = async () => {
    try {
      // Prepare report data matching the ReportData interface
      const reportData: ReportData = {
        studentName: displayData.studentName,
        schoolName: displayData.schoolName,
        grade: displayData.grade,
        board: displayData.board,
        vibeScores: displayData.vibeScores,
        top5_buckets: displayData.top5_buckets,
        summaryParagraph: displayData.summaryParagraph,
        enhancedSummary: displayData.enhancedSummary,
        skillRecommendations: displayData.skillRecommendations,
        detailedSkillRecommendations: displayData.detailedSkillRecommendations,
        careerTrajectoryInsights: displayData.careerTrajectoryInsights,
        detailedCareerInsights: displayData.detailedCareerInsights,
        actionPlan: displayData.actionPlan
      };

      // Generate PDF using shared utility
      const pdfBlob = generatePDFBlob(reportData);
      
      // Create download link
      const studentName = displayData.studentName || 'Student';
      const cleanName = studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Career_Report_${cleanName}_${dateStr}.pdf`;
      
      console.log('Generating PDF with filename:', fileName);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      link.setAttribute('download', fileName);
      link.setAttribute('type', 'application/pdf');
      
      document.body.appendChild(link);
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 50);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing report...');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    );
  }

  // Show message if no report available
  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">No Report Available</h2>
            <p className="text-muted-foreground">
              Complete your assessments to generate your personalized career report.
            </p>
          </div>
          <Button onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Log the reportData to see what we're getting
  console.log('ReportViewer - reportData:', {
    hasReportData: !!reportData,
    aiEnhanced: reportData?.aiEnhanced,
    hasEnhancedSummary: !!reportData?.enhancedSummary,
    hasSkillRecommendations: !!reportData?.skillRecommendations,
    hasCareerTrajectoryInsights: !!reportData?.careerTrajectoryInsights,
    hasDetailedCareerInsights: !!reportData?.detailedCareerInsights,
    fullReportData: reportData
  });

  // Use dynamic data
  const displayData = {
    studentName: reportData?.studentName || user?.name || user?.email?.split('@')[0] || 'Student',
    schoolName: 'Your School',
    grade: reportData?.grade || 11,
    board: reportData?.board || 'CBSE',
    vibeScores: reportData?.vibeScores || reportData?.vibe_scores || {},
    top5_buckets: reportData?.top5Buckets || reportData?.top5_buckets || [],
    summaryParagraph: reportData?.summaryParagraph || 'Your personalized career analysis is being generated based on your assessment responses.',
    // AI Enhancement fields
    aiEnhanced: reportData?.aiEnhanced || false,
    enhancedSummary: reportData?.enhancedSummary || null,
    skillRecommendations: reportData?.skillRecommendations || [],
    detailedSkillRecommendations: reportData?.detailedSkillRecommendations || [],
    careerTrajectoryInsights: reportData?.careerTrajectoryInsights || null,
    detailedCareerInsights: reportData?.detailedCareerInsights || null,
    actionPlan: reportData?.actionPlan || []
  };

  // Grade-based logic helper
  const grade = displayData.grade || 11;
  const isGradeBelow8 = grade < 8;

  // Skill parsing utility function
  const parseSkill = (skill: string): {
    skillName: string;
    category?: string;
    importanceLevel?: string;
    developmentMethod?: string;
    timeline?: string;
  } => {
    if (!skill || typeof skill !== 'string') {
      return { skillName: '' };
    }

    const lines = skill.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { skillName: '' };
    }

    // Extract skill name from first line
    let skillNameRaw = '';
    const firstLine = lines[0].trim();
    if (firstLine.startsWith('Skill Name:')) {
      skillNameRaw = firstLine.replace(/^Skill Name:\s*/, '').trim();
    } else {
      skillNameRaw = firstLine.replace(/^\d+\.\s*/, '').trim();
    }

    const details: Record<string, string> = {};
    let currentKey = '';
    let currentValue = '';

    // Parse remaining lines for details
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

    return {
      skillName: skillNameRaw,
      category: details['Category'],
      importanceLevel: details['Importance Level'],
      developmentMethod: details['Development Method'],
      timeline: details['Timeline']
    };
  };

  // Parse skill recommendations for grade >= 8
  const parseSkillRecommendations = (skills: string[]): Array<ReturnType<typeof parseSkill>> => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return [];
    }

    // Handle case where first element might be a single string with multiple skills
    if (skills[0] && typeof skills[0] === 'string' && skills[0].includes('\n\n')) {
      // Split by double newline to get individual skills
      const individualSkills = skills[0].split(/\n\n+/).filter(s => s.trim());
      return individualSkills.map(parseSkill);
    }

    return skills.map(parseSkill);
  };

  // Prepare parsed skills
  const parsedSkills = !isGradeBelow8 ? parseSkillRecommendations(displayData.skillRecommendations) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Cover Page Style */}
      <div className="bg-gradient-hero text-white relative">
        {/* Home Button - Top Left */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </div>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 px-2">
                Your Dreams to Reality Handbook
              </h1>
              <div className="text-lg md:text-xl lg:text-2xl font-semibold opacity-90">
                Naviksha AI
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold px-2">{displayData.studentName}</h2>
              <p className="text-base md:text-lg opacity-80 px-2">{displayData.schoolName}</p>
              <div className="flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm opacity-70">
                <span>Grade {displayData.grade}</span>
                <span>•</span>
                <span>{displayData.board} Board</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-4 px-4">
              <Button variant="secondary" onClick={handleDownload} className="flex items-center gap-2 w-full sm:w-auto">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto">
                <Share2 className="w-4 h-4" />
                Share Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Section */}
      <div className="bg-gradient-card py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-4 md:p-6 lg:p-8 text-center space-y-4 md:space-y-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-success rounded-full flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-success-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-success mb-2">Congratulations!</h2>
                <p className="text-base md:text-lg text-muted-foreground px-2">
                  You've achieved the first significant point on your Career Success Journey.
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-primary">
                  Your Journey Map with Naviksha AI Started!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <span>✓ Completed Comprehensive Assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <span>✓ Generated Personalized Career Report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>→ Explore Career Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>→ Access Career Development Resources</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* AI Fallback Notice */}
        {displayData && !displayData.aiEnhanced && (
          <AIFallbackNotice className="mb-6" />
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
          {[
            { 
              id: 'overview', 
              label: isGradeBelow8 ? 'Skill Development Profile Summary' : 'Career Profile Summary',
              labelShort: isGradeBelow8 ? 'Skills' : 'Career',
              icon: Target 
            },
            { 
              id: 'personality', 
              label: 'RIASEC Personality Profile',
              labelShort: 'RIASEC',
              icon: TrendingUp 
            },
            ...(!isGradeBelow8 ? [
              { 
                id: 'careers', 
                label: 'Top Career Recommendations',
                labelShort: 'Top',
                icon: Briefcase 
              }
            ] : []),
            ...(displayData.aiEnhanced ? [
              { 
                id: 'ai-skills', 
                label: 'Skills to Develop',
                labelShort: 'Skills',
                icon: Lightbulb 
              },
              { 
                id: 'ai-trajectory', 
                label: isGradeBelow8 ? 'Skill Development Journey' : 'Career Trajectory Insights',
                labelShort: isGradeBelow8 ? 'Journey' : 'Trajectory',
                icon: TrendingUp 
              },
              ...(!isGradeBelow8 ? [
                { 
                  id: 'ai-insights-explanations', 
                  label: 'Detailed Career Explanations',
                  labelShort: 'Detailed',
                  icon: Star 
                },
                { 
                  id: 'ai-insights-paths', 
                  label: 'Personalized Study Paths',
                  labelShort: 'Paths',
                  icon: BookOpen 
                }
              ] : [])
            ] : []),
            { 
              id: 'next-steps', 
              label: 'Your Action Plan',
              labelShort: 'Action',
              icon: ArrowRight 
            }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2 whitespace-nowrap"
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.labelShort || tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            {/* Summary Card */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg md:text-xl">
                        {isGradeBelow8 ? 'Skill Development Profile Summary' : 'Career Profile Summary'}
                      </CardTitle>
                      {displayData.aiEnhanced && (
                        <Badge variant="default" className="bg-green-600">
                          🤖 AI Enhanced
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">
                      AI-Powered Career Analysis Results
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base lg:text-lg text-foreground leading-relaxed">
                  {displayData.enhancedSummary || displayData.summaryParagraph}
                </p>
              </CardContent>
            </Card>

            {/* Assessment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
                  Assessment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Environment Readiness</h3>
                    <p className="text-sm text-muted-foreground">
                      Assessed parental support and resource availability for career development
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold">Learning Interests</h3>
                    <p className="text-sm text-muted-foreground">
                      Identified areas of interest, strengths, and academic preferences
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="font-semibold">Personality Traits</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzed behavioral patterns, thought processes, and emotional tendencies
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Personality Profile Tab */}
        {activeTab === 'personality' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                RIASEC Personality Profile
              </CardTitle>
              <p className="text-muted-foreground">
                Your unique personality traits and career interests
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(displayData.vibeScores || {}).map(([key, value]) => {
                  const info = riasecLabels[key as keyof typeof riasecLabels];
                  const score = Number(value) || 0;
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{info?.name || key}</span>
                            <Badge variant="secondary" className="text-sm">{score}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{info?.description || ''}</p>
                        </div>
                      </div>
                      <Progress value={score} className="h-3" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Career Recommendations Tab - Only for grade >= 8 */}
        {activeTab === 'careers' && !isGradeBelow8 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Top Career Recommendations</h2>
              <p className="text-lg text-muted-foreground">
                Personalized career paths based on your unique profile
              </p>
            </div>

            {(displayData.top5_buckets || []).map((bucket, index) => (
              <Card key={index} className="border-l-4 border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        {bucket.bucketName}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Match Score: {bucket.bucketScore}% • High Compatibility
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(bucket.topCareers || []).slice(0, 3).map((career, careerIndex) => (
                      <div key={careerIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{career.careerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default">{career.matchScore}% Match</Badge>
                              <Badge variant="outline">Confidence: {career.confidence}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h5 className="font-medium text-sm">Top Reasons:</h5>
                            <ul className="text-sm text-muted-foreground ml-4 list-disc">
                              {(career.topReasons || []).map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm">Study Path:</h5>
                            <p className="text-sm text-muted-foreground">{career.studyPath}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm">First 3 Steps:</h5>
                            <ol className="text-sm text-muted-foreground ml-4 list-decimal">
                              {(career.first3Steps || []).map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Skills Tab - Grade-based rendering */}
        {activeTab === 'ai-skills' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Skills to Develop</h2>
              <p className="text-lg text-muted-foreground">
                {isGradeBelow8 
                  ? 'Focus on building foundational skills that will help you explore different areas' 
                  : 'Personalized skill development recommendations based on your profile'}
              </p>
            </div>

            {/* For grade >= 8: Show parsed skill cards */}
            {!isGradeBelow8 && parsedSkills.length > 0 && (
              <div className="space-y-4">
                {parsedSkills.map((skill, index) => (
                  <Card key={index} className="border-l-4 border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        {skill.skillName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {skill.category && (
                          <div>
                            <span className="font-semibold text-sm">Category: </span>
                            <span className="text-sm text-muted-foreground">{skill.category}</span>
                          </div>
                        )}
                        {skill.importanceLevel && (
                          <div>
                            <span className="font-semibold text-sm">Importance Level: </span>
                            <span className="text-sm text-muted-foreground">{skill.importanceLevel}</span>
                          </div>
                        )}
                        {skill.developmentMethod && (
                          <div>
                            <span className="font-semibold text-sm">How to Develop: </span>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{skill.developmentMethod}</p>
                          </div>
                        )}
                        {skill.timeline && (
                          <div>
                            <span className="font-semibold text-sm">Timeline: </span>
                            <span className="text-sm text-muted-foreground">{skill.timeline}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* For grade < 8: Show two sections - Focused Skills and Detailed Skill Explanations */}
            {isGradeBelow8 && (
              <div className="space-y-6">
                {/* Focused Skills Section */}
                {displayData.skillRecommendations && displayData.skillRecommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                        Focused Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
                      <div className="space-y-4">
                        {displayData.skillRecommendations.map((skill, index) => {
                          const parsed = parseSkill(skill);
                          return (
                            <Card key={index} className="border-l-4 border-primary">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                                  {parsed.skillName}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {parsed.category && (
                                    <div>
                                      <span className="font-semibold text-sm">Category: </span>
                                      <span className="text-sm text-muted-foreground">{parsed.category}</span>
                    </div>
                                  )}
                                  {parsed.importanceLevel && (
                                    <div>
                                      <span className="font-semibold text-sm">Importance Level: </span>
                                      <span className="text-sm text-muted-foreground">{parsed.importanceLevel}</span>
                  </div>
                                  )}
                                  {parsed.developmentMethod && (
                                    <div>
                                      <span className="font-semibold text-sm">How to Develop: </span>
                                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{parsed.developmentMethod}</p>
                                    </div>
                                  )}
                                  {parsed.timeline && (
                                    <div>
                                      <span className="font-semibold text-sm">Timeline: </span>
                                      <span className="text-sm text-muted-foreground">{parsed.timeline}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
              </div>
            </CardContent>
          </Card>
                )}

                {/* Detailed Skill Explanations Section */}
                {displayData.detailedSkillRecommendations && displayData.detailedSkillRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Detailed Skill Explanations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {displayData.detailedSkillRecommendations.map((skillItem, index) => {
                          let skillName = (typeof skillItem === 'object' && skillItem !== null) 
                            ? (skillItem.skill_name || skillItem.skillName || '') 
                            : '';
                          const explanation = (typeof skillItem === 'object' && skillItem !== null) 
                            ? (skillItem.explanation || '') 
                            : String(skillItem);
                          
                          // Extract skill name from explanation if not provided
                          if (!skillName || skillName === 'Skill Name' || skillName.trim() === '') {
                            const explText = String(explanation || '').trim();
                            if (explText) {
                              const matchBold = explText.match(/^\*\*([^*]+)\*\*/);
                              if (matchBold) {
                                skillName = matchBold[1].trim();
                              } else {
                                const matchHelps = explText.match(/^([^.!?\n]+?)(?:\s+helps|\s+helps you|\.|!|\?)/);
                                if (matchHelps) {
                                  skillName = matchHelps[1].trim();
                                } else {
                                  const firstLine = explText.split('\n')[0].split(/[.!?]/)[0].trim();
                                  if (firstLine && firstLine.length < 50) {
                                    skillName = firstLine;
                                  }
                                }
                              }
                            }
                          }
                          
                          if (!skillName || skillName.trim() === '') return null;
                          
                          return (
                            <Card key={index} className="border-l-4 border-secondary">
                              <CardHeader>
                                <CardTitle className="text-lg">{skillName}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                  {explanation}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Fallback message if no skills */}
            {(!isGradeBelow8 && parsedSkills.length === 0) && 
             (isGradeBelow8 && (!displayData.skillRecommendations || displayData.skillRecommendations.length === 0) && 
              (!displayData.detailedSkillRecommendations || displayData.detailedSkillRecommendations.length === 0)) && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No skill recommendations available at this time.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* AI Career Trajectory Tab */}
        {activeTab === 'ai-trajectory' && displayData.careerTrajectoryInsights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {isGradeBelow8 ? 'Skill Development Journey' : 'Career Trajectory Insights'}
                <Badge variant="default" className="bg-purple-600">
                  🤖 AI Powered
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                {isGradeBelow8 
                  ? 'Your personalized skill development pathway' 
                  : 'Long-term career path analysis and recommendations'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {displayData.careerTrajectoryInsights}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Career Explanations Tab - Only for grade >= 8 */}
        {activeTab === 'ai-insights-explanations' && !isGradeBelow8 && displayData.detailedCareerInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Detailed Career Explanations
                  <Badge variant="default" className="bg-orange-600">
                    🤖 AI Powered
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  In-depth analysis of why each career recommendation fits your profile
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData.detailedCareerInsights.explanations && 
                   Object.entries(displayData.detailedCareerInsights.explanations).map(([career, explanation]) => (
                  <Card key={career} className="border-l-4 border-orange-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{career}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{String(explanation)}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!displayData.detailedCareerInsights.explanations || 
                  Object.keys(displayData.detailedCareerInsights.explanations || {}).length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No detailed career explanations available at this time.</p>
                )}
                </div>
              </CardContent>
            </Card>
        )}

        {/* Personalized Study Paths Tab - Only for grade >= 8 */}
        {activeTab === 'ai-insights-paths' && !isGradeBelow8 && displayData.detailedCareerInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Personalized Study Paths
                    <Badge variant="default" className="bg-green-600">
                      🤖 AI Powered
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Customized educational roadmap for your career goals
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                {displayData.detailedCareerInsights.studyPaths && 
                 Object.entries(displayData.detailedCareerInsights.studyPaths).map(([career, path]) => (
                  <Card key={career} className="border-l-4 border-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{career}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                          {Array.isArray(path) ? path.map((step, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-muted-foreground">{String(step)}</p>
                            </div>
                          )) : (
                            <p className="text-muted-foreground">{String(path)}</p>
                          )}
                        </div>
                    </CardContent>
                  </Card>
                    ))}
                {(!displayData.detailedCareerInsights.studyPaths || 
                  Object.keys(displayData.detailedCareerInsights.studyPaths || {}).length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No personalized study paths available at this time.</p>
                )}
                  </div>
                </CardContent>
              </Card>
        )}

        {/* Next Steps Tab */}
        {activeTab === 'next-steps' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Your Action Plan
              </CardTitle>
              <p className="text-muted-foreground">
                Follow these steps to turn your dreams into reality
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(() => {
                  // Use AI-generated action plan if available, otherwise fallback to hardcoded
                  const actionPlan = displayData.actionPlan || [];
                  const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#14b8a6'];
                  
                  const nextSteps = actionPlan.length > 0 ? actionPlan : (isGradeBelow8 ? [
                    { title: "Build Foundational Skills", desc: "Focus on developing core skills in subjects you enjoy. Practice regularly through fun activities, games, and hands-on projects.", timeline: "Ongoing" },
                    { title: "Explore Different Areas", desc: "Try different activities and hobbies to discover what interests you most. Join clubs, participate in school activities, and explore new subjects.", timeline: "This month" },
                    { title: "Practice Through Projects", desc: "Engage in hands-on projects that interest you. Build things, create art, solve puzzles, or work on collaborative projects with friends.", timeline: "Next 2 weeks" },
                    { title: "Develop Communication Skills", desc: "Practice expressing your ideas through writing, speaking, and presentations. Join debate clubs, writing groups, or drama activities.", timeline: "This month" },
                    { title: "Keep Learning and Growing", desc: "Continue building your skills through practice and exploration. Every small step counts toward your growth and discovery.", timeline: "Ongoing" }
                  ] : [
                    { title: "Explore Career Details", desc: "Research your top 3-5 career recommendations in depth. Understand daily responsibilities, growth opportunities, and industry trends.", timeline: "This week" },
                    { title: "Educational Pathway Planning", desc: "Research educational requirements, courses, and institutions that align with your career choices. Plan your subject selection for upcoming grades.", timeline: "Next 2 weeks" },
                    { title: "Professional Networking", desc: "Connect with professionals in your areas of interest through LinkedIn, career events, or through family connections. Conduct informational interviews.", timeline: "This month" },
                    { title: "Gain Experience", desc: "Look for internships, job shadowing opportunities, or volunteer work in your fields of interest. Consider joining relevant clubs or competitions.", timeline: "Next 3 months" },
                    { title: "Skill Development", desc: "Identify and develop key skills relevant to your top career choices. Take online courses, attend workshops, or start personal projects.", timeline: "Ongoing" }
                  ]);

                  // Assign icons and colors based on index
                  const icons = [<Target className="w-5 h-5" />, <GraduationCap className="w-5 h-5" />, <Users className="w-5 h-5" />, <Briefcase className="w-5 h-5" />, <Lightbulb className="w-5 h-5" />];

                  return nextSteps.map((step, index) => {
                    const stepColor = colorPalette[index % colorPalette.length];
                    return (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stepColor}20` }}>
                          <div style={{ color: stepColor }}>
                            {icons[index % icons.length]}
                          </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{step.title}</h4>
                            <Badge variant="outline" className="text-xs" style={{ borderColor: stepColor, color: stepColor }}>
                              {step.timeline}
                            </Badge>
                      </div>
                          <p className="text-sm text-muted-foreground">{step.desc || step.description}</p>
                    </div>
                  </div>
                    );
                  });
                })()}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex gap-3">
                <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                  Take Another Assessment
                </Button>
                <Button onClick={() => navigate('/profile')} className="flex-1 group">
                  View Full Profile
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;