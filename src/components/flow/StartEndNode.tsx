'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Play, Square } from 'lucide-react';

interface StartEndNodeData {
  label: string;
  isStart?: boolean;
}

export default function StartEndNode({ data, selected }: NodeProps<StartEndNodeData>) {
  const isStart = data.isStart ?? data.label.toLowerCase().includes('start');
  
  return (
    <div className="flex flex-col items-center group">
      {!isStart && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-2 h-2 bg-gray-500 border-2 border-white shadow-sm" 
        />
      )}
      
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200
        ${isStart 
          ? 'bg-black border-2 border-gray-300' 
          : 'bg-gray-100 border-2 border-gray-300'
        }
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}>
        {isStart ? (
          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
        ) : (
          <Square className="w-5 h-5 text-gray-600" fill="currentColor" />
        )}
      </div>
      
      <Badge 
        variant="secondary" 
        className="mt-3 text-xs font-normal px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200"
      >
        {data.label}
      </Badge>

      {isStart && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-2 h-2 bg-gray-500 border-2 border-white shadow-sm" 
        />
      )}
    </div>
  );
}
