/**
 * Results Page - Career Assessment Results
 * 
 * Displays personalized career recommendations, detailed analysis,
 * and next steps based on completed assessments.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Share2, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Target,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { apiService } from '@/lib/api';
import { CareerCard } from '@/components/CareerCard';
import uiMicrocopy from '@/data/ui_microcopy.json';
import sampleReport from '@/data/sample_report_Aisha.json';
import { toast } from '@/hooks/use-toast';
import { AIFallbackNotice } from '@/components/AIFallbackNotice';

const Results = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testsCompleted, setTestsCompleted] = useState({ vibematch: false, edustats: false });

  // Check auth and test completion status
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkTestCompletion();
    }
  }, [user, authLoading, navigate]);

  const checkTestCompletion = async () => {
    try {
      // Check if user has completed progress for both tests
      const vibeProgress = await apiService.getProgress(user.id, 'vibematch');
      const eduProgress = await apiService.getProgress(user.id, 'edustats');

      const vibematchComplete = vibeProgress?.completed || false;
      const edustatsComplete = eduProgress?.completed || false;
      
      setTestsCompleted({ 
        vibematch: vibematchComplete, 
        edustats: edustatsComplete 
      });

      // If both tests completed, fetch report
      if (vibematchComplete && edustatsComplete) {
        await fetchReport();
      }
    } catch (error) {
      console.error('Error checking test completion:', error);
      toast({
        title: "Error",
        description: "Failed to check test completion status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      // Fetch user's reports from Java backend
      const reports = await apiService.getUserReports(user.id);
      
      if (reports && reports.length > 0) {
        // Get the most recent report
        const latestReport = reports[0];
        console.log('Using report from database:', {
          reportId: latestReport.id,
          aiEnhanced: latestReport.reportData?.aiEnhanced,
          hasEnhancedSummary: !!latestReport.reportData?.enhancedSummary,
          hasSkillRecommendations: !!latestReport.reportData?.skillRecommendations
        });
        setReportData(latestReport.reportData);
      } else {
        // If no report exists, show sample data as fallback
        console.log('No report found, using sample data');
        setReportData(sampleReport);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      // Fallback to sample data
      setReportData(sampleReport);
    }
  };
  
  const handleDownload = () => {
    // Navigate to full report for download
    navigate('/report');
  };
  
  const handleShare = () => {
    // WhatsApp share functionality
    const message = `🎯 Just completed my Career Assessment with Naviksha AI!\n\n✅ Discovered my personality type and interests\n✅ Got personalized career recommendations\n✅ Found my perfect career match!\n\nCheck out your career path too: ${window.location.origin}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Show incomplete tests message
  if (!testsCompleted.vibematch || !testsCompleted.edustats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Complete Your Assessment</h2>
            <p className="text-muted-foreground">
              You need to complete both tests to see your career recommendations.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Personality & Interests Test</span>
                {testsCompleted.vibematch ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Academic Background Test</span>
                {testsCompleted.edustats ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
            </div>

            <Button 
              onClick={() => navigate(testsCompleted.vibematch ? '/test/edustats' : '/test/vibematch')} 
              className="w-full"
            >
              Continue Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show results if no report data available
  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load report data</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30 relative">
        {/* Home Button - Top Left */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="bg-background/80 backdrop-blur-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {uiMicrocopy.results.resultsHeadline}
              </h1>
              <p className="text-muted-foreground mt-1">
                Based on your assessment responses
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                {uiMicrocopy.results.shareBtn}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                {uiMicrocopy.results.downloadPDF}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* AI Fallback Notice */}
        {reportData && !reportData.aiEnhanced && (
          <AIFallbackNotice className="mb-6" />
        )}

        {/* Summary Card */}
        <Card className="mb-8 gradient-card border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Career Profile Summary</CardTitle>
                  {reportData.aiEnhanced && (
                    <Badge variant="default" className="bg-green-600">
                      🤖 AI Enhanced
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {reportData.studentName} • Grade {reportData.grade} • {reportData.board}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {reportData.enhancedSummary || reportData.summaryParagraph}
            </p>
          </CardContent>
        </Card>

        {/* RIASEC Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Personality & Interest Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(reportData?.vibeScores || {}).map(([key, value]) => {
                const labels = {
                  R: 'Realistic',
                  I: 'Investigative', 
                  A: 'Artistic',
                  S: 'Social',
                  E: 'Enterprising',
                  C: 'Conventional'
                };
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{labels[key as keyof typeof labels]}</span>
                      <Badge variant="secondary">{value as number}%</Badge>
                    </div>
                    <Progress value={value as number} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Career Buckets */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            {uiMicrocopy.results.top5Heading}
          </h2>

          {(reportData?.top5_buckets || []).map((bucket: any, index: number) => (
            <Card key={index} className="border-l-4 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{bucket.bucketName}</CardTitle>
                    <p className="text-muted-foreground">
                      {uiMicrocopy.results.confidenceLabel}: {bucket.bucketScore}%
                    </p>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    #{index + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {bucket.topCareers.slice(0, 3).map((career, careerIndex) => (
                    <CareerCard
                      key={careerIndex}
                      career={career}
                      rank={careerIndex + 1}
                      onExplore={() => {
                        // Navigate to detailed career view
                        console.log(`Viewing career: ${career.careerName}`);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Skill Recommendations */}
        {reportData.skillRecommendations && reportData.skillRecommendations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI-Recommended Skills to Develop
                <Badge variant="default" className="bg-blue-600">
                  🤖 AI Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {reportData.skillRecommendations.map((skill, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-foreground">{skill}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Career Trajectory Insights */}
        {reportData.careerTrajectoryInsights && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Career Trajectory Insights
                <Badge variant="default" className="bg-purple-600">
                  🤖 AI Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {reportData.careerTrajectoryInsights}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Explore the top 3-5 career recommendations in detail",
                "Research educational requirements and pathways", 
                "Connect with professionals in your areas of interest",
                "Consider internships or shadowing opportunities",
                "Develop skills relevant to your top career choices"
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button onClick={() => navigate('/report')} variant="outline">
                View Full Report
              </Button>
              <Button onClick={() => navigate('/')} className="group">
                Share with Friends
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;