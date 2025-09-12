'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface QuestionData {
  id: string;
  category: string;
  question: string;
  options: string[];
  why: string;
  required: boolean;
}

interface QuestionsDialogProps {
  questions: QuestionData[];
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
  isVisible: boolean;
}

export default function QuestionsDialog({ questions, onSubmit, onSkip, isVisible }: QuestionsDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!isVisible || !questions.length) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = answers[currentQuestion.id] || !currentQuestion.required;
  const allRequired = questions.filter(q => q.required).every(q => answers[q.id]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      if (allRequired) {
        onSubmit(answers);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user_context':
        return <HelpCircle className="w-4 h-4 text-blue-600" />;
      case 'functionality':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'technical':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'business':
        return <Lightbulb className="w-4 h-4 text-purple-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user_context':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'functionality':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'technical':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'business':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Let's clarify a few details</CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" onClick={onSkip} className="text-sm">
              Skip Questions
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Question */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className={`${getCategoryColor(currentQuestion.category)} flex items-center gap-1`}>
                {getCategoryIcon(currentQuestion.category)}
                {currentQuestion.category.replace('_', ' ')}
              </Badge>
              {currentQuestion.required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentQuestion.question}
              </h3>
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                {currentQuestion.why}
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleOptionSelect(currentQuestion.id, option)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion.id] === option && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < currentQuestionIndex
                      ? 'bg-green-500'
                      : index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLastQuestion ? 'Generate App' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}