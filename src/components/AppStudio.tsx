'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Download, 
  RefreshCw, 
  Sparkles,
  Clock,
  Layers,
  Database,
  Zap,
  AlertTriangle,
  Send,
  MessageSquare,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Home,
  FolderOpen,
  GitBranch,
  ArrowRight
} from 'lucide-react';

import FlowDiagram from './flow/FlowDiagram';
import ThinkingDialogue from './ui/thinking-dialogue';
import QuestionsDialog from './ui/questions-dialog';
import ToolsHome from './ToolsHome';
import WireframeStudio from './WireframeStudio';
import { AIFlowGenerator } from '@/lib/ai-flow-generator';
import { AppArchitecture, AppFlow } from '@/types/app-architecture';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'thinking';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  thinkingSteps?: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'error';
  }>;
  currentThought?: string;
}

type ActiveTool = 'home' | 'flow-diagrams' | 'wireframer' | 'ui-designer' | 'ux-researcher' | 'component-builder';

interface QuestionData {
  id: string;
  category: string;
  question: string;
  options: string[];
  why: string;
  required: boolean;
}

interface ProjectContext {
  initialPrompt: string;
  questions?: QuestionData[];
  answers?: Record<string, string>;
  isQuestioningComplete?: boolean;
}

export default function AppStudio() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('home');
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [architecture, setArchitecture] = useState<AppArchitecture | null>(null);
  const [flow, setFlow] = useState<AppFlow | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProjectMode, setIsProjectMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDiagramFullscreen, setIsDiagramFullscreen] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext>({ initialPrompt: '' });
  const [showQuestions, setShowQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleInitialPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setProjectContext({ initialPrompt: prompt });
    
    // Generate contextual questions first
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt }),
      });
      
      if (response.ok) {
        const { questions } = await response.json();
        setProjectContext(prev => ({ ...prev, questions }));
        setShowQuestions(true);
        setIsProjectMode(true);
      } else {
        // Fallback to direct generation if questions fail
        await handleGenerate(prompt);
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      await handleGenerate(prompt);
    }
  }, []);

  const handleAnswerSubmit = useCallback(async (answers: Record<string, string>) => {
    setProjectContext(prev => ({ ...prev, answers, isQuestioningComplete: true }));
    setShowQuestions(false);
    
    // Generate architecture with context
    const contextualPrompt = buildContextualPrompt(projectContext.initialPrompt, answers);
    await handleGenerate(contextualPrompt);
  }, [projectContext.initialPrompt]);

  const handleSkipQuestions = useCallback(async () => {
    setShowQuestions(false);
    await handleGenerate(projectContext.initialPrompt);
  }, [projectContext.initialPrompt]);

  const buildContextualPrompt = (initialPrompt: string, answers: Record<string, string>): string => {
    let contextualPrompt = initialPrompt + '\n\nAdditional Context:\n';
    Object.entries(answers).forEach(([questionId, answer]) => {
      contextualPrompt += `- ${questionId}: ${answer}\n`;
    });
    return contextualPrompt;
  };

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Add initial thinking message
    const thinkingMessageId = (Date.now() + 1).toString();
    const initialThinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      type: 'thinking',
      content: 'AI is thinking...',
      timestamp: new Date(),
      isThinking: true,
      thinkingSteps: [],
      currentThought: 'Let me think about your request...'
    };
    setChatMessages(prev => [...prev, initialThinkingMessage]);
    
    setIsGenerating(true);
    setIsProjectMode(true);
    
    try {
      // Get real AI thinking process
      const thinkingResponse = await fetch('/api/ai-thinking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userRequest: prompt }),
      });

      if (!thinkingResponse.ok) {
        throw new Error('Failed to get AI thinking');
      }

      const { steps, thoughts } = await thinkingResponse.json();
      
      // Update message with real thinking steps
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessageId 
            ? {
                ...msg,
                thinkingSteps: steps.map((step: any) => ({ ...step, status: 'pending' })),
                currentThought: thoughts[0] || 'Analyzing your request...'
              }
            : msg
        )
      );

      // Start architecture generation in parallel with thinking
      const architecturePromise = fetch('/api/generate-architecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal: prompt }),
      });

      // Process each thinking step with real thoughts - slower pacing
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2500)); // Slower pacing for better readability
        
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === thinkingMessageId 
              ? {
                  ...msg,
                  currentThought: steps[i].thought,
                  thinkingSteps: msg.thinkingSteps?.map((step, index) => ({
                    ...step,
                    status: index < i ? 'completed' : index === i ? 'in_progress' : 'pending'
                  }))
                }
              : msg
          )
        );
      }
      
      // Continue thinking while waiting for architecture generation
      const additionalThoughts = [
        'Finalizing the screen connections and user flow logic...',
        'Ensuring the navigation patterns are intuitive and accessible...',
        'Optimizing the user journey for mobile-first experience...',
        'Adding error handling and edge cases to the flow...',
        'Completing the architecture generation...'
      ];

      let thoughtCounter = 0;
      const thinkingInterval = setInterval(() => {
        if (thoughtCounter < additionalThoughts.length) {
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === thinkingMessageId 
                ? {
                    ...msg,
                    currentThought: additionalThoughts[thoughtCounter]
                  }
                : msg
            )
          );
          thoughtCounter++;
        }
      }, 3000); // Continue thinking every 3 seconds

      // Wait for architecture generation to complete
      const response = await architecturePromise;
      clearInterval(thinkingInterval);

      // Complete all steps
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessageId 
            ? {
                ...msg,
                currentThought: 'Architecture complete! Generating your flow diagram...',
                thinkingSteps: msg.thinkingSteps?.map(step => ({ ...step, status: 'completed' as const }))
              }
            : msg
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause before completion

      if (!response.ok) {
        throw new Error('Failed to generate architecture');
      }

      const { architecture: newArchitecture } = await response.json();
      const newFlow = AIFlowGenerator.architectureToFlow(newArchitecture);
      
      setArchitecture(newArchitecture);
      setFlow(newFlow);
      
      // Replace thinking message with success message
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessageId 
            ? { 
                ...msg, 
                type: 'assistant',
                content: `✅ Generated user flows for your ${newArchitecture.name.toLowerCase()}. The flow diagram shows your complete user journey and is ready for review and editing.`,
                isThinking: false,
                currentThought: undefined,
                thinkingSteps: undefined
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to generate architecture:', error);
      // Update thinking message with error
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessageId 
            ? { 
                ...msg, 
                type: 'assistant',
                content: '❌ Failed to generate user flows. Please try again.',
                isThinking: false,
                currentThought: undefined,
                thinkingSteps: msg.thinkingSteps?.map(step => ({ 
                  ...step, 
                  status: step.status === 'in_progress' ? 'error' : step.status 
                }))
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isGenerating) return;
    
    if (!isProjectMode) {
      // First message - generate architecture
      await handleGenerate(currentMessage);
    } else {
      // Subsequent messages - show real thinking for modifications
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      
      setIsGenerating(true);
      
      // Add initial thinking message for modifications
      const thinkingMessageId = (Date.now() + 1).toString();
      const initialThinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        type: 'thinking',
        content: 'AI is analyzing your request...',
        timestamp: new Date(),
        isThinking: true,
        thinkingSteps: [],
        currentThought: 'Let me think about your modification request...'
      };
      setChatMessages(prev => [...prev, initialThinkingMessage]);
      
      try {
        // Get real AI thinking for modifications
        const modificationContext = `User wants to modify their existing app architecture. Their original request created a ${architecture?.name || 'app'}, and now they're asking: "${currentMessage}"`;
        
        const thinkingResponse = await fetch('/api/ai-thinking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userRequest: modificationContext }),
        });

        if (thinkingResponse.ok) {
          const { steps, thoughts } = await thinkingResponse.json();
          
          // Update with real thinking steps
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === thinkingMessageId 
                ? {
                    ...msg,
                    thinkingSteps: steps.map((step: any) => ({ ...step, status: 'pending' })),
                    currentThought: thoughts[0] || 'Analyzing your modification request...'
                  }
                : msg
            )
          );

          // Process each step with real thoughts - slower for better readability
          for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Slower pacing
            
            setChatMessages(prev => 
              prev.map(msg => 
                msg.id === thinkingMessageId 
                  ? {
                      ...msg,
                      currentThought: steps[i].thought,
                      thinkingSteps: msg.thinkingSteps?.map((step, index) => ({
                        ...step,
                        status: index < i ? 'completed' : index === i ? 'in_progress' : 'pending'
                      }))
                    }
                  : msg
              )
            );
          }
          
          // Add some final thinking thoughts
          const finalThoughts = [
            'Considering the best approach for your modification...',
            'Thinking about how this fits with your existing flow...'
          ];

          for (let i = 0; i < finalThoughts.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setChatMessages(prev => 
              prev.map(msg => 
                msg.id === thinkingMessageId 
                  ? {
                      ...msg,
                      currentThought: finalThoughts[i]
                    }
                  : msg
              )
            );
          }
          
          // Complete and respond
          await new Promise(resolve => setTimeout(resolve, 1000));
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === thinkingMessageId 
                ? { 
                    ...msg, 
                    type: 'assistant',
                    content: 'I understand your request for modifications. Currently, the flow generation system is working well. In future updates, I\'ll be able to make real-time changes to your user flows based on your feedback. For now, you can manually edit the diagram or generate a new flow with updated requirements.',
                    isThinking: false,
                    currentThought: undefined,
                    thinkingSteps: undefined
                  }
                : msg
            )
          );
        } else {
          throw new Error('Failed to get thinking response');
        }
        
      } catch (error) {
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === thinkingMessageId 
              ? { 
                  ...msg, 
                  type: 'assistant',
                  content: 'I can help you modify the user flows. Currently, the flow generation is working well. In future updates, I\'ll be able to make real-time changes to your diagram based on your feedback.',
                  isThinking: false,
                  currentThought: undefined,
                  thinkingSteps: undefined
                }
              : msg
          )
        );
      } finally {
        setIsGenerating(false);
      }
    }
    
    setCurrentMessage('');
  }, [currentMessage, isGenerating, isProjectMode, handleGenerate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleToolSelect = useCallback((toolId: string) => {
    setActiveTool(toolId as ActiveTool);
    // Reset state when switching tools
    if (toolId === 'flow-diagrams') {
      setIsProjectMode(false);
      setArchitecture(null);
      setFlow(null);
      setChatMessages([]);
      setCurrentMessage('');
    }
  }, []);

  const handleBackToHome = useCallback(() => {
    setActiveTool('home');
  }, []);

  const handleFlowToWireframes = useCallback(() => {
    if (architecture) {
      setActiveTool('wireframer');
    }
  }, [architecture]);

  const handleStartOver = useCallback(() => {
    setIsProjectMode(false);
    setArchitecture(null);
    setFlow(null);
    setChatMessages([]);
    setCurrentMessage('');
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    resizingRef.current = true;
    e.preventDefault();
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const newWidth = Math.max(300, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleFlowChange = useCallback((updatedFlow: AppFlow) => {
    setFlow(updatedFlow);
  }, []);

  const handleExportJson = useCallback(() => {
    if (!architecture) return;
    
    const dataStr = JSON.stringify(architecture, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${architecture.name.toLowerCase().replace(/\s+/g, '-')}-architecture.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [architecture]);

  // Route to different tools
  if (activeTool === 'home') {
    return <ToolsHome onToolSelect={handleToolSelect} />;
  }

  if (activeTool === 'wireframer') {
    return (
      <WireframeStudio 
        sourceArchitecture={architecture}
        onBack={handleBackToHome}
      />
    );
  }

  // Handle other tools (coming soon)
  if (['ui-designer', 'ux-researcher', 'component-builder'].includes(activeTool)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTool.replace('-', ' ')}</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
          <Button onClick={handleBackToHome} variant="outline">
            ← Back to Tools
          </Button>
        </div>
      </div>
    );
  }

  const exampleGoals = [
    "Todo app with authentication",
    "Social media with user profiles", 
    "E-commerce with shopping cart",
    "Blog with content management"
  ];

  // Flow Diagrams Tool - Landing page when not in project mode
  if (!isProjectMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-8 sm:space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 sm:space-y-6">
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="mb-4 self-start"
            >
              ← Back to Tools
            </Button>
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg text-white">
                <GitBranch className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                User Flow Diagrams
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-4">
              Transform your app idea into structured user flows with AI-powered architecture generation
            </p>
          </div>

            
            <div className="relative">
              <Textarea
                placeholder="Describe your app idea... e.g., 'A fitness app where users can track workouts, set goals, and share progress with friends' or 'A recipe app where people can save favorite recipes, create shopping lists, and meal plan' etc."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[120px] resize-none text-base border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg pr-12 bg-white shadow-sm"
                aria-label="Describe your app idea"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (goal.trim()) {
                      handleGenerate(goal);
                    }
                  }
                }}
              />
              <Button
                onClick={() => handleInitialPrompt(goal)}
                disabled={!goal.trim() || isGenerating}
                size="sm"
                className="absolute bottom-4 right-4 h-8 w-8 p-0 bg-black hover:bg-gray-800 rounded-md"
                aria-label={isGenerating ? "Generating..." : "Generate architecture"}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

        </div>
      </div>
    );
  }

  // Project mode with sidebar and diagram
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Sidebar - Chat Interface */}
      <div 
        className="flex flex-col border-r border-gray-200 bg-white"
        style={{ width: isDiagramFullscreen ? '0px' : `${sidebarWidth}px`, transition: 'width 0.3s ease' }}
        role="complementary"
        aria-label="Chat interface"
      >
        {!isDiagramFullscreen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-600 rounded-md text-white">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-medium text-gray-900">User Flow Diagrams</h1>
                    {architecture && (
                      <p className="text-xs text-gray-500 truncate">{architecture.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartOver}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                  >
                    <Home className="w-4 h-4 text-gray-600" />
                  </Button>
                  {architecture && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportJson}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </Button>
                  )}
                </div>
              </div>
            </div>


            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id}>
                  {message.type === 'thinking' ? (
                    <ThinkingDialogue
                      isThinking={message.isThinking || false}
                      currentThought={message.currentThought}
                      steps={message.thinkingSteps || []}
                    />
                  ) : (
                    <div
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                          message.type === 'user'
                            ? 'bg-black text-white'
                            : 'bg-gray-50 border border-gray-200 text-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Pipeline Actions */}
            {architecture && flow && (
              <div className="p-4 border-t border-gray-100 bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <ArrowRight className="w-4 h-4" />
                    <span>Ready for next step</span>
                  </div>
                  <Button
                    onClick={handleFlowToWireframes}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Push to Wireframes →
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Generate wireframes from your flow diagram
                </p>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <Input
                  placeholder="Describe changes to your architecture..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                  className="flex-1 text-sm border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg"
                  aria-label="Chat input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isGenerating}
                  size="sm"
                  className="h-10 w-10 p-0 bg-black hover:bg-gray-800 rounded-lg"
                  aria-label={isGenerating ? "Sending message..." : "Send message"}
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resize Handle */}
      {!isDiagramFullscreen && (
        <div
          className="w-px bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Main Content - Diagram */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden" role="main" aria-label="Flow diagram">
        {/* Diagram Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDiagramFullscreen(!isDiagramFullscreen)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
              aria-label={isDiagramFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isDiagramFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-600" aria-hidden="true" />
              <h2 className="font-medium text-gray-900">Flow Diagram</h2>
            </div>
          </div>
          <div className="flex gap-2">
            {flow && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-md">
                {flow.nodes.length} nodes, {flow.edges.length} connections
              </Badge>
            )}
          </div>
        </div>

        {/* Diagram Content */}
        <div className="flex-1 relative">
          {flow ? (
            <FlowDiagram 
              flow={flow} 
              onFlowChange={handleFlowChange}
              editable={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-600 text-sm">Start a conversation to generate your flow diagram</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions Dialog */}
      <QuestionsDialog 
        questions={projectContext.questions || []}
        onSubmit={handleAnswerSubmit}
        onSkip={handleSkipQuestions}
        isVisible={showQuestions}
      />
    </div>
  );
}
