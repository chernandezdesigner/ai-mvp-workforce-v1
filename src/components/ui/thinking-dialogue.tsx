'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Lightbulb,
  Target,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface ThinkingStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  timestamp?: Date;
}

export interface ThinkingDialogueProps {
  isThinking: boolean;
  currentThought?: string;
  steps: ThinkingStep[];
  onComplete?: () => void;
}

const getStepIcon = (status: ThinkingStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'in_progress':
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    case 'error':
      return <Circle className="w-4 h-4 text-red-600" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

const getStepBadgeColor = (status: ThinkingStep['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function ThinkingDialogue({ 
  isThinking, 
  currentThought, 
  steps, 
  onComplete 
}: ThinkingDialogueProps) {
  const [displayedThought, setDisplayedThought] = useState('');
  const [thoughtIndex, setThoughtIndex] = useState(0);

  // Typewriter effect for current thought
  useEffect(() => {
    if (!currentThought || !isThinking) {
      setDisplayedThought('');
      setThoughtIndex(0);
      return;
    }

    if (thoughtIndex < currentThought.length) {
      const timeout = setTimeout(() => {
        setDisplayedThought(currentThought.slice(0, thoughtIndex + 1));
        setThoughtIndex(thoughtIndex + 1);
      }, 20); // Typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentThought, thoughtIndex, isThinking]);

  // Reset when thinking starts
  useEffect(() => {
    if (isThinking && currentThought) {
      setThoughtIndex(0);
      setDisplayedThought('');
    }
  }, [currentThought, isThinking]);

  if (!isThinking && steps.length === 0) {
    return null;
  }

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Brain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">AI Thinking</h3>
            <p className="text-xs text-gray-600">Analyzing your request and planning the architecture</p>
          </div>
          {isThinking && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
              Processing...
            </Badge>
          )}
        </div>

        {/* Current Thought */}
        {isThinking && currentThought && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Current thought:</p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {displayedThought}
                  {thoughtIndex < currentThought.length && (
                    <span className="inline-block w-0.5 h-4 bg-blue-600 ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <Target className="w-3 h-3" />
              Progress
            </h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 truncate">
                        {step.title}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStepBadgeColor(step.status)}`}
                      >
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                  {index < steps.length - 1 && step.status === 'completed' && (
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary when complete */}
        {!isThinking && steps.some(s => s.status === 'completed') && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Architecture generated successfully
              </p>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Your app flow diagram is ready for review and editing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
