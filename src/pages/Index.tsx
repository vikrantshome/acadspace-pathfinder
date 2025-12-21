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
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import uiMicrocopy from '@/data/ui_microcopy.json';
import { apiService } from '@/lib/api';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [testProgress, setTestProgress] = useState({ vibematch: null, edustats: null });
  const [hasReport, setHasReport] = useState(false);
  const [latestReportId, setLatestReportId] = useState<string | null>(null);

useEffect(() => {
  if (!user) {
    navigate('/login');
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
              <Button variant="ghost" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
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

  // Public landing page for non-logged-in users
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced personality and aptitude assessment using proven RIASEC methodology"
    },
    {
      icon: Target,
      title: "Personalized Matches",
      description: "Get career recommendations tailored to your interests, strengths, and goals"
    },
    {
      icon: TrendingUp,
      title: "Actionable Steps",
      description: "Clear roadmap with next steps, courses, and skill development paths"
    },
    {
      icon: Users,
      title: "Expert Insights",
      description: "Guidance based on real career counseling expertise and industry trends"
    }
  ];

  const benefits = [
    "Discover careers you never knew existed",
    "Understand your unique strengths and interests", 
    "Get specific study and skill recommendations",
    "Build confidence in your career choices",
    "Access emerging and traditional career paths"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Career Guidance
            </Badge>

            {/* Headlines */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
                {uiMicrocopy.onboarding.welcomeTitle}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {uiMicrocopy.onboarding.welcomeSubtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {uiMicrocopy.onboarding.getStartedBtn}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="xl"
                onClick={() => navigate('/report')}
                className="w-full sm:w-auto"
              >
                <Target className="w-5 h-5 mr-2" />
                View Sample Report
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span>Trusted by 10,000+ students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>95% accuracy rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive assessment analyzes multiple dimensions to give you 
                the most accurate career guidance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4 md:p-6 text-center space-y-3 md:space-y-4">
                      <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Discover Your Perfect Career Match
                </h2>
                <p className="text-lg text-muted-foreground">
                  Don't leave your future to chance. Our scientifically-backed assessment 
                  helps you make informed decisions about your career path.
                </p>
                
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="accent" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="group"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="relative">
                <Card className="gradient-card border-0 shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-all duration-500">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Data Scientist</h4>
                        <p className="text-sm text-muted-foreground">92% Match</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2" />
                        <span className="text-muted-foreground">Strong analytical thinking matches your personality</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2" />
                        <span className="text-muted-foreground">Excellent math and coding performance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Find Your Perfect Career?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students who have discovered their ideal career path. 
              Take the first step towards your future today.
            </p>
            
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="group pulse-glow"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Free Assessment
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;