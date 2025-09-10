'use client';

import React from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  EdgeMarker,
  MarkerType
} from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  label,
  labelStyle = {},
  labelShowBg = true,
  labelBgStyle = {},
  labelBgPadding = [8, 4],
  labelBgBorderRadius = 2,
  selected,
  markerEnd
}: EdgeProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Dispatch a custom event that the parent can listen to
    const customEvent = new CustomEvent('edgeContextMenu', {
      detail: { 
        edgeId: id, 
        clientX: event.clientX, 
        clientY: event.clientY 
      }
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: selected ? 3 : isHovered ? 2.5 : style.strokeWidth || 2,
          stroke: selected ? '#3b82f6' : isHovered ? '#6b7280' : style.stroke || '#374151',
          transition: 'all 0.2s ease',
        }}
        className="react-flow__edge-path cursor-pointer"
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        markerEnd={{
          ...markerEnd,
          color: selected ? '#3b82f6' : isHovered ? '#6b7280' : markerEnd?.color || '#374151'
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              ...labelStyle,
            }}
            className={`nodrag nopan cursor-pointer hover:bg-blue-50 transition-colors rounded px-2 py-1 ${
              selected ? 'bg-blue-100 text-blue-800 shadow-md' : 'bg-white border border-gray-200 shadow-sm'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onContextMenu={handleContextMenu}
          >
            {labelShowBg && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: labelBgBorderRadius,
                  ...labelBgStyle,
                }}
              />
            )}
            <div className="relative font-medium text-gray-700">
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
