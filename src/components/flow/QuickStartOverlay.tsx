'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  X,
  MousePointer,
  Plus,
  Edit,
  Trash2,
  Move,
  Keyboard,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface QuickStartOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'V', action: 'Select Tool' },
  { key: 'H', action: 'Pan Tool' },
  { key: 'F', action: 'Fit View' },
  { key: 'G', action: 'Toggle Grid' },
  { key: 'M', action: 'Toggle Minimap' },
  { key: 'Del', action: 'Delete Selected' },
  { key: 'Ctrl+Z', action: 'Undo' },
  { key: 'Ctrl+Y', action: 'Redo' },
  { key: 'Ctrl+C', action: 'Copy' },
];

const tips = [
  {
    icon: MousePointer,
    title: 'Selection & Navigation',
    description: 'Click nodes to select, drag to move. Hold Shift for multi-select.'
  },
  {
    icon: Plus,
    title: 'Adding Nodes',
    description: 'Use the toolbar to add screens, APIs, and flow control nodes.'
  },
  {
    icon: Edit,
    title: 'Editing',
    description: 'Right-click nodes for context menu, or double-click to edit properties.'
  },
  {
    icon: Move,
    title: 'Connections',
    description: 'Drag from node handles to create connections between elements.'
  }
];

export default function QuickStartOverlay({
  isVisible,
  onClose
}: QuickStartOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Check if user has seen the guide before
      const hasSeenGuide = localStorage.getItem('flowDiagram_hasSeenQuickStart');
      if (hasSeenGuide) {
        onClose();
      }
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    localStorage.setItem('flowDiagram_hasSeenQuickStart', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < tips.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative max-w-2xl mx-4">
        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Flow Diagram Quick Start
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Learn how to create and edit your app flows
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current Tip */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {React.createElement(tips[currentStep].icon, { 
                  className: "w-12 h-12 text-blue-500" 
                })}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {tips[currentStep].title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {tips[currentStep].description}
              </p>
            </div>

            {/* Progress */}
            <div className="flex justify-center gap-2">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Keyboard Shortcuts */}
            {currentStep === tips.length - 1 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Keyboard Shortcuts
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-gray-600">{shortcut.action}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-600"
              >
                Skip Tour
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {tips.length}
                </span>
                <Button onClick={handleNext} className="gap-2">
                  {currentStep < tips.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
