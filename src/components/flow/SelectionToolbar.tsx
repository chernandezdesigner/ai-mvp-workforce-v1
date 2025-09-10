'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Copy,
  Trash2,
  Move,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Group,
  Ungroup,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

interface SelectionToolbarProps {
  selectedCount: number;
  position: { x: number; y: number };
  onCopy: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onDistributeHorizontal: () => void;
  onDistributeVertical: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  onClose: () => void;
}

export default function SelectionToolbar({
  selectedCount,
  position,
  onCopy,
  onDelete,
  onGroup,
  onUngroup,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onDistributeHorizontal,
  onDistributeVertical,
  onToggleLock,
  onToggleVisibility,
  onClose
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-1">
        {/* Selection Info */}
        <Badge variant="secondary" className="text-xs mr-2">
          {selectedCount} selected
        </Badge>

        {/* Basic Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="h-8 w-8 p-0"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {selectedCount > 1 && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignLeft}
                className="h-8 w-8 p-0"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignCenter}
                className="h-8 w-8 p-0"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onAlignRight}
                className="h-8 w-8 p-0"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Distribution Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDistributeHorizontal}
                className="h-8 w-8 p-0"
                title="Distribute Horizontally"
              >
                <AlignHorizontalSpaceAround className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDistributeVertical}
                className="h-8 w-8 p-0"
                title="Distribute Vertically"
              >
                <AlignVerticalSpaceAround className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Grouping Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onGroup}
                className="h-8 w-8 p-0"
                title="Group"
              >
                <Group className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onUngroup}
                className="h-8 w-8 p-0"
                title="Ungroup"
              >
                <Ungroup className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Visibility & Lock Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="h-8 w-8 p-0"
            title="Toggle Visibility"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLock}
            className="h-8 w-8 p-0"
            title="Toggle Lock"
          >
            <Lock className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
