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
  AlertCircle
} from 'lucide-react';

interface ScreenNodeData {
  label: string;
  description?: string;
  screenType?: ScreenType;
  requiresAuth?: boolean;
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

export default function ScreenNode({ data }: NodeProps<ScreenNodeData>) {
  return (
    <div className="min-w-[220px] max-w-[280px]">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-gray-500 border-2 border-white shadow-sm" 
      />
      
      <Card className={`${getScreenColor(data.screenType)} shadow-sm hover:shadow-md transition-all duration-200`}>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
            <span className="text-gray-600">{getScreenIcon(data.screenType)}</span>
            <span className="truncate">{data.label}</span>
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
