/**
 * Index/Home Page - Career Counseling Landing & Student Dashboard
 * 
 * Shows landing page for guests and comprehensive dashboard for logged-in students.
 * Features hero section, benefits, dashboard with progress tracking, and clear call-to-action.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  User,
  FileText,
  Settings,
  BookOpen,
  Trophy,
  Clock,
  LogOut,
  Download,
  Loader2
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import uiMicrocopy from '@/data/ui_microcopy.json';
import { apiService } from '@/lib/api';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, isNlpSession, loading } = useAuth();
  const [testProgress, setTestProgress] = useState({ vibematch: null, edustats: null });
  const [hasReport, setHasReport] = useState(false);
  const [latestReportId, setLatestReportId] = useState<string | null>(null);

useEffect(() => {
  // Wait for auth to initialize
  if (loading) return;

  if (!user) {
    return;
  }
  (async () => {
    try {
      // 1) Load progress for each assessment
      const vibematch = await apiService.getProgress(user.id, 'vibematch');
      const edustats  = await apiService.getProgress(user.id, 'edustats');

      setTestProgress({
        vibematch: vibematch?.status ?? inferStatus(vibematch),
        edustats: edustats?.status ?? inferStatus(edustats),
      });

      // 2) Load latest report
      const reports = await apiService.getUserReports(user.id);
      if (reports && reports.length > 0) {
        setHasReport(true);
        setLatestReportId(reports[0].id);
      } else {
        setHasReport(false);
        setLatestReportId(null);
        // Load demo report for now (commented out as per instruction)
        // try {
        //   const demoReport = await apiService.getDemoReport();
        //   setHasReport(!!demoReport);
        //   // Assuming demo report also has an ID or we can mock one for navigation
        //   // setLatestReportId(demoReport.id || 'demo'); 
        // } catch (err) {
        //   console.error('Failed to load demo report', err);
        // }
      }
    } catch (e) {
      console.error('Dashboard fetch error : '+e);
    }
  })();
}, [user, navigate]);


function inferStatus(p?: { currentQuestionIndex?: number; answers?: any; completed?: boolean }) {
  if (!p) return null;
  // Check if test is completed
  if (p.completed === true) return 'completed';
  // If progress exists but not completed, it's in progress
  if (p.answers && Object.keys(p.answers).length > 0) return 'in_progress';
  return null;
}
  const getTestStatus = (testType: 'vibematch' | 'edustats') => {
    const status = testProgress[testType];
    if (status === 'completed') return { label: 'Completed', variant: 'default' as const, icon: CheckCircle2 };
    if (status === 'in_progress') return { label: 'In Progress', variant: 'secondary' as const, icon: Clock };
    return { label: 'Not Started', variant: 'outline' as const, icon: Play };
  };

  const getNextAction = () => {
    if (!testProgress.vibematch) return { text: 'Start Personality Test', path: '/test/vibematch' };
    if (!testProgress.edustats) return { text: 'Start Academic Test', path: '/test/edustats' };
    if (testProgress.vibematch === 'completed' && testProgress.edustats === 'completed' && !hasReport) {
      return { text: 'Generate Report', path: '/results' };
    }
    if (hasReport) return { text: 'View Results', path: '/results' };
    return { text: 'Continue Assessment', path: '/onboarding' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    const nextAction = getNextAction();
    
    return (
      <div className="min-h-screen bg-background">
        {/* Header with user info */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.fullName || user?.name || user.email}!</h1>
                <p className="text-muted-foreground">Continue your career discovery journey</p>
              </div>
              {!isNlpSession && (
                <Button variant="ghost" onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Admin Panel - Only for admin users */}
          {user?.roles?.includes('ADMIN') && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Admin Panel
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => navigate('/export-questions')}>
                  <CardContent className="p-6 text-center">
                    <Download className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold">Export Questions</h3>
                    <p className="text-sm text-muted-foreground">Download test questions to Excel</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
                <CardContent className="p-6 text-center">
                  <User className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your information</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(nextAction.path)}>
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-accent" />
                  <h3 className="font-semibold">{nextAction.text}</h3>
                  <p className="text-sm text-muted-foreground">Continue your assessment</p>
                </CardContent>
              </Card>

              {hasReport && latestReportId && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/report/${latestReportId}`)}>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-3 text-success" />
                    <h3 className="font-semibold">Full Report</h3>
                    <p className="text-sm text-muted-foreground">Download detailed report</p>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
                <CardContent className="p-6 text-center">
                  <Settings className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-semibold">Settings</h3>
                  <p className="text-sm text-muted-foreground">Account preferences</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Assessment Progress */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Assessment Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Brain className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold">Personality & Interests</h3>
                    </div>
                    <Badge variant={getTestStatus('vibematch').variant}>
                      {getTestStatus('vibematch').label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover your RIASEC personality type and career interests
                  </p>
                  {testProgress.vibematch !== 'completed' && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/test/vibematch')}
                      className="w-full"
                    >
                      {testProgress.vibematch === 'in_progress' ? 'Continue' : 'Start'} Test
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-accent" />
                      <h3 className="font-semibold">Academic Background</h3>
                    </div>
                    <Badge variant={getTestStatus('edustats').variant}>
                      {getTestStatus('edustats').label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your academic performance and subject preferences
                  </p>
                  {testProgress.edustats !== 'completed' && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/test/edustats')}
                      className="w-full"
                      disabled={!testProgress.vibematch}
                    >
                      {testProgress.edustats === 'in_progress' ? 'Continue' : 'Start'} Test
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>


          {/* Results Section */}
          {(testProgress.vibematch === 'completed' && testProgress.edustats === 'completed') && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Your Results</h2>
              <Card className="gradient-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Trophy className="w-12 h-12 text-success" />
                    <div>
                      <h3 className="text-xl font-bold">Assessment Complete!</h3>
                      <p className="text-muted-foreground">Your personalized career report is ready</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => navigate('/results')} className="group w-full sm:w-auto">
                      View Results
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    {hasReport && latestReportId && (
                      <Button variant="outline" onClick={() => navigate(`/report/${latestReportId}`)} className="w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" />
                        Full Report
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Public landing page for non-logged-in users (DEAD CODE - Redirects to /login instead)
  /* 
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced personality and aptitude assessment using proven RIASEC methodology"
    },
    // ... (rest of features)
  ];
  // ... (rest of landing page logic)
  */

  return <Navigate to="/login" replace />;
};

export default Index;