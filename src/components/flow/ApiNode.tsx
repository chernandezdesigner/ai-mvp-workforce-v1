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
  Edit
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
      return 'bg-green-100 text-green-800 border-green-200';
    case HttpMethod.POST:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case HttpMethod.PUT:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case HttpMethod.DELETE:
      return 'bg-red-100 text-red-800 border-red-200';
    case HttpMethod.PATCH:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getNodeColor = (method?: HttpMethod) => {
  switch (method) {
    case HttpMethod.GET:
      return 'border-green-200 bg-green-50';
    case HttpMethod.POST:
      return 'border-blue-200 bg-blue-50';
    case HttpMethod.PUT:
      return 'border-orange-200 bg-orange-50';
    case HttpMethod.DELETE:
      return 'border-red-200 bg-red-50';
    case HttpMethod.PATCH:
      return 'border-purple-200 bg-purple-50';
    default:
      return 'border-slate-200 bg-slate-50';
  }
};

export default function ApiNode({ data }: NodeProps<ApiNodeData>) {
  return (
    <div className="min-w-[240px] max-w-[300px]">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-gray-400 border-2 border-white shadow-sm" 
      />
      
      <Card className={`${getNodeColor(data.method)} border-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5`}>
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
            {getMethodIcon(data.method)}
            <span className="truncate">{data.label}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          {data.path && (
            <code className="text-xs bg-gray-800 text-gray-100 px-2 py-1.5 rounded font-mono block truncate">
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
              <Badge className={`text-xs font-medium px-2 py-0.5 ${getMethodColor(data.method)}`}>
                {data.method}
              </Badge>
            )}
            {data.authentication && (
              <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 border-amber-200 text-amber-700 bg-amber-50">
                <Lock className="w-3 h-3 mr-1" />
                Auth
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-gray-400 border-2 border-white shadow-sm" 
      />
    </div>
  );
}
