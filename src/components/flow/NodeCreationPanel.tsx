'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Monitor,
  Database,
  Play,
  Square,
  Shield,
  LayoutDashboard,
  List,
  FileText,
  PlusCircle,
  User,
  Settings,
  Home,
  UserPlus,
  AlertCircle,
  X
} from 'lucide-react';
import { ScreenType, HttpMethod } from '@/types/app-architecture';

interface NodeTemplate {
  id: string;
  type: 'screen' | 'api' | 'start' | 'end';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  data: any;
  category: 'navigation' | 'auth' | 'data' | 'content' | 'system';
}

interface NodeCreationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNode: (template: NodeTemplate, position: { x: number; y: number }) => void;
}

const nodeTemplates: NodeTemplate[] = [
  // Navigation & Flow
  {
    id: 'start',
    type: 'start',
    label: 'Start',
    description: 'Entry point of the user flow',
    icon: Play,
    category: 'navigation',
    data: { label: 'Start', isStart: true }
  },
  {
    id: 'end',
    type: 'end',
    label: 'End',
    description: 'Exit point of the user flow',
    icon: Square,
    category: 'navigation',
    data: { label: 'End', isStart: false }
  },
  
  // Auth Screens
  {
    id: 'login',
    type: 'screen',
    label: 'Login Screen',
    description: 'User authentication screen',
    icon: Shield,
    category: 'auth',
    data: { 
      label: 'Login', 
      screenType: ScreenType.AUTH, 
      description: 'User login and authentication',
      requiresAuth: false
    }
  },
  {
    id: 'signup',
    type: 'screen',
    label: 'Sign Up Screen',
    description: 'New user registration',
    icon: UserPlus,
    category: 'auth',
    data: { 
      label: 'Sign Up', 
      screenType: ScreenType.AUTH, 
      description: 'New user registration form',
      requiresAuth: false
    }
  },
  
  // Core Screens
  {
    id: 'dashboard',
    type: 'screen',
    label: 'Dashboard',
    description: 'Main app dashboard',
    icon: LayoutDashboard,
    category: 'content',
    data: { 
      label: 'Dashboard', 
      screenType: ScreenType.DASHBOARD, 
      description: 'Main application dashboard',
      requiresAuth: true
    }
  },
  {
    id: 'home',
    type: 'screen',
    label: 'Home Screen',
    description: 'App home page',
    icon: Home,
    category: 'content',
    data: { 
      label: 'Home', 
      screenType: ScreenType.HOME, 
      description: 'Application home screen',
      requiresAuth: false
    }
  },
  {
    id: 'list',
    type: 'screen',
    label: 'List View',
    description: 'Display list of items',
    icon: List,
    category: 'content',
    data: { 
      label: 'List View', 
      screenType: ScreenType.LIST, 
      description: 'Display collection of items',
      requiresAuth: true
    }
  },
  {
    id: 'detail',
    type: 'screen',
    label: 'Detail View',
    description: 'Show detailed item information',
    icon: FileText,
    category: 'content',
    data: { 
      label: 'Detail View', 
      screenType: ScreenType.DETAIL, 
      description: 'Detailed view of a single item',
      requiresAuth: true
    }
  },
  {
    id: 'form',
    type: 'screen',
    label: 'Form Screen',
    description: 'Data input form',
    icon: PlusCircle,
    category: 'content',
    data: { 
      label: 'Form', 
      screenType: ScreenType.FORM, 
      description: 'Data input and editing form',
      requiresAuth: true
    }
  },
  
  // User Management
  {
    id: 'profile',
    type: 'screen',
    label: 'Profile Screen',
    description: 'User profile management',
    icon: User,
    category: 'auth',
    data: { 
      label: 'Profile', 
      screenType: ScreenType.PROFILE, 
      description: 'User profile and account information',
      requiresAuth: true
    }
  },
  {
    id: 'settings',
    type: 'screen',
    label: 'Settings Screen',
    description: 'App configuration settings',
    icon: Settings,
    category: 'system',
    data: { 
      label: 'Settings', 
      screenType: ScreenType.SETTINGS, 
      description: 'Application settings and preferences',
      requiresAuth: true
    }
  },
  
  // API Endpoints
  {
    id: 'get-api',
    type: 'api',
    label: 'GET API',
    description: 'Fetch data from server',
    icon: Database,
    category: 'data',
    data: { 
      label: 'GET API', 
      method: HttpMethod.GET, 
      path: '/api/data',
      description: 'Retrieve data from the server',
      authentication: true
    }
  },
  {
    id: 'post-api',
    type: 'api',
    label: 'POST API',
    description: 'Create new data',
    icon: Database,
    category: 'data',
    data: { 
      label: 'POST API', 
      method: HttpMethod.POST, 
      path: '/api/data',
      description: 'Create new data on the server',
      authentication: true
    }
  },
  {
    id: 'put-api',
    type: 'api',
    label: 'PUT API',
    description: 'Update existing data',
    icon: Database,
    category: 'data',
    data: { 
      label: 'PUT API', 
      method: HttpMethod.PUT, 
      path: '/api/data/:id',
      description: 'Update existing data on the server',
      authentication: true
    }
  },
  {
    id: 'delete-api',
    type: 'api',
    label: 'DELETE API',
    description: 'Remove data from server',
    icon: Database,
    category: 'data',
    data: { 
      label: 'DELETE API', 
      method: HttpMethod.DELETE, 
      path: '/api/data/:id',
      description: 'Delete data from the server',
      authentication: true
    }
  }
];

const categories = [
  { id: 'navigation', label: 'Navigation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'auth', label: 'Authentication', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'content', label: 'Content', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'data', label: 'Data & API', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'system', label: 'System', color: 'bg-gray-50 text-gray-700 border-gray-200' }
];

export default function NodeCreationPanel({
  isOpen,
  onClose,
  onCreateNode
}: NodeCreationPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = nodeTemplates.filter(template => {
    const matchesSearch = template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNode = (template: NodeTemplate) => {
    // Create node at center of viewport
    const position = { x: 400, y: 300 };
    onCreateNode(template, position);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative ml-auto w-96 h-full bg-white shadow-xl border-l border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Node</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-7 text-xs"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="h-7 text-xs"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Node Templates */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-gray-300"
                onClick={() => handleCreateNode(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <template.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 mb-1">
                        {template.label}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${categories.find(c => c.id === template.category)?.color}`}
                        >
                          {categories.find(c => c.id === template.category)?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Search className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">
                  No nodes found matching your search
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
