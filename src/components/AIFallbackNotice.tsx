// AI Fallback Notice Component
// Shows when AI service is unavailable and basic content is being displayed

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';

interface AIFallbackNoticeProps {
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export const AIFallbackNotice: React.FC<AIFallbackNoticeProps> = ({ 
  className, 
  showRefresh = false, 
  onRefresh 
}) => {
  return (
    <Card className={`border-amber-200 bg-amber-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-amber-800">AI Enhancements Unavailable</h4>
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                Basic Mode
              </Badge>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              The AI service is currently unavailable. You're seeing basic career recommendations 
              without AI-powered insights. Your report will be enhanced automatically once the service is restored.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Info className="w-3 h-3" />
              <span>All core functionality remains available</span>
            </div>
          </div>
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

