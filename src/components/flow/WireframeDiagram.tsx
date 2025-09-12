'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import WireframeScreenNode from './WireframeScreenNode';
import CustomEdge from './CustomEdge';
import { WireframeFlow, WireframeFlowNode, WireframeScreen, DeviceType } from '@/types/app-architecture';

const nodeTypes: NodeTypes = {
  wireframe_screen: WireframeScreenNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface WireframeDiagramProps {
  flow: WireframeFlow;
  onFlowChange?: (updatedFlow: WireframeFlow) => void;
  editable?: boolean;
  selectedDevice?: DeviceType;
  onScreenEdit?: (screen: WireframeScreen) => void;
  onScreenPreview?: (screen: WireframeScreen) => void;
}

function WireframeDiagram({
  flow,
  onFlowChange,
  editable = true,
  selectedDevice = DeviceType.MOBILE,
  onScreenEdit,
  onScreenPreview,
}: WireframeDiagramProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Convert wireframe flow to React Flow format
  const reactFlowNodes: Node[] = useMemo(() => {
    return flow.nodes.map((node: WireframeFlowNode) => ({
      id: node.id,
      type: 'wireframe_screen',
      position: node.position,
      data: {
        ...node.data,
        onEdit: onScreenEdit,
        onPreview: onScreenPreview,
      },
      selected: selectedNodes.includes(node.id),
    }));
  }, [flow.nodes, selectedNodes, onScreenEdit, onScreenPreview]);

  const reactFlowEdges: Edge[] = useMemo(() => {
    return flow.edges.map((edge) => ({
      ...edge,
      type: 'custom',
      animated: true,
      style: {
        stroke: '#94a3b8',
        strokeWidth: 2,
      },
    }));
  }, [flow.edges]);

  // Update nodes and edges when flow changes
  React.useEffect(() => {
    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!editable) return;
      
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'custom',
        animated: true,
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      
      if (onFlowChange) {
        const updatedFlow = {
          nodes: flow.nodes,
          edges: [...flow.edges, {
            id: newEdge.id,
            source: newEdge.source!,
            target: newEdge.target!,
            type: newEdge.type,
            label: newEdge.label,
          }],
        };
        onFlowChange(updatedFlow);
      }
    },
    [editable, flow.edges, flow.nodes, onFlowChange, setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);
      
      if (onFlowChange && editable) {
        // Update positions in the flow data
        const updatedNodes = flow.nodes.map(node => {
          const change = changes.find(c => c.id === node.id && c.type === 'position');
          if (change && change.position) {
            return { ...node, position: change.position };
          }
          return node;
        });
        
        const updatedFlow = {
          nodes: updatedNodes,
          edges: flow.edges,
        };
        onFlowChange(updatedFlow);
      }
    },
    [onNodesChange, onFlowChange, editable, flow]
  );

  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);
      
      if (onFlowChange && editable) {
        // Handle edge deletions
        const deletedEdges = changes.filter(c => c.type === 'remove').map(c => c.id);
        if (deletedEdges.length > 0) {
          const updatedFlow = {
            nodes: flow.nodes,
            edges: flow.edges.filter(edge => !deletedEdges.includes(edge.id)),
          };
          onFlowChange(updatedFlow);
        }
      }
    },
    [onEdgesChange, onFlowChange, editable, flow]
  );

  const onSelectionChange = useCallback((elements: any) => {
    const nodeIds = elements.nodes?.map((node: any) => node.id) || [];
    setSelectedNodes(nodeIds);
  }, []);

  // Filter nodes by device type if needed
  const filteredNodes = useMemo(() => {
    if (!selectedDevice) return nodes;
    return nodes.filter(node => 
      node.data.device === selectedDevice || !node.data.device
    );
  }, [nodes, selectedDevice]);

  return (
    <div className="wireframe-diagram-container" style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        ref={reactFlowWrapper}
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode="loose"
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="shift"
        deleteKeyCode="Delete"
        selectNodesOnDrag={true}
        panOnDrag={[1]}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        elementsSelectable={editable}
        nodesConnectable={editable}
        nodesDraggable={editable}
        edgesFocusable={editable}
        className="wireframe-react-flow"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e2e8f0"
        />
        <Controls 
          position="bottom-right"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            if (node.data?.device === DeviceType.MOBILE) return '#10b981';
            if (node.data?.device === DeviceType.TABLET) return '#f59e0b';
            if (node.data?.device === DeviceType.DESKTOP) return '#3b82f6';
            return '#6b7280';
          }}
          nodeStrokeWidth={2}
          maskColor="rgb(240, 242, 247, 0.7)"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>

      <style jsx global>{`
        .wireframe-diagram-container {
          position: relative;
        }
        
        .wireframe-react-flow .react-flow__node-wireframe_screen {
          background: transparent;
          border: none;
          padding: 0;
        }
        
        .wireframe-react-flow .react-flow__handle {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .wireframe-react-flow .react-flow__node:hover .react-flow__handle,
        .wireframe-react-flow .react-flow__node.selected .react-flow__handle {
          opacity: 1;
        }
        
        .wireframe-react-flow .react-flow__edge-path {
          stroke-dasharray: 5, 5;
          stroke-linecap: round;
        }
        
        .wireframe-react-flow .react-flow__edge.animated .react-flow__edge-path {
          stroke-dasharray: 5, 5;
          animation: dash 20s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
        
        .wireframe-react-flow .react-flow__controls {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .wireframe-react-flow .react-flow__controls button {
          background: white;
          border: none;
          color: #374151;
          transition: all 0.2s ease;
        }
        
        .wireframe-react-flow .react-flow__controls button:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .wireframe-react-flow .react-flow__minimap {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default function WireframeDiagramWithProvider(props: WireframeDiagramProps) {
  return (
    <ReactFlowProvider>
      <WireframeDiagram {...props} />
    </ReactFlowProvider>
  );
}