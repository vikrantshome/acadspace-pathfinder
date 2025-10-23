/**
 * ExpandableCareerCard - Detailed career information with collapsible sections
 * 
 * Displays comprehensive career details including reasons, study path, first steps,
 * and confidence level in an easily digestible format
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface CareerData {
  careerName: string;
  matchScore?: number;
  topReasons?: string[];
  studyPath?: string[];
  first3Steps?: string[];
  confidence?: string;
  whatWouldChangeRecommendation?: string;
}

interface Props {
  career: CareerData;
  rank?: number;
  expanded?: boolean;
}

const ExpandableCareerCard: React.FC<Props> = ({ career, rank, expanded: defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getConfidenceColor = (confidence?: string) => {
    if (!confidence) return 'bg-gray-100 text-gray-700';
    const lower = confidence.toLowerCase();
    if (lower === 'high') return 'bg-green-100 text-green-700';
    if (lower === 'medium') return 'bg-yellow-100 text-yellow-700';
    if (lower === 'low') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <Card className={`border transition-all duration-200 ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {rank && (
              <Badge variant="secondary" className="flex-shrink-0">
                #{rank}
              </Badge>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{career.careerName}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {career.matchScore && (
              <Badge variant="default">
                {career.matchScore}% Match
              </Badge>
            )}
            {career.confidence && (
              <Badge className={getConfidenceColor(career.confidence)}>
                {career.confidence}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pt-0">
          {/* Why This Career Fits */}
          {career.topReasons && career.topReasons.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Why This Career Fits You
              </h4>
              <ul className="space-y-2 pl-6">
                {career.topReasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-foreground leading-relaxed list-disc">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Study Path */}
          {career.studyPath && career.studyPath.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Study Path
              </h4>
              <ol className="space-y-2 pl-6">
                {career.studyPath.map((step, idx) => (
                  <li key={idx} className="text-sm text-foreground leading-relaxed list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* First 3 Steps */}
          {career.first3Steps && career.first3Steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Next Steps to Get Started
              </h4>
              <ol className="space-y-2 pl-6">
                {career.first3Steps.map((step, idx) => (
                  <li key={idx} className="text-sm text-foreground leading-relaxed list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* What Would Change */}
          {career.whatWouldChangeRecommendation && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4" />
                Important Consideration
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                {career.whatWouldChangeRecommendation}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ExpandableCareerCard;
