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
  FolderOpen
} from 'lucide-react';

import FlowDiagram from './flow/FlowDiagram';
import { AIFlowGenerator } from '@/lib/ai-flow-generator';
import { AppArchitecture, AppFlow } from '@/types/app-architecture';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AppStudio() {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [architecture, setArchitecture] = useState<AppArchitecture | null>(null);
  const [flow, setFlow] = useState<AppFlow | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProjectMode, setIsProjectMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDiagramFullscreen, setIsDiagramFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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
    
    // Add loading assistant message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Generating your app architecture...',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, loadingMessage]);
    
    setIsGenerating(true);
    setIsProjectMode(true);
    
    try {
      const response = await fetch('/api/generate-architecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate architecture');
      }

      const { architecture: newArchitecture } = await response.json();
      const newFlow = AIFlowGenerator.architectureToFlow(newArchitecture);
      
      setArchitecture(newArchitecture);
      setFlow(newFlow);
      
      // Update the loading message with success
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, content: `✅ Generated architecture for "${newArchitecture.name}" with ${newArchitecture.screens.length} screens and ${newArchitecture.apiEndpoints.length} API endpoints.` }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to generate architecture:', error);
      // Update loading message with error
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, content: '❌ Failed to generate architecture. Please try again.' }
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
      // Subsequent messages - just add to chat for now
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      
      // Add a simple response for now
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I can help you modify the architecture. What would you like to change?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }
    
    setCurrentMessage('');
  }, [currentMessage, isGenerating, isProjectMode, handleGenerate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

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

  const exampleGoals = [
    "Build a todo app with login and dashboard",
    "Create a social media platform with posts and profiles",
    "Design an e-commerce store with products and checkout",
    "Build a blog platform with content management",
    "Create a project management tool with teams and tasks"
  ];

  // Landing page when not in project mode
  if (!isProjectMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                AI App Studio
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your app idea and watch it transform into a structured architecture with visual flow diagrams.
            </p>
          </div>

          {/* Goal Input Section */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Describe Your App
              </CardTitle>
              <CardDescription>
                Tell us what you want to build. Be as detailed or as simple as you like.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="e.g., Build a todo app with user authentication, dashboard, task management, and settings..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[120px] resize-none text-base pr-12"
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
                  onClick={() => handleGenerate(goal)}
                  disabled={!goal.trim() || isGenerating}
                  size="sm"
                  className="absolute bottom-3 right-3 h-8 w-8 p-0"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try these examples:</span>
                {exampleGoals.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setGoal(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  <strong>Note:</strong> For AI-powered generation, set up your API keys in <code className="bg-amber-100 px-1 rounded">.env.local</code>. 
                  Without API keys, the app will use smart fallback generation.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Project mode with sidebar and diagram
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Sidebar - Chat Interface */}
      <div 
        className="flex flex-col border-r border-gray-200 bg-gray-50"
        style={{ width: isDiagramFullscreen ? '0px' : `${sidebarWidth}px`, transition: 'width 0.3s ease' }}
      >
        {!isDiagramFullscreen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold">AI App Studio</h1>
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
                    className="h-8 w-8 p-0"
                  >
                    <Home className="w-4 h-4" />
                  </Button>
                  {architecture && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportJson}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Architecture Stats */}
            {architecture && (
              <div className="p-3 border-b border-gray-200 bg-white">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-600">{architecture.screens.length}</div>
                    <div className="text-blue-600">Screens</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-600">{architecture.apiEndpoints.length}</div>
                    <div className="text-green-600">APIs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-violet-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me to modify the architecture..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isGenerating}
                  size="sm"
                  className="h-10 w-10 p-0"
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
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Main Content - Diagram */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Diagram Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDiagramFullscreen(!isDiagramFullscreen)}
              className="h-8 w-8 p-0"
            >
              {isDiagramFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-600" />
              <h2 className="font-medium text-gray-900">Visual Flow Diagram</h2>
            </div>
          </div>
          <div className="flex gap-2">
            {flow && (
              <Badge variant="secondary" className="text-xs">
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
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center space-y-3">
                <div className="p-4 bg-white rounded-full shadow-sm">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Start a conversation to generate your diagram</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
