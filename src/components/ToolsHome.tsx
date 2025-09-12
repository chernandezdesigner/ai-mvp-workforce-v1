'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  GitBranch,
  FileText,
  Code,
  Search,
  Palette,
  Database,
  Github,
  ArrowRight,
  Zap,
  Brain,
  Layers,
  Settings
} from 'lucide-react';

export interface AITool {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  status: 'available' | 'coming_soon' | 'beta';
  category: 'design' | 'development' | 'research' | 'integration';
  features: string[];
  color: string;
  bgGradient: string;
}

const aiTools: AITool[] = [
  {
    id: 'flow-diagrams',
    name: 'User Flow Diagrams',
    description: 'Generate interactive user flow diagrams from natural language descriptions',
    longDescription: 'Transform your app ideas into structured user flows with AI-powered architecture generation, visual diagrams, and interactive editing.',
    icon: <GitBranch className="w-6 h-6" />,
    status: 'available',
    category: 'design',
    features: ['Natural language input', 'Interactive React Flow', 'JSON export', 'Real-time AI thinking'],
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50 border-green-200',
  },
  {
    id: 'wireframer',
    name: 'Wireframe Studio',
    description: 'Create detailed wireframes with AI-powered layout generation',
    longDescription: 'Generate semantic HTML/CSS wireframes from flow diagrams or custom prompts with device-specific layouts and interactive components.',
    icon: <FileText className="w-6 h-6" />,
    status: 'available',
    category: 'design',
    features: ['HTML/CSS components', 'Device-responsive', 'Flow diagram integration', 'Semantic structure'],
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-sky-50 border-blue-200',
  },
  {
    id: 'ui-designer',
    name: 'Hi-fi UI Designer',
    description: 'Generate production-ready React components with design systems',
    longDescription: 'Convert wireframes into beautiful, coded UI components using Shadcn, Material Design, or custom design systems.',
    icon: <Code className="w-6 h-6" />,
    status: 'coming_soon',
    category: 'development',
    features: ['React + Tailwind', 'Shadcn/ui integration', 'Design system support', 'TypeScript ready'],
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50 border-purple-200',
  },
  {
    id: 'ux-researcher',
    name: 'UX Researcher',
    description: 'AI-powered competitive analysis and user research insights',
    longDescription: 'Analyze competitors, generate user personas, conduct market research, and provide UX recommendations for your product.',
    icon: <Search className="w-6 h-6" />,
    status: 'coming_soon',
    category: 'research',
    features: ['Competitive analysis', 'User personas', 'Market research', 'UX recommendations'],
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-50 border-orange-200',
  },
  {
    id: 'component-builder',
    name: 'Custom Component Builder',
    description: 'Build reusable component libraries with AI assistance',
    longDescription: 'Create custom, reusable UI components with documentation, variants, and design tokens for your design system.',
    icon: <Layers className="w-6 h-6" />,
    status: 'coming_soon',
    category: 'development',
    features: ['Component variants', 'Design tokens', 'Auto documentation', 'Storybook ready'],
    color: 'text-pink-600',
    bgGradient: 'from-pink-50 to-rose-50 border-pink-200',
  },
  {
    id: 'design-system',
    name: 'Design System Manager',
    description: 'Apply and manage design systems across your entire project',
    longDescription: 'Implement Shadcn, Material Design, iOS, or custom design systems with consistent theming and component styling.',
    icon: <Palette className="w-6 h-6" />,
    status: 'coming_soon',
    category: 'design',
    features: ['Multiple design systems', 'Theme management', 'Component consistency', 'Brand customization'],
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-cyan-50 border-teal-200',
  },
  {
    id: 'backend-setup',
    name: 'Backend Setup',
    description: 'Generate Supabase backend with authentication and APIs',
    longDescription: 'Automatically configure backend services, database schemas, authentication, and API endpoints based on your app architecture.',
    icon: <Database className="w-6 h-6" />,
    status: 'coming_soon',
    category: 'development',
    features: ['Supabase integration', 'Auto auth setup', 'API generation', 'Database schemas'],
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-50 border-indigo-200',
  },
  {
    id: 'github-export',
    name: 'GitHub Export',
    description: 'Export and sync your generated codebase to GitHub repositories',
    longDescription: 'Seamlessly export your complete application code to GitHub with proper project structure, documentation, and deployment configs.',
    icon: <Github className="w-6 h-6" />,
    status: 'coming_soon',
    category: 'integration',
    features: ['GitHub integration', 'Project structure', 'Auto documentation', 'Deploy configs'],
    color: 'text-gray-600',
    bgGradient: 'from-gray-50 to-slate-50 border-gray-200',
  },
];

interface ToolsHomeProps {
  onToolSelect: (toolId: string) => void;
}

export default function ToolsHome({ onToolSelect }: ToolsHomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'design', name: 'Design', icon: <Palette className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'development', name: 'Development', icon: <Code className="w-4 h-4" />, color: 'text-green-600' },
    { id: 'research', name: 'Research', icon: <Search className="w-4 h-4" />, color: 'text-orange-600' },
    { id: 'integration', name: 'Integration', icon: <Settings className="w-4 h-4" />, color: 'text-purple-600' },
  ];

  const filteredTools = selectedCategory 
    ? aiTools.filter(tool => tool.category === selectedCategory)
    : aiTools;

  const getStatusBadge = (status: AITool['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'beta':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Beta</Badge>;
      case 'coming_soon':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Coming Soon</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white shadow-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                AI App Studio
              </h1>
              <p className="text-sm text-gray-500 mt-1">Multi-Agent Workspace</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your app ideas into working codebases with specialized AI agents. 
            Each tool is designed for co-creation, not automation.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-lg"
            >
              <Brain className="w-4 h-4 mr-2" />
              All Tools
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-lg"
              >
                <span className={category.color}>{category.icon}</span>
                <span className="ml-2">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <Card 
              key={tool.id} 
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br ${tool.bgGradient}`}
              onClick={() => tool.status === 'available' && onToolSelect(tool.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${tool.color} bg-white/50 backdrop-blur-sm`}>
                    {tool.icon}
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 2).map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs px-2 py-1 bg-white/60 text-gray-700 border-0"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {tool.features.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/60 text-gray-500 border-0">
                        +{tool.features.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Zap className="w-3 h-3 mr-1" />
                      AI-Powered
                    </div>
                    {tool.status === 'available' ? (
                      <Button 
                        size="sm" 
                        className="bg-white/20 hover:bg-white/30 text-gray-700 border border-white/30 backdrop-blur-sm transition-all group-hover:bg-white/40"
                      >
                        Open
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        disabled 
                        className="bg-gray-100/60 text-gray-400 border-0"
                      >
                        Soon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Status Indicator */}
              {tool.status === 'available' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </Card>
          ))}
        </div>

        {/* Pipeline Flow Hint */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-4 h-4 text-green-600" />
                    <span>Flow Diagrams</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Wireframes</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                  <div className="flex items-center gap-1">
                    <Code className="w-4 h-4 text-purple-600" />
                    <span>UI Code</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                  <div className="flex items-center gap-1">
                    <Github className="w-4 h-4 text-gray-600" />
                    <span>Export</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless Tool Integration</h3>
              <p className="text-gray-600">
                Tools work together in a pipeline. Start with flow diagrams, refine in wireframes, 
                code in UI designer, and export to GitHub. Or use any tool independently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}