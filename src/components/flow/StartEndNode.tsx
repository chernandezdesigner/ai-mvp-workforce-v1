'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Play, Square } from 'lucide-react';

interface StartEndNodeData {
  label: string;
  isStart?: boolean;
}

export default function StartEndNode({ data }: NodeProps<StartEndNodeData>) {
  const isStart = data.isStart ?? data.label.toLowerCase().includes('start');
  
  return (
    <div className="flex flex-col items-center">
      {!isStart && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-gray-400 border-2 border-white shadow-sm" 
        />
      )}
      
      <div className={`
        w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105
        ${isStart 
          ? 'bg-gradient-to-br from-green-100 to-green-200 border-3 border-green-400' 
          : 'bg-gradient-to-br from-red-100 to-red-200 border-3 border-red-400'
        }
      `}>
        {isStart ? (
          <Play className="w-7 h-7 text-green-700 ml-0.5" fill="currentColor" />
        ) : (
          <Square className="w-7 h-7 text-red-700" fill="currentColor" />
        )}
      </div>
      
      <Badge 
        variant="secondary" 
        className={`mt-3 text-xs font-medium px-3 py-1 ${
          isStart 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'
        }`}
      >
        {data.label}
      </Badge>

      {isStart && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-gray-400 border-2 border-white shadow-sm" 
        />
      )}
    </div>
  );
}
