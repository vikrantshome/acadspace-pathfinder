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
import { ArrowLeft, ArrowRight, Save, Pause, BookOpen, Loader2, Home } from 'lucide-react';
import { Question, TestAnswer } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { apiService } from '@/lib/api';
import uiMicrocopy from '@/data/ui_microcopy.json';

const TestPage = () => {
  const { testType } = useParams<{ testType: 'vibematch' | 'edustats' }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const testName = testType === 'vibematch' ? 'Personality & Interests' : 'Academic Background';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number | { [key: string]: number }>('');
  const [subjectGrades, setSubjectGrades] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Load test questions from backend
  useEffect(() => {
    const loadTest = async () => {
      if (!testType) return;

      try {
        const testData = await apiService.getTest(testType);
        setQuestions(testData?.questions || []);
        setCurrentQuestionIndex(0); // reset index when switching tests
      } catch (error) {
        console.error('Error loading test:', error);
        toast({
          title: 'Error loading test',
          description: 'Failed to load test questions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testType]);

  // Clamp index when questions length changes
  useEffect(() => {
    if (questions.length === 0) return;
    if (currentQuestionIndex > questions.length - 1) {
      setCurrentQuestionIndex(questions.length - 1);
    }
    if (currentQuestionIndex < 0) {
      setCurrentQuestionIndex(0);
    }
  }, [questions.length]); // keep deps simple

  // Current question (may be undefined briefly)
  const q = questions[currentQuestionIndex];
  const isLastQuestion = questions.length > 0 && currentQuestionIndex === questions.length - 1;
  const hasAnswer = currentAnswer !== '' && currentAnswer !== null;

  // Load or resume test progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id || !testType) return;

      try {
        const progress = await apiService.getProgress(user.id, testType);
        if (progress) {
          // Check if test is already completed
          if (progress.completed) {
            if (testType === 'vibematch') {
              toast({
                title: 'Personality test already completed! ✅',
                description: 'Moving to academic background assessment.',
              });
              navigate('/test/edustats');
              return;
            } else {
              toast({
                title: 'All tests already completed! 🎉',
                description: 'Redirecting to your report...',
              });
              navigate('/report');
              return;
            }
          }

          setCurrentQuestionIndex(progress.currentQuestionIndex || 0);

          // Convert progress answers to TestAnswer format
          const progressAnswers = Object.entries(progress.answers || {}).map(([questionId, answer]) => ({
            questionId,
            answer: answer as string | string[] | number | { [key: string]: number },
            timestamp: new Date(),
          }));
          setAnswers(progressAnswers);

          toast({
            title: 'Welcome back! 👋',
            description: 'Resuming your test from where you left off.',
          });
        } else {
          toast({
            title: 'Test started! 🚀',
            description: `Beginning your ${testName} assessment.`,
          });
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    if (questions.length > 0) {
      loadProgress();
    }
  }, [user?.id, testType, testName, questions.length]);



  // Load existing answer for current question (safe)
  useEffect(() => {
    if (!q) return;

    const existingAnswer = answers.find((a) => a.questionId === q.id);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.answer);

      // numeric-grid special case
      if (q.type === 'numeric-grid' && typeof existingAnswer.answer === 'object') {
        setSubjectGrades(existingAnswer.answer as Record<string, number>);
      }
    } else {
      setCurrentAnswer(q.type === 'multi' ? [] : '');
      setSubjectGrades({});
    }
    // deps: use optional chaining so we don't read .id before q exists
  }, [currentQuestionIndex, questions[currentQuestionIndex]?.id, answers, questions.length]);

  const handleAnswer = (answer: string | string[] | number | { [key: string]: number }) => {
    if (!q) return;
    const newAnswer: TestAnswer = {
      questionId: q.id,
      answer,
      timestamp: new Date(),
    };

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== q.id);
      return [...filtered, newAnswer];
    });

    setCurrentAnswer(answer);
  };

  const handleOptionSelect = (option: string) => {
    if (!q) return;
    if (q.type === 'single') {
      handleAnswer(option);
    } else if (q.type === 'multi') {
      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (!currentSelected.includes(option)) {
        handleAnswer([...currentSelected, option]);
      }
    }
  };

  const handleOptionUnselect = (option: string) => {
    if (!q) return;
    if (q.type === 'multi') {
      const currentSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      handleAnswer(currentSelected.filter((item) => item !== option));
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
    if (q?.required && !hasAnswer) {
      toast({
        title: 'Please answer this question to continue',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Save progress before moving to the next question
      const answersObject = answers.reduce<Record<string, any>>((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});

      await apiService.saveProgress(testType!, {
        currentQuestionIndex,
        answers: answersObject,
        completed: false, // Ensure we don't mark as complete prematurely
      });

      // If save is successful, then proceed
      if (isLastQuestion) {
        await completeTest();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error Saving Progress',
        description: 'Could not save your progress. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const completeTest = async () => {
    if (!user?.id) return;

    try {
      // Save progress as completed before navigation
      const answersObject = answers.reduce<Record<string, any>>((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});

      await apiService.saveProgress(testType!, {
        currentQuestionIndex: questions.length - 1,
        answers: answersObject,
        completed: true,
      });


      if (testType === 'vibematch') {
        toast({
          title: 'Personality test complete! ✅',
          description: 'Moving to academic background assessment.',
        });
        navigate('/test/edustats');
      } else {
        // Set generating report state
        setGeneratingReport(true);

        // Get vibematch answers from database
        const vibematchProgress = await apiService.getProgress(user.id, 'vibematch');
        const edustatsAnswers = answers.reduce<Record<string, any>>((acc, answer) => {
          acc[answer.questionId] = answer.answer;
          return acc;
        }, {});

        // Check if vibematch test was completed
        if (!vibematchProgress || !vibematchProgress.completed) {
          setGeneratingReport(false);
          toast({
            title: 'Error: Personality test not completed',
            description: 'Please complete the personality test first before generating your report.',
            variant: 'destructive',
          });
          navigate('/test/vibematch');
          return;
        }

        // Combine both test results into a flat structure
        const combinedAnswers = {
          ...(vibematchProgress.answers || {}),
          ...edustatsAnswers,
        };

        const submission = {
          userName: user.name,
          schoolName: user.schoolName,
          grade: parseInt(edustatsAnswers.e_01) || 11,
          board: edustatsAnswers.e_02 || 'CBSE',
          answers: combinedAnswers,
          subjectScores: extractSubjectScores(edustatsAnswers),
          extracurriculars: extractExtracurriculars(edustatsAnswers),
          parentCareers: extractParentCareers(edustatsAnswers),
        };

        try {
          const result = await apiService.submitTest('combined', submission);

          // Ensure both tests are marked as completed after report generation
          try {
            // Mark vibematch as completed (if not already)
            if (!vibematchProgress.completed) {
              await apiService.saveProgress('vibematch', {
                currentQuestionIndex: vibematchProgress.currentQuestionIndex || 0,
                answers: vibematchProgress.answers || {},
                completed: true,
              });
            }
            // Mark edustats as completed (already done, but ensure it's set)
            await apiService.saveProgress('edustats', {
              currentQuestionIndex: questions.length - 1,
              answers: edustatsAnswers,
              completed: true,
            });
          } catch (progressError) {
            console.error('Error updating test completion status:', progressError);
            // Don't fail the whole flow if progress update fails
          }

          // Store the AI-enhanced report data in localStorage for immediate use
          if (result?.report) {
            localStorage.setItem('latestReport', JSON.stringify(result.report));
            console.log('AI-enhanced report stored:', {
              aiEnhanced: result.report.aiEnhanced,
              hasEnhancedSummary: !!result.report.enhancedSummary,
              hasSkillRecommendations: !!result.report.skillRecommendations
            });
          }

          if (result?.reportId) {
            navigate(`/report/${result.reportId}`);
          } else {
            navigate('/report');
          }
        } catch (error) {
          setGeneratingReport(false);
          throw error; // Re-throw to be caught by outer catch
        }
      }
    } catch (error) {
      console.error('Error completing test:', error);
      setGeneratingReport(false);
      toast({
        title: 'Error completing test',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show loading page when generating report
  if (generatingReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Generating Your Report</h2>
            <p className="text-muted-foreground text-lg">
              Please wait while we create your personalized career report...
            </p>
          </div>
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Analyzing your responses</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span>Calculating career matches</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span>Generating AI insights</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions to extract data from answers
  const extractSubjectScores = (answers: Record<string, any>) => {
    const scores: Record<string, number> = {};
    if (answers.e_04) {
      Object.entries(answers.e_04).forEach(([subject, score]) => {
        if (typeof score === 'number') {
          scores[subject] = score;
        }
      });
    }
    return scores;
  };

  const extractExtracurriculars = (answers: Record<string, any>) => {
    return answers.e_06 || [];
  };

  const extractParentCareers = (answers: Record<string, any>) => {
    return answers.e_07 || [];
  };

  const handlePause = async () => {
    if (!user?.id || !testType || saving) return;

    setSaving(true);
    try {
      // Save current progress
      const answersObject = answers.reduce<Record<string, any>>((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});

      await apiService.saveProgress(testType, {
        currentQuestionIndex,
        answers: answersObject,
      });

      toast({
        title: 'Test paused ⏸️',
        description: 'Your progress has been saved. You can resume anytime.',
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error pausing test:', error);
      toast({
        title: 'Error saving progress',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionInput = () => {
    const qLocal = q;
    if (!qLocal) return null;

    switch (qLocal.type) {
      case 'likert':
        return (
          <OptionButton
            option={qLocal.text}
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
            {qLocal.options?.map((option, index) => (
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
            {qLocal.options?.map((option, index) => (
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

      case 'numeric-grid': {
        // Get selected subjects from previous answer (e_03)
        const subjectAnswer = answers.find((a) => a.questionId === 'e_03');
        const selectedSubjects = Array.isArray(subjectAnswer?.answer) ? subjectAnswer.answer : [];

        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{qLocal.instruction}</div>

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
      }

      default:
        return null;
    }
  };

  // Show loading state
  if (authLoading || loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Loading questions...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your assessment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Home Button - Top Left */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-[60]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-background/95 backdrop-blur-sm shadow-md"
        >
          <Home className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <ProgressBar 
        current={Math.min(currentQuestionIndex + 1, Math.max(questions.length, 1))} 
        total={questions.length} 
        testName={testName} 
        showSteps 
        className="pl-20 md:pl-24"
      />

      {/* Auth Protection */}
      {!user && !authLoading && (
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to access your personalized career assessment.</p>
            <Button onClick={() => navigate('/auth')} variant="default" className="w-full">
              Sign In to Continue
            </Button>
          </div>
        </div>
      )}

      {/* Test Content - Only show if authenticated */}
      {user && (
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
          <div className="flex flex-col xl:grid xl:grid-cols-4 gap-4 md:gap-8">
            {/* Journey Tracker - Mobile: top, Desktop: sidebar */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <JourneyTracker currentStep={testType || 'vibematch'} className="xl:sticky xl:top-24" />
            </div>

            {/* Test Content */}
            <div className="xl:col-span-3 order-1 xl:order-2">
              <Card className="gradient-card border-0 shadow-xl animate-fade-in">
                <CardContent className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                  {/* Question Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        Question {Math.min(currentQuestionIndex + 1, Math.max(questions.length, 1))} of {questions.length}
                      </Badge>

                      <div className="flex items-center gap-2">
                        {q?.required ? (
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

                    <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold leading-relaxed">
                      {q?.text ?? ''}
                    </h1>
                  </div>

                  {/* Question Input */}
                  <div className="py-6">{renderQuestionInput()}</div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-6 border-t">
                    <div className="flex flex-col sm:flex-row gap-3 sm:flex-1">
                      <Button variant="outline" onClick={() => (currentQuestionIndex > 0 ? setCurrentQuestionIndex((p) => p - 1) : navigate('/onboarding'))} className="w-full sm:w-auto hover-scale">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {uiMicrocopy.tests.backBtn}
                      </Button>

                      <Button variant="ghost" onClick={handlePause} className="w-full sm:w-auto">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause & Save
                      </Button>
                    </div>

                    <Button
                      variant={isLastQuestion ? 'success' : 'career'}
                      onClick={handleNext}
                      disabled={(!!q?.required && !hasAnswer) || saving}
                      className="w-full sm:w-auto sm:min-w-[140px] hover-scale order-first sm:order-last"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : isLastQuestion ? (
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
                  {questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0}% complete
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{testType === 'vibematch' ? 'Discovering your personality and interests...' : 'Analyzing your academic background...'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
