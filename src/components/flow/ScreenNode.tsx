'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenType } from '@/types/app-architecture';
import { 
  Monitor, 
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
  MoreHorizontal
} from 'lucide-react';

interface ScreenNodeData {
  label: string;
  description?: string;
  screenType?: ScreenType;
  requiresAuth?: boolean;
}

interface ScreenNodeProps {
  data: ScreenNodeData;
  selected?: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
}

const getScreenIcon = (type?: ScreenType) => {
  switch (type) {
    case ScreenType.AUTH:
      return <Shield className="w-4 h-4" />;
    case ScreenType.DASHBOARD:
      return <LayoutDashboard className="w-4 h-4" />;
    case ScreenType.LIST:
      return <List className="w-4 h-4" />;
    case ScreenType.DETAIL:
      return <FileText className="w-4 h-4" />;
    case ScreenType.FORM:
      return <PlusCircle className="w-4 h-4" />;
    case ScreenType.PROFILE:
      return <User className="w-4 h-4" />;
    case ScreenType.SETTINGS:
      return <Settings className="w-4 h-4" />;
    case ScreenType.LANDING:
      return <Home className="w-4 h-4" />;
    case ScreenType.ONBOARDING:
      return <UserPlus className="w-4 h-4" />;
    case ScreenType.ERROR:
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

const getScreenColor = (type?: ScreenType) => {
  switch (type) {
    case ScreenType.AUTH:
      return 'border-gray-300 bg-white';
    case ScreenType.DASHBOARD:
      return 'border-gray-300 bg-white';
    case ScreenType.LIST:
      return 'border-gray-300 bg-white';
    case ScreenType.DETAIL:
      return 'border-gray-300 bg-white';
    case ScreenType.FORM:
      return 'border-gray-300 bg-white';
    case ScreenType.PROFILE:
      return 'border-gray-300 bg-white';
    case ScreenType.SETTINGS:
      return 'border-gray-300 bg-white';
    case ScreenType.LANDING:
      return 'border-gray-300 bg-white';
    case ScreenType.ERROR:
      return 'border-red-300 bg-red-50';
    default:
      return 'border-gray-300 bg-white';
  }
};

export default function ScreenNode({ data, selected }: NodeProps<ScreenNodeData>) {
  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Create a synthetic context menu event
    const syntheticEvent = {
      ...event,
      button: 2, // Right click
      type: 'contextmenu'
    } as React.MouseEvent;
    
    // Find the node element and dispatch context menu event
    const nodeElement = event.currentTarget.closest('[data-id]');
    if (nodeElement) {
      const contextMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY
      });
      nodeElement.dispatchEvent(contextMenuEvent);
    }
  };
  return (
    <div className="min-w-[220px] max-w-[280px] group">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-gray-500 border-2 border-white shadow-sm" 
      />
      
      <Card className={`${getScreenColor(data.screenType)} shadow-sm hover:shadow-md transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
            <span className="text-gray-600">{getScreenIcon(data.screenType)}</span>
            <span className="truncate flex-1">{data.label}</span>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
              onClick={handleMenuClick}
              title="More options"
            >
              <MoreHorizontal className="w-3 h-3 text-gray-400" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          {data.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
              {data.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200">
              {data.screenType || 'screen'}
            </Badge>
            {data.requiresAuth && (
              <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 border-gray-300 text-gray-700">
                <Shield className="w-3 h-3 mr-1" />
                Auth
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-gray-500 border-2 border-white shadow-sm" 
      />
    </div>
  );
}
