/**
 * Profile Page - User Profile & Settings
 * 
 * Displays user information, test history, career preferences,
 * and allows users to manage their account settings.
 */

import React from 'react';
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
  Calendar,
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
import sampleReport from '@/data/sample_report_Aisha.json';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use real user data from authentication
  const userData = {
    name: user?.fullName || user?.name || "User",
    email: user?.email || "",
    grade: user?.grade || null,
    board: user?.board || null,
    schoolName: user?.schoolName || null,
    joinedDate: "2024-09-01", // This could be added to User model if needed
    testsCompleted: 2, // This would come from test data
    totalTests: 3
  };

  const testHistory = [
    {
      testName: "Vibe Match Assessment",
      completedDate: "2024-09-15",
      score: "92%",
      status: "completed"
    },
    {
      testName: "Education Stats",
      completedDate: "2024-09-14", 
      score: "88%",
      status: "completed"
    },
    {
      testName: "Career Exploration",
      completedDate: null,
      score: null,
      status: "pending"
    }
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
                      <span className="font-medium">{userData.testsCompleted}/{userData.totalTests}</span>
                    </div>
                    <Progress value={(userData.testsCompleted / userData.totalTests) * 100} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complete all assessments to get your full career report
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
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {new Date(userData.joinedDate).toLocaleDateString()}</span>
                  </div>
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
                  <Button 
                    variant="career" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate('/test/vibematch')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate('/results')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* RIASEC Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Your Personality Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {Object.entries(sampleReport.vibe_scores).map(([key, value]) => {
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
                          <Badge variant="secondary">{value}%</Badge>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    );
                  })}
                </div>
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
                        <div className={`w-3 h-3 rounded-full ${
                          test.status === 'completed' ? 'bg-success' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <h4 className="font-medium">{test.testName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {test.completedDate 
                              ? `Completed ${new Date(test.completedDate).toLocaleDateString()}`
                              : 'Not started'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {test.score && (
                          <Badge variant="secondary">{test.score}</Badge>
                        )}
                        <Button 
                          variant={test.status === 'completed' ? 'outline' : 'career'} 
                          size="sm"
                          onClick={() => navigate(`/test/${test.testName.toLowerCase().replace(/\s+/g, '')}`)}
                        >
                          {test.status === 'completed' ? 'Review' : 'Start'}
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
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Career Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleReport.top5_buckets.slice(0, 3).map((bucket, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{bucket.bucketName}</h4>
                        <Badge variant="default">{bucket.bucketScore}% Match</Badge>
                      </div>
                      <div className="space-y-2">
                        {bucket.topCareers.slice(0, 2).map((career, careerIndex) => (
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
              </CardContent>
            </Card>
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
                  <div className="text-sm text-muted-foreground">Grade {userData.grade}, {userData.board} Board</div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Update Profile Information
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full">
                    Delete Account
                  </Button>
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