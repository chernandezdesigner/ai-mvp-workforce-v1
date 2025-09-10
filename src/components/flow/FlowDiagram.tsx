'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
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
  useReactFlow,
  ReactFlowProvider,
  OnSelectionChangeParams,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ScreenNode from './ScreenNode';
import ApiNode from './ApiNode';
import StartEndNode from './StartEndNode';
import CustomEdge from './CustomEdge';
import FlowToolbar, { ToolbarAction } from './FlowToolbar';
import NodeContextMenu from './NodeContextMenu';
import NodeEditDialog from './NodeEditDialog';
import NodeCreationPanel from './NodeCreationPanel';
import EdgeContextMenu from './EdgeContextMenu';
import SelectionToolbar from './SelectionToolbar';
import QuickStartOverlay from './QuickStartOverlay';
import { AppFlow, FlowNode, ScreenType, HttpMethod } from '@/types/app-architecture';

interface FlowDiagramProps {
  flow: AppFlow;
  onFlowChange?: (flow: AppFlow) => void;
  editable?: boolean;
}

interface NodeTemplate {
  id: string;
  type: 'screen' | 'api' | 'start' | 'end';
  label: string;
  description: string;
  data: any;
  category: string;
}

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
  api: ApiNode,
  start: StartEndNode,
  end: StartEndNode,
};

const edgeTypes = {
  default: CustomEdge,
  smoothstep: CustomEdge,
};

const defaultEdgeOptions = {
  type: 'default',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#374151',
  },
  style: {
    strokeWidth: 2,
    stroke: '#374151',
    strokeDasharray: '0',
  },
  labelStyle: {
    fontSize: 11,
    fontWeight: 500,
    color: '#374151',
  },
  labelBgStyle: {
    fill: 'white',
    fillOpacity: 0.9,
  },
  labelBgPadding: [4, 8],
  labelBgBorderRadius: 4,
};

function FlowDiagramInner({ 
  flow, 
  onFlowChange, 
  editable = true 
}: FlowDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const [selectedTool, setSelectedTool] = useState('select');
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{
    edgeId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [selectionToolbar, setSelectionToolbar] = useState<{
    position: { x: number; y: number };
  } | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  
  // Show quick start on first load
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('flowDiagram_hasSeenQuickStart');
    if (!hasSeenGuide && flow.nodes.length === 0) {
      setTimeout(() => setShowQuickStart(true), 1000);
    }
  }, [flow.nodes.length]);
  
  // Listen for custom edge context menu events
  useEffect(() => {
    const handleEdgeContextMenu = (event: CustomEvent) => {
      const { edgeId, clientX, clientY } = event.detail;
      
      // Get the flow container's bounding rect
      const flowContainer = document.querySelector('.react-flow');
      const containerRect = flowContainer?.getBoundingClientRect();
      
      if (containerRect) {
        const x = clientX - containerRect.left;
        const y = clientY - containerRect.top;
        
        setEdgeContextMenu({
          edgeId,
          position: { x, y }
        });
      }
    };
    
    window.addEventListener('edgeContextMenu', handleEdgeContextMenu as EventListener);
    return () => {
      window.removeEventListener('edgeContextMenu', handleEdgeContextMenu as EventListener);
    };
  }, []);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[]; }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const reactFlowInstance = useReactFlow();
  const nodeIdCounter = useRef(1000);

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!editable || selectedTool !== 'select') return;
      
      const newEdge = {
        ...params,
        id: `edge_${Date.now()}`,
        type: 'default',
        animated: false,
        label: 'Action',
        ...defaultEdgeOptions
      };
      
      saveToHistory();
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      
      if (onFlowChange) {
        onFlowChange({ nodes, edges: newEdges });
      }
    },
    [edges, nodes, onFlowChange, editable, selectedTool, saveToHistory]
  );

  // Handle selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      const nodeIds = selectedNodes.map(node => node.id);
      const edgeIds = selectedEdges.map(edge => edge.id);
      setSelectedNodes(nodeIds);
      setSelectedEdges(edgeIds);
      
      // Show selection toolbar if multiple items selected
      const totalSelected = nodeIds.length + edgeIds.length;
      if (totalSelected > 1) {
        const bounds = selectedNodes.reduce((acc, node) => {
          return {
            minX: Math.min(acc.minX, node.position.x),
            maxX: Math.max(acc.maxX, node.position.x + 200),
            minY: Math.min(acc.minY, node.position.y),
            maxY: Math.max(acc.maxY, node.position.y + 100)
          };
        }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
        
        setSelectionToolbar({
          position: { x: bounds.minX, y: bounds.minY - 60 }
        });
      } else {
        setSelectionToolbar(null);
      }
    },
    []
  );

  // Handle toolbar actions
  const handleToolbarAction = useCallback(
    (action: ToolbarAction) => {
      switch (action.type) {
        case 'select':
          setSelectedTool('select');
          break;
        case 'pan':
          setSelectedTool('pan');
          break;
        case 'add-screen':
        case 'add-api':
        case 'add-start':
        case 'add-end':
          setShowNodePanel(true);
          break;
        case 'copy':
          // Handle copy
          break;
        case 'delete':
          handleDeleteSelected();
          break;
        case 'undo':
          handleUndo();
          break;
        case 'redo':
          handleRedo();
          break;
        case 'zoom-in':
          reactFlowInstance.zoomIn();
          break;
        case 'zoom-out':
          reactFlowInstance.zoomOut();
          break;
        case 'fit-view':
          reactFlowInstance.fitView();
          break;
        case 'toggle-grid':
          setShowGrid(!showGrid);
          break;
        case 'toggle-minimap':
          setShowMinimap(!showMinimap);
          break;
        case 'show-help':
          setShowQuickStart(true);
          break;
        default:
          break;
      }
    },
    [reactFlowInstance, showGrid, showMinimap]
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    
    saveToHistory();
    
    // Delete selected nodes and their connected edges
    if (selectedNodes.length > 0) {
      setNodes(nodes => nodes.filter(node => !selectedNodes.includes(node.id)));
      setEdges(edges => edges.filter(edge => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      ));
    }
    
    // Delete selected edges
    if (selectedEdges.length > 0) {
      setEdges(edges => edges.filter(edge => !selectedEdges.includes(edge.id)));
    }
    
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, saveToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    
    const prevState = history[historyIndex - 1];
    setNodes(prevState.nodes);
    setEdges(prevState.edges);
    setHistoryIndex(historyIndex - 1);
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setHistoryIndex(historyIndex + 1);
  }, [history, historyIndex]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      if (onFlowChange) {
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
        setTimeout(() => {
          onFlowChange({ nodes, edges });
        }, 0);
      }
    },
    [onEdgesChange, onFlowChange, nodes, edges]
  );

  // Handle node context menu
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get the flow container's bounding rect
      const flowContainer = event.currentTarget.closest('.react-flow');
      const containerRect = flowContainer?.getBoundingClientRect();
      
      if (containerRect) {
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;
        
        setContextMenu({
          nodeId: node.id,
          position: { x, y }
        });
      }
    },
    []
  );

  // Handle edge context menu
  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get the flow container's bounding rect
      const flowContainer = event.currentTarget.closest('.react-flow');
      const containerRect = flowContainer?.getBoundingClientRect();
      
      if (containerRect) {
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;
        
        setEdgeContextMenu({
          edgeId: edge.id,
          position: { x, y }
        });
      }
    },
    []
  );

  // Handle node creation
  const handleCreateNode = useCallback(
    (template: NodeTemplate, position: { x: number; y: number }) => {
      const newNode: FlowNode = {
        id: `node_${nodeIdCounter.current++}`,
        type: template.type,
        position,
        data: { ...template.data }
      };
      
      saveToHistory();
      setNodes(nodes => [...nodes, newNode]);
      
      if (onFlowChange) {
        onFlowChange({ nodes: [...nodes, newNode], edges });
      }
    },
    [nodes, edges, onFlowChange, saveToHistory]
  );

  // Handle node editing
  const handleEditNode = useCallback(
    (nodeId: string, updates: Partial<FlowNode['data']>) => {
      saveToHistory();
      setNodes(nodes => 
        nodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [saveToHistory]
  );

  // Handle edge editing
  const handleEditEdgeLabel = useCallback(
    (edgeId: string, newLabel: string) => {
      setEdges(edges => 
        edges.map(edge => 
          edge.id === edgeId 
            ? { ...edge, label: newLabel }
            : edge
        )
      );
    },
    []
  );

  const handleChangeEdgeStyle = useCallback(
    (edgeId: string, newStyle: any) => {
      setEdges(edges => 
        edges.map(edge => 
          edge.id === edgeId 
            ? { ...edge, style: { ...edge.style, ...newStyle } }
            : edge
        )
      );
    },
    []
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      saveToHistory();
      setEdges(edges => edges.filter(edge => edge.id !== edgeId));
    },
    [saveToHistory]
  );

  // Selection actions
  const handleAlignNodes = useCallback(
    (direction: 'left' | 'center' | 'right') => {
      const selectedNodesList = nodes.filter(node => selectedNodes.includes(node.id));
      if (selectedNodesList.length < 2) return;
      
      saveToHistory();
      
      let alignX: number;
      switch (direction) {
        case 'left':
          alignX = Math.min(...selectedNodesList.map(node => node.position.x));
          break;
        case 'right':
          alignX = Math.max(...selectedNodesList.map(node => node.position.x));
          break;
        case 'center':
        default:
          const minX = Math.min(...selectedNodesList.map(node => node.position.x));
          const maxX = Math.max(...selectedNodesList.map(node => node.position.x));
          alignX = (minX + maxX) / 2;
          break;
      }
      
      setNodes(nodes => 
        nodes.map(node => 
          selectedNodes.includes(node.id)
            ? { ...node, position: { ...node.position, x: alignX } }
            : node
        )
      );
    },
    [nodes, selectedNodes, saveToHistory]
  );

  const handleDistributeNodes = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      const selectedNodesList = nodes.filter(node => selectedNodes.includes(node.id));
      if (selectedNodesList.length < 3) return;
      
      saveToHistory();
      
      selectedNodesList.sort((a, b) => 
        direction === 'horizontal' 
          ? a.position.x - b.position.x
          : a.position.y - b.position.y
      );
      
      const first = selectedNodesList[0];
      const last = selectedNodesList[selectedNodesList.length - 1];
      const totalDistance = direction === 'horizontal'
        ? last.position.x - first.position.x
        : last.position.y - first.position.y;
      const step = totalDistance / (selectedNodesList.length - 1);
      
      setNodes(nodes => 
        nodes.map(node => {
          const index = selectedNodesList.findIndex(n => n.id === node.id);
          if (index === -1) return node;
          
          const newPosition = direction === 'horizontal'
            ? { ...node.position, x: first.position.x + (step * index) }
            : { ...node.position, y: first.position.y + (step * index) };
            
          return { ...node, position: newPosition };
        })
      );
    },
    [nodes, selectedNodes, saveToHistory]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            event.preventDefault();
            handleRedo();
            break;
          case 'c':
            if (selectedNodes.length > 0 || selectedEdges.length > 0) {
              event.preventDefault();
              // Handle copy
            }
            break;
        }
      } else {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedNodes.length > 0 || selectedEdges.length > 0) {
              event.preventDefault();
              handleDeleteSelected();
            }
            break;
          case 'v':
            setSelectedTool('select');
            break;
          case 'h':
            setSelectedTool('pan');
            break;
          case 'f':
            reactFlowInstance.fitView();
            break;
          case 'g':
            setShowGrid(!showGrid);
            break;
          case 'm':
            setShowMinimap(!showMinimap);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDeleteSelected, selectedNodes, selectedEdges, reactFlowInstance, showGrid, showMinimap]);

  // Close context menus when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setEdgeContextMenu(null);
    };
    if (contextMenu || edgeContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu, edgeContextMenu]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="h-full w-full bg-background rounded-lg border relative">
      {/* Toolbar */}
      <FlowToolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolbarAction}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        showGrid={showGrid}
        showMinimap={showMinimap}
        selectedNodesCount={selectedNodes.length + selectedEdges.length}
        onShowHelp={() => setShowQuickStart(true)}
      />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{ strokeWidth: 2, stroke: '#374151' }}
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
        nodesDraggable={editable && selectedTool === 'select'}
        nodesConnectable={editable && selectedTool === 'select'}
        elementsSelectable={editable}
        selectNodesOnDrag={editable && selectedTool === 'select'}
        panOnDrag={selectedTool === 'pan'}
        selectionOnDrag={selectedTool === 'select'}
        multiSelectionKeyCode="Shift"
      >
        {showGrid && (
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#d1d5db" 
            className="bg-gray-50"
          />
        )}
        <Controls 
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="hidden"
        />
        {showMinimap && (
          <MiniMap 
            nodeColor="#f9fafb"
            nodeStrokeColor="#d1d5db"
            nodeStrokeWidth={1}
            maskColor="rgba(0, 0, 0, 0.03)"
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            style={{
              backgroundColor: 'white',
            }}
            pannable
            zoomable
            position="bottom-right"
          />
        )}
      </ReactFlow>

      {/* Context Menus */}
      {contextMenu && (
        <NodeContextMenu
          position={contextMenu.position}
          nodeId={contextMenu.nodeId}
          nodeType={nodes.find(n => n.id === contextMenu.nodeId)?.type || 'unknown'}
          onEdit={(nodeId) => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) setEditingNode(node);
          }}
          onCopy={() => {/* Handle copy */}}
          onDelete={(nodeId) => {
            saveToHistory();
            setNodes(nodes => nodes.filter(n => n.id !== nodeId));
            setEdges(edges => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
          }}
          onDuplicate={(nodeId) => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
              const newNode = {
                ...node,
                id: `node_${nodeIdCounter.current++}`,
                position: { x: node.position.x + 50, y: node.position.y + 50 }
              };
              saveToHistory();
              setNodes(nodes => [...nodes, newNode]);
            }
          }}
          onToggleVisibility={() => {/* Handle visibility */}}
          onToggleLock={() => {/* Handle lock */}}
          onClose={() => setContextMenu(null)}
        />
      )}

      {edgeContextMenu && (
        <EdgeContextMenu
          position={edgeContextMenu.position}
          edgeId={edgeContextMenu.edgeId}
          currentLabel={edges.find(e => e.id === edgeContextMenu.edgeId)?.label}
          onEditLabel={handleEditEdgeLabel}
          onDelete={handleDeleteEdge}
          onChangeStyle={handleChangeEdgeStyle}
          onClose={() => setEdgeContextMenu(null)}
        />
      )}

      {/* Selection Toolbar */}
      {selectionToolbar && (selectedNodes.length + selectedEdges.length) > 1 && (
        <SelectionToolbar
          selectedCount={selectedNodes.length + selectedEdges.length}
          position={selectionToolbar.position}
          onCopy={() => {/* Handle copy */}}
          onDelete={handleDeleteSelected}
          onGroup={() => {/* Handle group */}}
          onUngroup={() => {/* Handle ungroup */}}
          onAlignLeft={() => handleAlignNodes('left')}
          onAlignCenter={() => handleAlignNodes('center')}
          onAlignRight={() => handleAlignNodes('right')}
          onDistributeHorizontal={() => handleDistributeNodes('horizontal')}
          onDistributeVertical={() => handleDistributeNodes('vertical')}
          onToggleLock={() => {/* Handle lock */}}
          onToggleVisibility={() => {/* Handle visibility */}}
          onClose={() => setSelectionToolbar(null)}
        />
      )}

      {/* Dialogs */}
      <NodeEditDialog
        node={editingNode}
        isOpen={!!editingNode}
        onClose={() => setEditingNode(null)}
        onSave={handleEditNode}
      />

      {/* Node Creation Panel */}
      <NodeCreationPanel
        isOpen={showNodePanel}
        onClose={() => setShowNodePanel(false)}
        onCreateNode={handleCreateNode}
      />

      {/* Quick Start Overlay */}
      <QuickStartOverlay
        isVisible={showQuickStart}
        onClose={() => setShowQuickStart(false)}
      />
    </div>
  );
}

export default function FlowDiagram(props: FlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
