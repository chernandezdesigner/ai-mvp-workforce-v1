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

  // Slower typewriter effect for current thought (like Cursor)
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
      }, 35); // Slower typing speed for better readability

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
    <div className="bg-gray-50/80 border border-gray-200/60 rounded-lg backdrop-blur-sm">
      <div className="p-3 space-y-3">
        {/* Minimal Header */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-200/60 rounded">
            <Brain className="w-3 h-3 text-gray-600" />
          </div>
          <span className="text-xs text-gray-600 font-medium">Thinking...</span>
          {isThinking && (
            <div className="flex space-x-1 ml-auto">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
          )}
        </div>

        {/* Current Thought - Minimal */}
        {isThinking && currentThought && (
          <div className="text-xs text-gray-700 leading-relaxed font-mono bg-white/40 rounded p-2 border border-gray-200/40">
            {displayedThought}
            {thoughtIndex < currentThought.length && (
              <span className="inline-block w-0.5 h-3 bg-gray-500 ml-0.5 animate-pulse" />
            )}
          </div>
        )}

        {/* Minimal Progress Dots */}
        {steps.length > 0 && (
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                  step.status === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`} />
                {index < steps.length - 1 && (
                  <div className="w-2 h-px bg-gray-300" />
                )}
              </div>
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {steps.filter(s => s.status === 'completed').length}/{steps.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
