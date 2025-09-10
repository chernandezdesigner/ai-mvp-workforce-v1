'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Copy,
  Trash2,
  Link,
  Palette,
  Move,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

interface NodeContextMenuProps {
  position: { x: number; y: number };
  nodeId: string;
  nodeType: string;
  onEdit: (nodeId: string) => void;
  onCopy: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onToggleVisibility: (nodeId: string) => void;
  onToggleLock: (nodeId: string) => void;
  onClose: () => void;
  isVisible?: boolean;
  isLocked?: boolean;
}

export default function NodeContextMenu({
  position,
  nodeId,
  nodeType,
  onEdit,
  onCopy,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleLock,
  onClose,
  isVisible = true,
  isLocked = false
}: NodeContextMenuProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 180), 
        top: Math.min(position.y, window.innerHeight - 250) 
      }}
      onMouseLeave={onClose}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
        {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node
      </div>
      
      <div className="py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onEdit(nodeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          Edit Properties
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onCopy(nodeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-gray-50"
        >
          <Copy className="w-4 h-4" />
          Copy
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onDuplicate(nodeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-gray-50"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>

        <div className="border-t border-gray-100 my-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onToggleVisibility(nodeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-gray-50"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isVisible ? 'Hide' : 'Show'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onToggleLock(nodeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-gray-50"
        >
          {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isLocked ? 'Unlock' : 'Lock'}
        </Button>

        <div className="border-t border-gray-100 my-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onDelete(nodeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
