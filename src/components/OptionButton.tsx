/**
 * OptionButton Component
 * 
 * Interactive button for test questions with support for:
 * - Single selection
 * - Multiple selection  
 * - Double-tap to unselect
 * - Likert scale (0-3)
 * - Visual feedback and animations
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface OptionButtonProps {
  option: string;
  isSelected: boolean;
  onSelect: (option: string) => void;
  onUnselect?: (option: string) => void;
  type?: 'single' | 'multi' | 'likert';
  likertValue?: number;
  onLikertChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  isSelected,
  onSelect,
  onUnselect,
  type = 'single',
  likertValue = 0,
  onLikertChange,
  disabled = false,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;

    triggerAnimation();

    if (isSelected) {
      // Toggle off if already selected
      onUnselect?.(option);
    } else {
      // Select if not selected
      onSelect(option);
    }
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
  };

  if (type === 'likert') {
    return (
      <div className={cn("space-y-3", className)}>
        <LikertScale 
          value={likertValue}
          onChange={onLikertChange || (() => {})}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <Button
      variant={isSelected ? "career" : "outline"}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left h-auto p-4 relative overflow-hidden",
        "hover:scale-98 active:scale-95 transition-all duration-150",
        isAnimating && "animate-pulse",
        isSelected && "ring-2 ring-primary/50",
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className="flex-1 text-sm leading-relaxed">{option}</span>
        
        {/* Selection indicator */}
        <div className={cn(
          "ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected ? "bg-primary border-primary" : "border-muted-foreground"
        )}>
          {isSelected && (
            <Check className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
      </div>

      {/* Multi-selection badge */}
      {type === 'multi' && isSelected && (
        <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
          Selected
        </Badge>
      )}
    </Button>
  );
};

// Likert Scale Component (1-5 scale)
const LikertScale: React.FC<{
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const labels = [
    "Strongly Disagree",
    "Disagree", 
    "Neutral",
    "Agree",
    "Strongly Agree"
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Button
            key={rating}
            variant={value === rating ? "career" : "outline"}
            size="sm"
            onClick={() => onChange(rating)}
            disabled={disabled}
            className={cn(
              "flex-1 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              value === rating && "shadow-primary"
            )}
          >
            <div className="text-center">
              <div className="font-bold">{rating}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Current selection label */}
      {value >= 1 && (
        <div className="text-center text-sm text-muted-foreground font-medium">
          {labels[value - 1]}
        </div>
      )}
    </div>
  );
};