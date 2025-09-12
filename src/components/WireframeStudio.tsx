'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wand2, 
  Download, 
  RefreshCw, 
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Send,
  Home,
  ArrowRight,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react';

import WireframeDiagram from './flow/WireframeDiagram';
import ThinkingDialogue from './ui/thinking-dialogue';
import { WireframeProject, WireframeFlow, WireframeScreen, DeviceType, AppArchitecture } from '@/types/app-architecture';

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

interface WireframeStudioProps {
  sourceArchitecture?: AppArchitecture;
  onBack?: () => void;
}

export default function WireframeStudio({ sourceArchitecture, onBack }: WireframeStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wireframeProject, setWireframeProject] = useState<WireframeProject | null>(null);
  const [wireframeFlow, setWireframeFlow] = useState<WireframeFlow | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(DeviceType.MOBILE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProjectMode, setIsProjectMode] = useState(!!sourceArchitecture);
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

  // Initialize with source architecture if provided
  useEffect(() => {
    if (sourceArchitecture && !wireframeProject) {
      handleGenerateWireframes(`Generate wireframes for: ${sourceArchitecture.name}\n\nDescription: ${sourceArchitecture.description}`);
    }
  }, [sourceArchitecture]);

  const handleGenerateWireframes = useCallback(async (promptText: string) => {
    if (!promptText.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: promptText,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    const thinkingMessageId = (Date.now() + 1).toString();
    const initialThinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      type: 'thinking',
      content: 'AI is thinking about your wireframes...',
      timestamp: new Date(),
      isThinking: true,
      thinkingSteps: [],
      currentThought: 'Analyzing your requirements for wireframe generation...'
    };
    setChatMessages(prev => [...prev, initialThinkingMessage]);
    
    setIsGenerating(true);
    setIsProjectMode(true);
    
    try {
      // Get AI thinking process for wireframes
      const thinkingResponse = await fetch('/api/ai-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userRequest: `Generate wireframes for: ${promptText}`,
          context: 'wireframe_generation'
        }),
      });

      if (thinkingResponse.ok) {
        const { steps, thoughts } = await thinkingResponse.json();
        
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === thinkingMessageId 
              ? {
                  ...msg,
                  thinkingSteps: steps.map((step: any) => ({ ...step, status: 'pending' })),
                  currentThought: thoughts[0] || 'Planning wireframe layout and components...'
                }
              : msg
          )
        );

        // Process thinking steps
        for (let i = 0; i < steps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
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
      }

      // Generate wireframes
      const architectureData = sourceArchitecture || {
        id: 'temp-arch',
        name: 'Custom Wireframe Project',
        description: promptText,
        screens: [{
          id: 'main-screen',
          name: 'Main Screen',
          type: 'home',
          description: promptText,
          components: [],
          data: { requiresAuth: false },
        }],
        transitions: [],
        apiEndpoints: [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          tags: [],
          complexity: 'simple',
          estimatedScreens: 1,
          estimatedApis: 0,
        }
      };

      const wireframeResponse = await fetch('/api/generate-wireframes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          architecture: architectureData, 
          device: selectedDevice,
          designHints: promptText 
        }),
      });

      if (!wireframeResponse.ok) {
        throw new Error('Failed to generate wireframes');
      }

      const { wireframes } = await wireframeResponse.json();
      
      // Convert to flow format
      const flow: WireframeFlow = {
        nodes: wireframes.screens.map((screen: WireframeScreen, index: number) => ({
          id: screen.id,
          type: 'wireframe_screen',
          position: { x: index * 400, y: 100 },
          data: {
            label: screen.name,
            screen,
            device: screen.device,
          },
        })),
        edges: [],
      };

      setWireframeProject(wireframes);
      setWireframeFlow(flow);
      
      // Complete thinking and show success
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessageId 
            ? { 
                ...msg, 
                type: 'assistant',
                content: `✅ Generated ${wireframes.screens.length} wireframe screen${wireframes.screens.length !== 1 ? 's' : ''} for ${selectedDevice} device. Your wireframes are ready for review and editing.`,
                isThinking: false,
                currentThought: undefined,
                thinkingSteps: undefined
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to generate wireframes:', error);
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessageId 
            ? { 
                ...msg, 
                type: 'assistant',
                content: '❌ Failed to generate wireframes. Please try again with a different prompt.',
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
  }, [sourceArchitecture, selectedDevice]);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isGenerating) return;
    
    if (!isProjectMode) {
      await handleGenerateWireframes(currentMessage);
    } else {
      // Handle modifications to existing wireframes
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I understand your request for wireframe modifications. Currently, you can manually edit the wireframes in the canvas. Advanced AI-powered wireframe editing will be available in a future update.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, responseMessage]);
    }
    
    setCurrentMessage('');
  }, [currentMessage, isGenerating, isProjectMode, handleGenerateWireframes]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleExportWireframes = useCallback(() => {
    if (!wireframeProject) return;
    
    const dataStr = JSON.stringify(wireframeProject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${wireframeProject.name.toLowerCase().replace(/\s+/g, '-')}-wireframes.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [wireframeProject]);

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case DeviceType.MOBILE:
        return <Smartphone className="w-4 h-4" />;
      case DeviceType.TABLET:
        return <Tablet className="w-4 h-4" />;
      case DeviceType.DESKTOP:
        return <Monitor className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

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

  // Landing page when not in project mode
  if (!isProjectMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-8 sm:space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 sm:space-y-6">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-4 self-start"
              >
                ← Back to Tools
              </Button>
            )}
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Wireframe Studio
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-4">
              Create detailed wireframes with AI-powered layout generation and semantic HTML structure
            </p>
          </div>

          {/* Device Selection */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-gray-200">
              {Object.values(DeviceType).map((device) => (
                <Button
                  key={device}
                  variant={selectedDevice === device ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDevice(device)}
                  className="flex items-center gap-2"
                >
                  {getDeviceIcon(device)}
                  <span className="capitalize">{device}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Source Architecture Info */}
          {sourceArchitecture && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">From Flow Diagram</span>
                </div>
                <p className="text-sm text-blue-800">
                  <strong>{sourceArchitecture.name}</strong> - {sourceArchitecture.description}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {sourceArchitecture.screens.length} screens will be converted to wireframes
                </p>
              </CardContent>
            </Card>
          )}
            
          {/* Input Area */}
          <div className="relative">
            <Textarea
              placeholder={sourceArchitecture 
                ? "Describe any specific wireframe requirements or modifications..."
                : "Describe the wireframes you want to create... e.g., 'A login screen with email/password fields and social sign-in options' or 'An e-commerce product listing page with filters and search'"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none text-base border-gray-200 focus:border-blue-400 focus:ring-0 rounded-lg pr-12 bg-white shadow-sm"
              onKeyPress={handleKeyPress}
            />
            <Button
              onClick={() => handleGenerateWireframes(prompt)}
              disabled={!prompt.trim() || isGenerating}
              size="sm"
              className="absolute bottom-4 right-4 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-md"
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

  // Project mode with sidebar and wireframe canvas
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Sidebar - Chat Interface */}
      <div 
        className="flex flex-col border-r border-gray-200 bg-white"
        style={{ width: isDiagramFullscreen ? '0px' : `${sidebarWidth}px`, transition: 'width 0.3s ease' }}
      >
        {!isDiagramFullscreen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-600 rounded-md text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-medium text-gray-900">Wireframe Studio</h1>
                    {wireframeProject && (
                      <p className="text-xs text-gray-500 truncate">{wireframeProject.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {onBack && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onBack}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                    >
                      <Home className="w-4 h-4 text-gray-600" />
                    </Button>
                  )}
                  {wireframeProject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportWireframes}
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
                    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
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

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <Input
                  placeholder="Describe changes to your wireframes..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                  className="flex-1 text-sm border-gray-200 focus:border-blue-400 focus:ring-0 rounded-lg"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isGenerating}
                  size="sm"
                  className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 rounded-lg"
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

      {/* Main Content - Wireframe Canvas */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        {/* Canvas Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDiagramFullscreen(!isDiagramFullscreen)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
            >
              {isDiagramFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h2 className="font-medium text-gray-900">Wireframe Canvas</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wireframeFlow && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-md">
                {wireframeFlow.nodes.length} screen{wireframeFlow.nodes.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              {getDeviceIcon(selectedDevice)}
              <span className="text-sm text-gray-600 capitalize">{selectedDevice}</span>
            </div>
          </div>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 relative">
          {wireframeFlow ? (
            <WireframeDiagram 
              flow={wireframeFlow}
              onFlowChange={setWireframeFlow}
              editable={true}
              selectedDevice={selectedDevice}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-600 text-sm">Generate wireframes to see your canvas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}