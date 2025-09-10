'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  MousePointer,
  Hand,
  Square,
  Circle,
  Zap,
  Database,
  Monitor,
  Shield,
  LayoutDashboard,
  List,
  FileText,
  PlusCircle,
  User,
  Settings,
  Home,
  Copy,
  Trash2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Eye,
  EyeOff,
  Move,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { ScreenType, HttpMethod } from '@/types/app-architecture';

export interface ToolbarAction {
  type: 'select' | 'pan' | 'add-screen' | 'add-api' | 'add-start' | 'add-end' | 'copy' | 'delete' | 'undo' | 'redo' | 'zoom-in' | 'zoom-out' | 'fit-view' | 'toggle-grid' | 'toggle-minimap' | 'show-help';
  screenType?: ScreenType;
  apiMethod?: HttpMethod;
}

interface FlowToolbarProps {
  selectedTool: string;
  onToolSelect: (action: ToolbarAction) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  showMinimap?: boolean;
  selectedNodesCount?: number;
  onShowHelp?: () => void;
}

const screenNodeTypes = [
  { type: ScreenType.AUTH, label: 'Auth', icon: Shield },
  { type: ScreenType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { type: ScreenType.LIST, label: 'List', icon: List },
  { type: ScreenType.DETAIL, label: 'Detail', icon: FileText },
  { type: ScreenType.FORM, label: 'Form', icon: PlusCircle },
  { type: ScreenType.PROFILE, label: 'Profile', icon: User },
  { type: ScreenType.SETTINGS, label: 'Settings', icon: Settings },
  { type: ScreenType.HOME, label: 'Home', icon: Home },
];

const apiMethods = [
  { method: HttpMethod.GET, label: 'GET', color: 'text-blue-600' },
  { method: HttpMethod.POST, label: 'POST', color: 'text-green-600' },
  { method: HttpMethod.PUT, label: 'PUT', color: 'text-orange-600' },
  { method: HttpMethod.DELETE, label: 'DELETE', color: 'text-red-600' },
];

export default function FlowToolbar({
  selectedTool,
  onToolSelect,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  showMinimap = true,
  selectedNodesCount = 0,
  onShowHelp
}: FlowToolbarProps) {
  const [showScreenTypes, setShowScreenTypes] = useState(false);
  const [showApiMethods, setShowApiMethods] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex items-center gap-1">
        {/* Selection Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant={selectedTool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolSelect({ type: 'select' })}
            className="h-8 w-8 p-0"
            title="Select (V)"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          
          <Button
            variant={selectedTool === 'pan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolSelect({ type: 'pan' })}
            className="h-8 w-8 p-0"
            title="Pan (H)"
          >
            <Hand className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Node Creation */}
        <div className="flex items-center gap-1 relative">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowScreenTypes(!showScreenTypes)}
              className="h-8 px-2 gap-1"
              title="Add Screen"
            >
              <Monitor className="w-4 h-4" />
              <Plus className="w-3 h-3" />
            </Button>
            
            {showScreenTypes && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] z-20">
                <div className="text-xs font-medium text-gray-700 mb-2">Screen Types</div>
                <div className="grid grid-cols-2 gap-1">
                  {screenNodeTypes.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onToolSelect({ type: 'add-screen', screenType: type });
                        setShowScreenTypes(false);
                      }}
                      className="h-8 justify-start gap-2 text-xs"
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiMethods(!showApiMethods)}
              className="h-8 px-2 gap-1"
              title="Add API"
            >
              <Database className="w-4 h-4" />
              <Plus className="w-3 h-3" />
            </Button>
            
            {showApiMethods && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[160px] z-20">
                <div className="text-xs font-medium text-gray-700 mb-2">API Methods</div>
                <div className="space-y-1">
                  {apiMethods.map(({ method, label, color }) => (
                    <Button
                      key={method}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onToolSelect({ type: 'add-api', apiMethod: method });
                        setShowApiMethods(false);
                      }}
                      className="h-7 w-full justify-start gap-2 text-xs"
                    >
                      <Database className={`w-3 h-3 ${color}`} />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'add-start' })}
            className="h-8 w-8 p-0"
            title="Add Start Node"
          >
            <Circle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'add-end' })}
            className="h-8 w-8 p-0"
            title="Add End Node"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Edit Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'copy' })}
            disabled={selectedNodesCount === 0}
            className="h-8 w-8 p-0"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'delete' })}
            disabled={selectedNodesCount === 0}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* History Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'undo' })}
            disabled={!canUndo}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'redo' })}
            disabled={!canRedo}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'zoom-in' })}
            className="h-8 w-8 p-0"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'zoom-out' })}
            className="h-8 w-8 p-0"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect({ type: 'fit-view' })}
            className="h-8 w-8 p-0"
            title="Fit View (F)"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Display Options */}
        <div className="flex items-center gap-1">
          <Button
            variant={showGrid ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolSelect({ type: 'toggle-grid' })}
            className="h-8 w-8 p-0"
            title="Toggle Grid (G)"
          >
            <Grid className="w-4 h-4" />
          </Button>

          <Button
            variant={showMinimap ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolSelect({ type: 'toggle-minimap' })}
            className="h-8 w-8 p-0"
            title="Toggle Minimap (M)"
          >
            {showMinimap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>

        {/* Help & Info */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToolSelect({ type: 'show-help' })}
          className="h-8 w-8 p-0"
          title="Show Help (?)" 
        >
          <HelpCircle className="w-4 h-4 text-gray-600" />
        </Button>
        
        {/* Selection Info */}
        {selectedNodesCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Badge variant="secondary" className="text-xs">
              {selectedNodesCount} selected
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}
