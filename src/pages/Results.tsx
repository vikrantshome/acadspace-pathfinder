/**
 * Results Page - Career Assessment Results
 * 
 * Displays personalized career recommendations, detailed analysis,
 * and next steps based on completed assessments.
 */

import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CareerCard } from '@/components/CareerCard';
import uiMicrocopy from '@/data/ui_microcopy.json';
import sampleReport from '@/data/sample_report_Aisha.json';

const Results = () => {
  const navigate = useNavigate();
  
  const handleDownload = () => {
    // Navigate to full report for download
    navigate('/report');
  };
  
  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: 'My Career Assessment Results',
        text: 'Check out my personalized career recommendations!',
        url: window.location.origin + '/report'
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.origin + '/report');
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
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
        {/* Summary Card */}
        <Card className="mb-8 gradient-card border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Career Profile Summary</CardTitle>
                <p className="text-muted-foreground">
                  {sampleReport.studentName} • Grade {sampleReport.grade} • {sampleReport.board}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {sampleReport.summaryParagraph}
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

        {/* Top Career Buckets */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            {uiMicrocopy.results.top5Heading}
          </h2>

          {sampleReport.top5_buckets.map((bucket, index) => (
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
              <Button onClick={() => navigate('/')} variant="outline">
                Take Another Test
              </Button>
              <Button onClick={() => navigate('/profile')} className="group">
                View Full Profile
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