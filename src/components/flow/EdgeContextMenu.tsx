'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Edit,
  Trash2,
  Palette,
  ArrowRight,
  MoreHorizontal,
  Type
} from 'lucide-react';

interface EdgeContextMenuProps {
  position: { x: number; y: number };
  edgeId: string;
  currentLabel?: string;
  onEditLabel: (edgeId: string, newLabel: string) => void;
  onDelete: (edgeId: string) => void;
  onChangeStyle: (edgeId: string, style: any) => void;
  onClose: () => void;
}

export default function EdgeContextMenu({
  position,
  edgeId,
  currentLabel,
  onEditLabel,
  onDelete,
  onChangeStyle,
  onClose
}: EdgeContextMenuProps) {
  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [labelValue, setLabelValue] = React.useState(currentLabel || '');

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleSaveLabel = () => {
    onEditLabel(edgeId, labelValue);
    setIsEditingLabel(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveLabel();
    } else if (e.key === 'Escape') {
      setIsEditingLabel(false);
      setLabelValue(currentLabel || '');
    }
  };

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 200), 
        top: Math.min(position.y, window.innerHeight - 300) 
      }}
      onMouseLeave={() => !isEditingLabel && onClose()}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
        Connection
      </div>
      
      <div className="py-1">
        {isEditingLabel ? (
          <div className="px-3 py-2">
            <Input
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveLabel}
              placeholder="Enter label"
              className="text-sm h-8"
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingLabel(true)}
            className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-gray-50"
          >
            <Type className="w-4 h-4" />
            Edit Label
          </Button>
        )}

        <div className="border-t border-gray-100 my-1" />

        <div className="px-3 py-1">
          <div className="text-xs font-medium text-gray-500 mb-2">Style</div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onChangeStyle(edgeId, { strokeDasharray: '0' }))}
              className="h-6 text-xs justify-start hover:bg-gray-50"
            >
              Solid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onChangeStyle(edgeId, { strokeDasharray: '5,5' }))}
              className="h-6 text-xs justify-start hover:bg-gray-50"
            >
              Dashed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onChangeStyle(edgeId, { strokeWidth: 1 }))}
              className="h-6 text-xs justify-start hover:bg-gray-50"
            >
              Thin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onChangeStyle(edgeId, { strokeWidth: 3 }))}
              className="h-6 text-xs justify-start hover:bg-gray-50"
            >
              Thick
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 my-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(() => onDelete(edgeId))}
          className="w-full justify-start gap-2 h-8 px-3 text-sm font-normal hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Delete Connection
        </Button>
      </div>
    </div>
  );
}
