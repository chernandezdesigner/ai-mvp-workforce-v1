'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { WireframeScreen, DeviceType } from '@/types/app-architecture';
import WireframeComponent from './WireframeComponent';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Edit3, 
  Eye, 
  MoreVertical,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WireframeScreenNodeProps {
  data: {
    screen: WireframeScreen;
    device: DeviceType;
    label: string;
    onEdit?: (screen: WireframeScreen) => void;
    onPreview?: (screen: WireframeScreen) => void;
  };
  selected?: boolean;
}

export default function WireframeScreenNode({ data, selected }: WireframeScreenNodeProps) {
  const { screen, device, onEdit, onPreview } = data;
  const [isHovered, setIsHovered] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const getDeviceIcon = () => {
    switch (device) {
      case DeviceType.MOBILE:
        return <Smartphone className="w-4 h-4" />;
      case DeviceType.TABLET:
        return <Tablet className="w-4 h-4" />;
      case DeviceType.DESKTOP:
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceDimensions = () => {
    switch (device) {
      case DeviceType.MOBILE:
        return { width: 320, height: 568 };
      case DeviceType.TABLET:
        return { width: 768, height: 1024 };
      case DeviceType.DESKTOP:
        return { width: 1200, height: 800 };
      default:
        return { width: 320, height: 568 };
    }
  };

  const deviceDimensions = getDeviceDimensions();
  const scale = device === DeviceType.DESKTOP ? 0.25 : device === DeviceType.TABLET ? 0.35 : 0.75;
  const nodeWidth = deviceDimensions.width * scale;
  const nodeHeight = deviceDimensions.height * scale;

  return (
    <>
      <div
        className={`wireframe-screen-node ${selected ? 'selected' : ''}`}
        style={{ 
          width: nodeWidth + 32,
          height: nodeHeight + 80,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="wireframe-handle"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="wireframe-handle"
        />

        {/* Node Header */}
        <div className="wireframe-node-header">
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <span className="font-medium text-sm text-gray-900 truncate max-w-[140px]">
              {screen.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {device}
            </Badge>
            {(isHovered || selected) && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={() => setShowFullPreview(true)}
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={() => onPreview?.(screen)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={() => onEdit?.(screen)}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Wireframe Preview Container */}
        <div className="wireframe-preview-container">
          <div
            className={`wireframe-viewport ${device.toLowerCase()}`}
            style={{
              width: nodeWidth,
              height: nodeHeight,
              backgroundColor: '#ffffff',
              border: device === DeviceType.MOBILE ? '2px solid #333' : '1px solid #ddd',
              borderRadius: device === DeviceType.MOBILE ? '20px' : device === DeviceType.TABLET ? '12px' : '4px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Screen Content */}
            <div 
              className="wireframe-content"
              style={{
                width: deviceDimensions.width,
                height: deviceDimensions.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                overflow: 'hidden',
                backgroundColor: '#fafafa',
              }}
            >
              {screen.components.map(component => (
                <WireframeComponent
                  key={component.id}
                  component={component}
                  scale={1}
                  interactive={false}
                />
              ))}
              
              {/* Empty State */}
              {screen.components.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  <div className="text-center">
                    <MoreVertical className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Empty Screen</p>
                    <p className="text-xs">Add components to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Component Count */}
        {screen.components.length > 0 && (
          <div className="wireframe-node-footer">
            <span className="text-xs text-gray-500">
              {screen.components.length} component{screen.components.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{screen.name} - Full Preview</h3>
              <Button
                variant="ghost"
                onClick={() => setShowFullPreview(false)}
              >
                ×
              </Button>
            </div>
            <div 
              className="border rounded-lg overflow-auto"
              style={{
                width: Math.min(deviceDimensions.width, 800),
                height: Math.min(deviceDimensions.height, 600),
              }}
            >
              {screen.components.map(component => (
                <WireframeComponent
                  key={component.id}
                  component={component}
                  scale={1}
                  interactive={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .wireframe-screen-node {
          background: #ffffff;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .wireframe-screen-node:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .wireframe-screen-node.selected {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }
        
        .wireframe-node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .wireframe-preview-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .wireframe-viewport.mobile {
          background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .wireframe-viewport.tablet {
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
        }
        
        .wireframe-viewport.desktop {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .wireframe-node-footer {
          text-align: center;
          padding-top: 4px;
          border-top: 1px solid #f0f0f0;
        }
        
        .wireframe-handle {
          width: 12px;
          height: 12px;
          background: #007bff;
          border: 2px solid #ffffff;
          border-radius: 50%;
        }
        
        .wireframe-content {
          position: relative;
        }
      `}</style>
    </>
  );
}