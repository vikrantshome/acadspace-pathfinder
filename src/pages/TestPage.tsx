/**
 * TestPage Component
 * 
 * Enhanced test experience with authentication, progress tracking, and proper journey flow.
 * Handles both vibematch (personality) and edustats (academic) tests with backend integration.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ProgressBar';
import { JourneyTracker } from '@/components/JourneyTracker';
import { OptionButton } from '@/components/OptionButton';
import { ArrowLeft, ArrowRight, Save, Pause, BookOpen } from 'lucide-react';
import { Question, TestAnswer } from '@/types';
import { toast } from '@/hooks/use-toast';
// Removed auth dependencies for demo
import uiMicrocopy from '@/data/ui_microcopy.json';
import vibeQuestions from '@/data/vibematch_questions.json';
import eduQuestions from '@/data/edustats_questions.json';

const TestPage = () => {
  const { testType } = useParams<{ testType: 'vibematch' | 'edustats' }>();
  const navigate = useNavigate();
  
  // Demo mode - no auth required
  
  // Load questions based on test type
  const questions: Question[] = testType === 'vibematch' 
    ? (vibeQuestions as Question[]) 
    : (eduQuestions as Question[]);
  const testName = testType === 'vibematch' ? 'Personality & Interests' : 'Academic Background';
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number | { [key: string]: number }>('');
  const [subjectGrades, setSubjectGrades] = useState<{ [key: string]: number }>({});
  const [saving, setSaving] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswer = currentAnswer !== '' && currentAnswer !== null;

  // Demo mode - no persistence needed
  useEffect(() => {
    toast({
      title: "Test started! 🚀", 
      description: `Beginning your ${testName} assessment.`,
    });
  }, [testName]);

  // Load existing answer for current question
  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.answer);
      
      // Special handling for numeric-grid (subject grades)
      if (currentQuestion.type === 'numeric-grid' && typeof existingAnswer.answer === 'object') {
        setSubjectGrades(existingAnswer.answer as { [key: string]: number });
      }
    } else {
      setCurrentAnswer(currentQuestion.type === 'multi' ? [] : '');
      setSubjectGrades({});
    }
  }, [currentQuestionIndex, currentQuestion.id, answers]);

  const handleAnswer = (answer: string | string[] | number | { [key: string]: number }) => {
    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date()
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });

    setCurrentAnswer(answer);
  };

  const handleOptionSelect = (option: string) => {
    if (currentQuestion.type === 'single') {
      handleAnswer(option);
    } else if (currentQuestion.type === 'multi') {
      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (!currentSelected.includes(option)) {
        handleAnswer([...currentSelected, option]);
      }
    }
  };

  const handleOptionUnselect = (option: string) => {
    if (currentQuestion.type === 'multi') {
      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      handleAnswer(currentSelected.filter(item => item !== option));
    } else {
      handleAnswer('');
    }
  };

  const handleLikertChange = (value: number) => {
    handleAnswer(value);
  };

  const handleSubjectGradeChange = (subject: string, grade: number) => {
    const newGrades = { ...subjectGrades, [subject]: grade };
    setSubjectGrades(newGrades);
    handleAnswer(newGrades);
  };

  const handleNext = async () => {
    // Validation for required questions
    if (currentQuestion.required && !hasAnswer) {
      toast({
        title: "Please answer this question to continue",
        variant: "destructive"
      });
      return;
    }

    if (isLastQuestion) {
      await completeTest();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const completeTest = async () => {
    // Navigate to next step
    if (testType === 'vibematch') {
      toast({
        title: "Personality test complete! ✅",
        description: "Moving to academic background assessment.",
      });
      navigate('/test/edustats');
    } else {
      toast({
        title: "All tests complete! 🎉",
        description: "Generating your personalized career report...",
      });
      
      // Generate report and navigate to results
      setTimeout(() => {
        navigate('/report');
      }, 2000);
    }
  };

  const handlePause = async () => {
    toast({
      title: "Test paused ⏸️",
      description: "You can resume anytime by restarting the test.",
    });
    
    navigate('/');
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate('/onboarding');
    }
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'likert':
        return (
          <OptionButton
            option={currentQuestion.text}
            isSelected={true}
            onSelect={() => {}}
            type="likert"
            likertValue={typeof currentAnswer === 'number' ? currentAnswer : 0}
            onLikertChange={handleLikertChange}
          />
        );

      case 'single':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <OptionButton
                key={index}
                option={option}
                isSelected={currentAnswer === option}
                onSelect={handleOptionSelect}
                onUnselect={handleOptionUnselect}
                type="single"
              />
            ))}
          </div>
        );

      case 'multi':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <OptionButton
                key={index}
                option={option}
                isSelected={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                onSelect={handleOptionSelect}
                onUnselect={handleOptionUnselect}
                type="multi"
              />
            ))}
          </div>
        );

      case 'subjective':
        return (
          <div className="space-y-3">
            <Textarea
              placeholder={uiMicrocopy.placeholders.subjectiveExample}
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="min-h-[120px] resize-none focus-ring"
            />
            <div className="text-xs text-muted-foreground">
              Optional - Share your thoughts to help us understand you better
            </div>
          </div>
        );

      case 'numeric-grid':
        // Get selected subjects from previous answer (e_03)
        const subjectAnswer = answers.find(a => a.questionId === 'e_03');
        const selectedSubjects = Array.isArray(subjectAnswer?.answer) ? subjectAnswer.answer : [];
        
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {currentQuestion.instruction}
            </div>
            
            <div className="grid gap-4">
              {selectedSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium">{subject}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={subjectGrades[subject] || ''}
                      onChange={(e) => handleSubjectGradeChange(subject, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <ProgressBar 
        current={currentQuestionIndex + 1}
        total={questions.length}
        testName={testName}
        showSteps
      />

      {/* Test Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Journey Tracker - Sidebar */}
          <div className="lg:col-span-1">
            <JourneyTracker 
              currentStep={testType || 'vibematch'} 
              className="sticky top-24"
            />
          </div>

          {/* Test Content */}
          <div className="lg:col-span-3">
            <Card className="gradient-card border-0 shadow-xl animate-fade-in">
              <CardContent className="p-8 space-y-6">
                {/* Question Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                    {/* Demo mode - no saving needed */}
                      
                      {currentQuestion.required ? (
                        <Badge variant="destructive" className="text-xs">
                          {uiMicrocopy.tests.requiredLabel}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {uiMicrocopy.tests.optionalLabel}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-semibold leading-relaxed">
                    {currentQuestion.text}
                  </h1>
                </div>

                {/* Question Input */}
                <div className="py-6">
                  {renderQuestionInput()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="w-full sm:w-auto hover-scale"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {uiMicrocopy.tests.backBtn}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handlePause}
                    className="w-full sm:w-auto"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause & Save
                  </Button>

                  <div className="flex-1" />

                  <Button
                    variant={isLastQuestion ? "success" : "career"}
                    onClick={handleNext}
                    disabled={currentQuestion.required && !hasAnswer}
                    className="w-full sm:w-auto min-w-[140px] hover-scale"
                  >
                    {isLastQuestion ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {testType === 'vibematch' ? 'Continue to Next Test' : 'Complete & Generate Report'}
                      </>
                    ) : (
                      <>
                        {uiMicrocopy.tests.nextBtn}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <div className="text-center mt-6 space-y-2">
              <div className="text-sm text-muted-foreground">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% complete
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>
                  {testType === 'vibematch' 
                    ? 'Discovering your personality and interests...' 
                    : 'Analyzing your academic background...'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;