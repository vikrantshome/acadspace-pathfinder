/**
 * JourneyTracker - Visual journey progress indicator
 * Shows the user's progress through the assessment journey
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, User, BookOpen, Target, FileText } from 'lucide-react';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

interface JourneyTrackerProps {
  currentStep: string;
  className?: string;
}

export const JourneyTracker: React.FC<JourneyTrackerProps> = ({ 
  currentStep, 
  className = "" 
}) => {
  const steps: JourneyStep[] = [
    {
      id: 'profile',
      title: 'Profile Setup',
      description: 'Complete your basic information',
      icon: <User className="w-5 h-5" />,
      status: 'completed'
    },
    {
      id: 'vibematch',
      title: 'Personality Test',
      description: 'Discover your interests and traits',
      icon: <BookOpen className="w-5 h-5" />,
      status: currentStep === 'vibematch' ? 'current' : 
               ['edustats', 'results'].includes(currentStep) ? 'completed' : 'upcoming'
    },
    {
      id: 'edustats',
      title: 'Academic Background',
      description: 'Share your educational details',
      icon: <Target className="w-5 h-5" />,
      status: currentStep === 'edustats' ? 'current' : 
               currentStep === 'results' ? 'completed' : 'upcoming'
    },
    {
      id: 'results',
      title: 'Career Report',
      description: 'Get your personalized recommendations',
      icon: <FileText className="w-5 h-5" />,
      status: currentStep === 'results' ? 'current' : 'upcoming'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success/20';
      case 'current':
        return 'text-primary bg-primary/10 border-primary/20 animate-pulse';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'current':
        return <Circle className="w-5 h-5 text-primary animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className={`border-0 bg-gradient-card shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">Your Journey Progress</h3>
            <p className="text-sm text-muted-foreground">
              Complete each step to unlock your career insights
            </p>
          </div>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border ${getStatusColor(step.status)} transition-all duration-300`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        step.status === 'current' ? 'text-primary' : 
                        step.status === 'completed' ? 'text-success' : 
                        'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <Badge 
                    variant={
                      step.status === 'completed' ? 'default' : 
                      step.status === 'current' ? 'default' : 
                      'outline'
                    }
                    className={`text-xs capitalize ${
                      step.status === 'completed' ? 'bg-success text-success-foreground' : 
                      step.status === 'current' ? 'bg-primary text-primary-foreground' : 
                      ''
                    }`}
                  >
                    {step.status === 'completed' ? 'Done' : 
                     step.status === 'current' ? 'Active' : 
                     'Pending'}
                  </Badge>
                </div>
                
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Progress Summary */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-500 ease-out"
                style={{ 
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};