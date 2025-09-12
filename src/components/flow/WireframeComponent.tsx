'use client';

import React from 'react';
import { WireframeComponent as WireframeComponentType, ComponentType } from '@/types/app-architecture';

interface WireframeComponentProps {
  component: WireframeComponentType;
  scale?: number;
  interactive?: boolean;
}

export default function WireframeComponent({ component, scale = 1, interactive = true }: WireframeComponentProps) {
  const renderComponent = (comp: WireframeComponentType): React.ReactElement => {
    const { tag, content, placeholder, styles, children, props = {} } = comp;
    
    // Convert styles object to CSS style object
    const cssStyles: React.CSSProperties = {
      ...styles,
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'top left',
    };

    // Add wireframe-specific styling based on component type
    const wireframeStyles = getWireframeStyles(comp.type);
    const finalStyles = { ...wireframeStyles, ...cssStyles };

    // Handle different HTML tags
    const commonProps = {
      key: comp.id,
      style: finalStyles,
      className: `wireframe-${comp.type} ${interactive ? 'interactive' : ''}`,
      ...props,
    };

    // Render content based on component type and tag
    const renderContent = () => {
      if (children && children.length > 0) {
        return children.map(child => renderComponent(child));
      }
      
      if (comp.type === ComponentType.IMAGE) {
        return (
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100px',
            color: '#666',
            fontSize: '12px'
          }}>
            📷 {content || 'Image'}
          </div>
        );
      }
      
      if (comp.type === ComponentType.INPUT) {
        return (
          <input
            type="text"
            placeholder={placeholder || 'Enter text...'}
            value=""
            readOnly={!interactive}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        );
      }
      
      if (comp.type === ComponentType.TEXTAREA) {
        return (
          <textarea
            placeholder={placeholder || 'Enter text...'}
            rows={3}
            readOnly={!interactive}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        );
      }
      
      if (comp.type === ComponentType.BUTTON || comp.type === ComponentType.SUBMIT_BUTTON) {
        return (
          <button
            disabled={!interactive}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: comp.type === ComponentType.SUBMIT_BUTTON ? '#007bff' : '#f8f9fa',
              color: comp.type === ComponentType.SUBMIT_BUTTON ? 'white' : '#212529',
              cursor: interactive ? 'pointer' : 'default',
              fontSize: '14px',
            }}
          >
            {content || 'Button'}
          </button>
        );
      }
      
      if (comp.type === ComponentType.LOADING_SPINNER) {
        return (
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        );
      }
      
      return content || placeholder || getDefaultContent(comp.type);
    };

    // Create the React element with the appropriate tag
    return React.createElement(
      tag,
      commonProps,
      renderContent()
    );
  };

  return (
    <div className="wireframe-component-wrapper">
      {renderComponent(component)}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .wireframe-component-wrapper {
          position: relative;
        }
        .interactive {
          transition: all 0.2s ease;
        }
        .interactive:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

function getWireframeStyles(type: ComponentType): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  switch (type) {
    case ComponentType.CONTAINER:
      return {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      };
    
    case ComponentType.HEADER:
      return {
        ...baseStyles,
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        fontWeight: 'bold',
      };
    
    case ComponentType.NAVBAR:
      return {
        ...baseStyles,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        minHeight: '60px',
      };
    
    case ComponentType.CARD:
      return {
        ...baseStyles,
        padding: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      };
    
    case ComponentType.HEADING:
      return {
        ...baseStyles,
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
        color: '#212529',
      };
    
    case ComponentType.PARAGRAPH:
      return {
        ...baseStyles,
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#666',
        margin: '0 0 12px 0',
      };
    
    case ComponentType.LIST:
      return {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '0',
        margin: '0',
        listStyle: 'none',
      };
    
    case ComponentType.LIST_ITEM:
      return {
        ...baseStyles,
        padding: '8px 12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '4px',
        fontSize: '14px',
      };
    
    case ComponentType.FORM:
      return {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
      };
    
    default:
      return baseStyles;
  }
}

function getDefaultContent(type: ComponentType): string {
  switch (type) {
    case ComponentType.HEADING:
      return 'Page Title';
    case ComponentType.PARAGRAPH:
      return 'This is a paragraph of text content that would appear in your wireframe.';
    case ComponentType.BUTTON:
      return 'Button';
    case ComponentType.SUBMIT_BUTTON:
      return 'Submit';
    case ComponentType.NAVBAR:
      return 'Navigation Bar';
    case ComponentType.HEADER:
      return 'Header Content';
    case ComponentType.FOOTER:
      return 'Footer Content';
    case ComponentType.LIST_ITEM:
      return 'List Item';
    case ComponentType.CARD:
      return 'Card Content';
    default:
      return 'Content';
  }
}