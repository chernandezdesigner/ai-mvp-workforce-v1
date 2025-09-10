'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ScreenNode from './ScreenNode';
import ApiNode from './ApiNode';
import StartEndNode from './StartEndNode';
import { AppFlow } from '@/types/app-architecture';

interface FlowDiagramProps {
  flow: AppFlow;
  onFlowChange?: (flow: AppFlow) => void;
  editable?: boolean;
}

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
  api: ApiNode,
  start: StartEndNode,
  end: StartEndNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#6366f1',
  },
  style: {
    strokeWidth: 3,
    stroke: '#6366f1',
    strokeDasharray: '0',
  },
};

export default function FlowDiagram({ 
  flow, 
  onFlowChange, 
  editable = true 
}: FlowDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!editable) return;
      
      const newEdge = {
        ...params,
        id: `edge_${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#6366f1',
        },
        style: {
          strokeWidth: 3,
          stroke: '#6366f1',
        },
        labelStyle: {
          fontSize: 11,
          fontWeight: 500,
          color: '#374151',
        },
        label: 'Action',
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 8],
        labelBgBorderRadius: 4,
      };
      
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      
      if (onFlowChange) {
        onFlowChange({ nodes, edges: newEdges });
      }
    },
    [edges, nodes, onFlowChange, editable]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      if (onFlowChange) {
        // Get updated nodes after the change
        setTimeout(() => {
          onFlowChange({ nodes, edges });
        }, 0);
      }
    },
    [onNodesChange, onFlowChange, nodes, edges]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      if (onFlowChange) {
        // Get updated edges after the change
        setTimeout(() => {
          onFlowChange({ nodes, edges });
        }, 0);
      }
    },
    [onEdgesChange, onFlowChange, nodes, edges]
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="h-full w-full bg-background rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{ strokeWidth: 3, stroke: '#6366f1' }}
        connectionLineType="smoothstep"
        fitView={false}
        fitViewOptions={{ padding: 0.3, maxZoom: 0.8, minZoom: 0.1 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        minZoom={0.1}
        maxZoom={1.2}
        snapToGrid={true}
        snapGrid={[20, 20]}
        attributionPosition="bottom-left"
        proOptions={proOptions}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
        selectNodesOnDrag={editable}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#e5e7eb" 
          className="bg-gray-50"
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={editable}
          className="bg-white border border-gray-200 rounded-lg shadow-md"
        />
        <MiniMap 
          nodeColor="#f3f4f6"
          nodeStrokeColor="#d1d5db"
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.05)"
          className="bg-white border border-gray-200 rounded-lg shadow-md"
          style={{
            backgroundColor: 'white',
          }}
          pannable
          zoomable
          position="top-right"
        />
      </ReactFlow>
    </div>
  );
}
