/**
 * ReportViewer - Professional Career Report matching PDF format
 * Displays comprehensive career analysis and recommendations
 */

import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import sampleReport from '@/data/sample_report_Aisha.json';

const ReportViewer = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Use profile data if available, fallback to sample
  const reportData = {
    studentName: profile?.full_name || sampleReport.studentName,
    schoolName: profile?.school_name || 'Your School',
    grade: profile?.grade || sampleReport.grade,
    board: profile?.board || sampleReport.board,
    vibe_scores: sampleReport.vibe_scores,
    top5_buckets: sampleReport.top5_buckets,
    summaryParagraph: sampleReport.summaryParagraph
  };

  const riasecLabels = {
    R: { name: 'Realistic', description: 'Practical, hands-on problem solver' },
    I: { name: 'Investigative', description: 'Analytical, research-oriented thinker' },
    A: { name: 'Artistic', description: 'Creative, innovative, expressive' },
    S: { name: 'Social', description: 'Helpful, collaborative, people-focused' },
    E: { name: 'Enterprising', description: 'Leadership, persuasive, goal-driven' },
    C: { name: 'Conventional', description: 'Organized, detail-oriented, systematic' }
  };

  const handleDownload = () => {
    // TODO: Implement PDF generation
    console.log('Downloading report...');
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing report...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Cover Page Style */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Your Dreams to Reality Handbook
              </h1>
              <div className="text-xl md:text-2xl font-semibold opacity-90">
                Naviksha AI
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{reportData.studentName}</h2>
              <p className="text-lg opacity-80">{reportData.schoolName}</p>
              <div className="flex items-center justify-center gap-4 text-sm opacity-70">
                <span>Grade {reportData.grade}</span>
                <span>•</span>
                <span>{reportData.board} Board</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="secondary" onClick={handleDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Share2 className="w-4 h-4" />
                Share Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Section */}
      <div className="bg-gradient-card py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-success-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-success mb-2">Congratulations!</h2>
                <p className="text-lg text-muted-foreground">
                  You've achieved the first significant point on your Career Success Journey.
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Your Journey Map with Naviksha AI Started!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>✓ Completed Comprehensive Assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>✓ Generated Personalized Career Report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span>→ Explore Career Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>→ Access Career Development Resources</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'personality', label: 'Personality Profile', icon: TrendingUp },
            { id: 'careers', label: 'Career Recommendations', icon: Briefcase },
            { id: 'next-steps', label: 'Next Steps', icon: ArrowRight }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Card */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Career Profile Summary</CardTitle>
                    <p className="text-muted-foreground">
                      AI-Powered Career Analysis Results
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed text-lg">
                  {reportData.summaryParagraph}
                </p>
              </CardContent>
            </Card>

            {/* Assessment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Assessment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                RIASEC Personality & Interest Profile
              </CardTitle>
              <p className="text-muted-foreground">
                Your personality type based on Holland's RIASEC model
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(reportData.vibe_scores).map(([key, value]) => {
                  const info = riasecLabels[key as keyof typeof riasecLabels];
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{info.name}</span>
                            <Badge variant="secondary" className="text-sm">{value}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                      <Progress value={value} className="h-3" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Career Recommendations Tab */}
        {activeTab === 'careers' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Top 5 Careers for You</h2>
              <p className="text-lg text-muted-foreground">
                Personalized recommendations based on your unique profile
              </p>
            </div>

            {reportData.top5_buckets.map((bucket, index) => (
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
                    {bucket.topCareers.slice(0, 3).map((career, careerIndex) => (
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
                              {career.topReasons.map((reason, idx) => (
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
                              {career.first3Steps.map((step, idx) => (
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

        {/* Next Steps Tab */}
        {activeTab === 'next-steps' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recommended Next Steps
              </CardTitle>
              <p className="text-muted-foreground">
                Your personalized action plan for career success
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    title: "Explore Career Details",
                    description: "Research your top 3-5 career recommendations in depth. Understand daily responsibilities, growth opportunities, and industry trends.",
                    icon: <Target className="w-5 h-5" />,
                    timeline: "This week"
                  },
                  {
                    title: "Educational Pathway Planning",
                    description: "Research educational requirements, courses, and institutions that align with your career choices. Plan your subject selection for upcoming grades.",
                    icon: <GraduationCap className="w-5 h-5" />,
                    timeline: "Next 2 weeks"
                  },
                  {
                    title: "Professional Networking",
                    description: "Connect with professionals in your areas of interest through LinkedIn, career events, or through family connections. Conduct informational interviews.",
                    icon: <Users className="w-5 h-5" />,
                    timeline: "This month"
                  },
                  {
                    title: "Gain Experience",
                    description: "Look for internships, job shadowing opportunities, or volunteer work in your fields of interest. Consider joining relevant clubs or competitions.",
                    icon: <Briefcase className="w-5 h-5" />,
                    timeline: "Next 3 months"
                  },
                  {
                    title: "Skill Development",
                    description: "Identify and develop key skills relevant to your top career choices. Take online courses, attend workshops, or start personal projects.",
                    icon: <Lightbulb className="w-5 h-5" />,
                    timeline: "Ongoing"
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{step.title}</h4>
                        <Badge variant="outline" className="text-xs">{step.timeline}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
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