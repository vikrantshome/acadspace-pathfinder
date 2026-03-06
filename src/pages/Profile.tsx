/**
 * Profile Page - User Profile & Settings
 * 
 * Displays user information, test history, career preferences,
 * and allows users to manage their account settings.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Settings,
  Award,
  BookOpen,
  TrendingUp,

  Mail,
  GraduationCap,
  Target,
  Clock,
  Download,
  Edit2,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import ProfileEditor from '@/components/ProfileEditor';
import uiMicrocopy from '@/data/ui_microcopy.json';
import { apiService } from '@/lib/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testProgress, setTestProgress] = useState<{ vibematch: any; edustats: any }>({ vibematch: null, edustats: null });
  const [latestReportId, setLatestReportId] = useState<string | null>(null);

  // Infer test status from progress data (same pattern as Index.tsx)
  function inferStatus(p?: { currentQuestionIndex?: number; answers?: any; completed?: boolean }) {
    if (!p) return null;
    if (p.completed === true) return 'completed';
    if (p.answers && Object.keys(p.answers).length > 0) return 'in_progress';
    return null;
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1) Fetch real test progress
        const [vibematch, edustats] = await Promise.all([
          apiService.getProgress(user.id, 'vibematch').catch(() => null),
          apiService.getProgress(user.id, 'edustats').catch(() => null),
        ]);
        setTestProgress({ vibematch, edustats });

        // 2) Fetch user's reports — no fallback to demo/sample data
        const reports = await apiService.getUserReports(user.id);
        if (reports && reports.length > 0) {
          const latestReport = reports[0];
          setReportData(latestReport.reportData);
          setLatestReportId(latestReport.id || null);
        }
        // If no reports, reportData stays null → empty states shown
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Build user data from real auth state
  const userData = {
    name: user?.fullName || user?.name || "User",
    email: user?.email || "",
    grade: user?.grade || null,
    board: user?.board || null,
    schoolName: user?.schoolName || null,
  };

  // Derive test completion stats from real progress
  const vibematchStatus = inferStatus(testProgress.vibematch);
  const edustatsStatus = inferStatus(testProgress.edustats);
  const totalTests = 2; // vibematch + edustats (the actual tests in the system)
  const testsCompleted = [vibematchStatus, edustatsStatus].filter(s => s === 'completed').length;

  // Build test history from real progress data
  const testHistory = [
    {
      testName: "Personality & Interests",
      status: vibematchStatus || 'not_started',
      testPath: '/test/vibematch',
    },
    {
      testName: "Academic Background",
      status: edustatsStatus || 'not_started',
      testPath: '/test/edustats',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                {userData.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {userData.name}'s Profile
                </h1>
                <p className="text-muted-foreground">
                  {userData.grade ? `Grade ${userData.grade}` : 'Grade not set'} • {userData.board || 'Board not set'}
                </p>
              </div>
            </div>

            <ProfileEditor />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="tests" className="text-xs md:text-sm">Tests</TabsTrigger>
            <TabsTrigger value="careers" className="text-xs md:text-sm">Careers</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Profile Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tests Completed</span>
                      <span className="font-medium">{testsCompleted}/{totalTests}</span>
                    </div>
                    <Progress value={(testsCompleted / totalTests) * 100} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testsCompleted === totalTests
                      ? 'All assessments completed! View your career report.'
                      : 'Complete all assessments to get your full career report'}
                  </div>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" />
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{userData.grade ? `Grade ${userData.grade}` : 'Grade not set'}, {userData.board || 'Board not set'}</span>
                  </div>
                  {userData.schoolName && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.schoolName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {testsCompleted < totalTests ? (
                    <Button
                      variant="career"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate(
                        vibematchStatus === 'completed' ? '/test/edustats' : '/test/vibematch'
                      )}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {vibematchStatus === 'completed'
                        ? 'Continue to Academic Test'
                        : vibematchStatus === 'in_progress'
                          ? 'Resume Personality Test'
                          : 'Start Assessment'}
                    </Button>
                  ) : (
                    <Button
                      variant="career"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate(latestReportId ? `/report/${latestReportId}` : '/results')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Full Report
                    </Button>
                  )}
                  {latestReportId && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigate('/results')}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Results Summary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigate(`/report/${latestReportId}`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIASEC Profile Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg md:text-xl">Your Personality Profile</CardTitle>
                  {reportData?.aiEnhanced && (
                    <Badge variant="default" className="bg-green-600">
                      🤖 AI Enhanced
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(reportData?.vibeScores || reportData?.vibe_scores) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {Object.entries(reportData.vibeScores || reportData.vibe_scores).map(([key, value]) => {
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No personality data yet</p>
                    <p className="text-sm mt-1">Complete your assessments to see your RIASEC profile</p>
                    <Button
                      variant="career"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/test/vibematch')}
                    >
                      Start Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test History Tab */}
          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Assessment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testHistory.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${test.status === 'completed' ? 'bg-success'
                          : test.status === 'in_progress' ? 'bg-yellow-500'
                            : 'bg-muted-foreground'
                          }`} />
                        <div>
                          <h4 className="font-medium">{test.testName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {test.status === 'completed'
                              ? 'Completed'
                              : test.status === 'in_progress'
                                ? 'In Progress'
                                : 'Not started'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant={
                          test.status === 'completed' ? 'default'
                            : test.status === 'in_progress' ? 'secondary'
                              : 'outline'
                        }>
                          {test.status === 'completed' ? 'Done'
                            : test.status === 'in_progress' ? 'In Progress'
                              : 'Pending'}
                        </Badge>
                        <Button
                          variant={test.status === 'completed' ? 'outline' : 'career'}
                          size="sm"
                          onClick={() => navigate(test.testPath)}
                        >
                          {test.status === 'completed' ? 'Review' : test.status === 'in_progress' ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Matches Tab */}
          <TabsContent value="careers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Top Career Recommendations
                  </CardTitle>
                  {reportData?.aiEnhanced && (
                    <Badge variant="default" className="bg-green-600">
                      🤖 AI Enhanced
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(reportData?.top5Buckets || reportData?.top5_buckets) ? (
                  <>
                    <div className="space-y-4">
                      {(reportData.top5Buckets || reportData.top5_buckets).slice(0, 3).map((bucket: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{bucket.bucketName}</h4>
                            <Badge variant="default">{bucket.bucketScore}% Match</Badge>
                          </div>
                          <div className="space-y-2">
                            {bucket.topCareers.slice(0, 2).map((career: any, careerIndex: number) => (
                              <div key={careerIndex} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{career.careerName}</span>
                                <span className="font-medium">{career.matchScore}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="career"
                        onClick={() => navigate('/results')}
                        className="w-full"
                      >
                        View Full Career Report
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No career recommendations yet</p>
                    <p className="text-sm mt-1">Complete both assessments to get your personalised career matches</p>
                    <Button
                      variant="career"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate(testsCompleted === 0 ? '/test/vibematch' : '/test/edustats')}
                    >
                      {testsCompleted === 0 ? 'Start Assessment' : 'Continue Assessment'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Skill Recommendations */}
            {reportData?.skillRecommendations && reportData.skillRecommendations.length > 0 && (
              <Card>
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
            {reportData?.careerTrajectoryInsights && (
              <Card>
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <div className="text-sm text-muted-foreground">{userData.name}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="text-sm text-muted-foreground">{userData.email}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Education Level</label>
                  <div className="text-sm text-muted-foreground">
                    {userData.grade ? `Grade ${userData.grade}` : 'Not set'}, {userData.board ? `${userData.board} Board` : 'Board not set'}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <ProfileEditor />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;