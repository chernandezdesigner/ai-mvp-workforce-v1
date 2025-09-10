'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HttpMethod } from '@/types/app-architecture';
import { 
  Database, 
  Lock,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Trash2,
  Edit,
  MoreHorizontal
} from 'lucide-react';

interface ApiNodeData {
  label: string;
  description?: string;
  method?: HttpMethod;
  path?: string;
  authentication?: boolean;
}

const getMethodIcon = (method?: HttpMethod) => {
  switch (method) {
    case HttpMethod.GET:
      return <ArrowDownCircle className="w-4 h-4" />;
    case HttpMethod.POST:
      return <ArrowUpCircle className="w-4 h-4" />;
    case HttpMethod.PUT:
      return <Edit className="w-4 h-4" />;
    case HttpMethod.DELETE:
      return <Trash2 className="w-4 h-4" />;
    case HttpMethod.PATCH:
      return <RefreshCw className="w-4 h-4" />;
    default:
      return <Database className="w-4 h-4" />;
  }
};

const getMethodColor = (method?: HttpMethod) => {
  switch (method) {
    case HttpMethod.GET:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case HttpMethod.POST:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case HttpMethod.PUT:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case HttpMethod.DELETE:
      return 'bg-red-100 text-red-800 border-red-200';
    case HttpMethod.PATCH:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getNodeColor = (method?: HttpMethod) => {
  switch (method) {
    case HttpMethod.GET:
      return 'border-gray-300 bg-gray-50';
    case HttpMethod.POST:
      return 'border-gray-300 bg-gray-50';
    case HttpMethod.PUT:
      return 'border-gray-300 bg-gray-50';
    case HttpMethod.DELETE:
      return 'border-red-300 bg-red-50';
    case HttpMethod.PATCH:
      return 'border-gray-300 bg-gray-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

export default function ApiNode({ data, selected }: NodeProps<ApiNodeData>) {
  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
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
    <div className="min-w-[240px] max-w-[300px] group">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-gray-500 border-2 border-white shadow-sm" 
      />
      
      <Card className={`${getNodeColor(data.method)} shadow-sm hover:shadow-md transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
            <span className="text-gray-600">{getMethodIcon(data.method)}</span>
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
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          {data.path && (
            <code className="text-xs bg-gray-900 text-gray-100 px-2 py-1.5 rounded font-mono block truncate">
              {data.path}
            </code>
          )}
          {data.description && (
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
              {data.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {data.method && (
              <Badge className={`text-xs font-normal px-2 py-0.5 ${getMethodColor(data.method)}`}>
                {data.method}
              </Badge>
            )}
            {data.authentication && (
              <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 border-gray-300 text-gray-700">
                <Lock className="w-3 h-3 mr-1" />
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
