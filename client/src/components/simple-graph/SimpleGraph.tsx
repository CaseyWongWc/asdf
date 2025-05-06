import React, { useState, useRef, useEffect, useContext } from 'react';
import { GraphContext } from '../../contexts/GraphContext';
import { useIsMobile } from '../../hooks/use-mobile';
import { Node, Edge } from '../simple-graph/types';
import NodeEditModal from './NodeEditModal';
import EdgeEditModal from './EdgeEditModal';

export default function SimpleGraph() {
  // Use the graph context
  const { setStatusMessage, setNodeCount, setEdgeCount, nodeEditId, setNodeEditId, edgeEditId, setEdgeEditId, sourceNode, setSourceNode } = useContext(GraphContext);
  const isMobile = useIsMobile();
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [edgeIdCounter, setEdgeIdCounter] = useState(1);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [editEdge, setEditEdge] = useState<Edge | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update the context values when nodes or edges change
  useEffect(() => {
    setNodeCount(nodes.length);
    setEdgeCount(edges.length);
  }, [nodes, edges, setNodeCount, setEdgeCount]);

  // Add a node at the specified position
  const addNode = (x: number, y: number) => {
    const id = `n${nodeIdCounter}`;
    const node: Node = {
      id,
      label: `Node ${nodeIdCounter}`,
      x,
      y,
    };
    
    setNodes([...nodes, node]);
    setNodeIdCounter(nodeIdCounter + 1);
    setStatusMessage(`Node ${node.label} created`);
    return id;
  };

  // Add an edge between two nodes
  const addEdge = (sourceId: string, targetId: string, weight = 1) => {
    // Check if edge already exists
    const existing = edges.find(
      (e) => e.source === sourceId && e.target === targetId
    );
    
    if (existing) {
      setStatusMessage('Edge already exists');
      return null;
    }
    
    const id = `e${edgeIdCounter}`;
    const edge: Edge = {
      id,
      source: sourceId,
      target: targetId,
      weight,
    };
    
    setEdges([...edges, edge]);
    setEdgeIdCounter(edgeIdCounter + 1);
    setStatusMessage(`Edge created with weight ${weight}`);
    return id;
  };

  // Add some initial nodes
  useEffect(() => {
    // Only add initial nodes if we don't have any
    if (nodes.length === 0) {
      setTimeout(() => {
        console.log('Adding initial nodes');
        addNode(100, 100);
        addNode(250, 100);
        addNode(150, 200);
      }, 500);
    }
  }, []);

  // Handle clicks on the canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      // Check if clicking on a node or the canvas
      const target = e.target as HTMLElement;
      const isCanvas = target === canvasRef.current || target.tagName === 'svg';
      
      if (isCanvas) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log('Canvas click at', x, y, 'isCanvas:', isCanvas);
        
        if (sourceNode) {
          // Deselect the node when clicking canvas
          setSourceNode(null);
          setStatusMessage('Source node deselected');
        } else {
          // Add a new node
          addNode(x, y);
        }
      }
    }
  };

  // Handle clicks on nodes
  const handleNodeClick = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    
    if (sourceNode) {
      if (sourceNode === node.id) {
        // Deselect if clicking the same node
        setSourceNode(null);
        setStatusMessage('Source node deselected');
      } else {
        // Create an edge to this node
        addEdge(sourceNode, node.id);
        setSourceNode(null);
      }
    } else {
      // Select this node as source
      setSourceNode(node.id);
      setStatusMessage(`Selected ${node.label} as source node`);
    }
  };

  // Handle editing a node
  const handleNodeDoubleClick = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    setEditNode(node);
  };
  
  // Handle right click on nodes or edges
  const handleRightClick = (e: React.MouseEvent, item: Node | Edge, type: 'node' | 'edge') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'node') {
      const node = item as Node;
      if (sourceNode === node.id) {
        setSourceNode(null);
      }
      
      // Remove all edges connected to this node
      setEdges(edges.filter(e => e.source !== node.id && e.target !== node.id));
      
      // Remove the node
      setNodes(nodes.filter(n => n.id !== node.id));
      setStatusMessage(`Node ${node.label} deleted`);
    } else {
      const edge = item as Edge;
      setEdges(edges.filter(e => e.id !== edge.id));
      setStatusMessage('Edge deleted');
    }
  };
  
  // Handle edge clicks
  const handleEdgeClick = (e: React.MouseEvent, edge: Edge) => {
    e.stopPropagation();
    setEditEdge(edge);
  };

  // Save edited node
  const handleSaveNode = (updatedNode: Node) => {
    setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
    setEditNode(null);
    setStatusMessage(`Node ${updatedNode.label} updated`);
  };
  
  // Delete node from modal
  const handleDeleteNode = (node: Node) => {
    if (sourceNode === node.id) {
      setSourceNode(null);
    }
    
    // Remove all edges connected to this node
    setEdges(edges.filter(e => e.source !== node.id && e.target !== node.id));
    
    // Remove the node
    setNodes(nodes.filter(n => n.id !== node.id));
    setEditNode(null);
    setStatusMessage(`Node ${node.label} deleted`);
  };
  
  // Save edited edge
  const handleSaveEdge = (updatedEdge: Edge) => {
    setEdges(edges.map(e => e.id === updatedEdge.id ? updatedEdge : e));
    setEditEdge(null);
    setStatusMessage(`Edge weight updated to ${updatedEdge.weight}`);
  };
  
  // Delete edge from modal
  const handleDeleteEdge = (edge: Edge) => {
    setEdges(edges.filter(e => e.id !== edge.id));
    setEditEdge(null);
    setStatusMessage('Edge deleted');
  };

  // Calculate position of the edge label
  const getEdgeLabelPosition = (edge: Edge) => {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);
    
    if (!source || !target) return { x: 0, y: 0 };
    
    return {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
    };
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-white"
      onClick={handleCanvasClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          
          if (!source || !target) return null;
          
          const labelPos = getEdgeLabelPosition(edge);
          
          return (
            <g key={edge.id} className="pointer-events-auto">
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#64748B"
                strokeWidth={isMobile ? "3" : "2"}
                markerEnd="url(#arrowhead)"
                onClick={(e) => handleEdgeClick(e, edge)}
                onContextMenu={(e) => handleRightClick(e, edge, 'edge')}
              />
              <circle 
                cx={labelPos.x} 
                cy={labelPos.y} 
                r={isMobile ? "12" : "10"} 
                fill="white" 
                onClick={(e) => handleEdgeClick(e, edge)}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dy=".3em"
                fontSize={isMobile ? "12" : "10"}
                onClick={(e) => handleEdgeClick(e, edge)}
              >
                {edge.weight}
              </text>
            </g>
          );
        })}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
          </marker>
        </defs>
      </svg>
      
      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute rounded-full flex items-center justify-center select-none cursor-pointer
            ${sourceNode === node.id ? 'ring-2 ring-green-600' : ''}
          `}
          style={{
            left: node.x - (isMobile ? 25 : 20),
            top: node.y - (isMobile ? 25 : 20),
            width: isMobile ? '50px' : '40px',
            height: isMobile ? '50px' : '40px',
            backgroundColor: '#4299E1',
            color: 'white',
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '12px'
          }}
          onClick={(e) => handleNodeClick(e, node)}
          onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
          onContextMenu={(e) => handleRightClick(e, node, 'node')}
        >
          {node.label}
        </div>
      ))}
      
      {/* Node edit modal */}
      {editNode && (
        <NodeEditModal
          node={editNode}
          onSave={handleSaveNode}
          onDelete={handleDeleteNode}
          onCancel={() => setEditNode(null)}
        />
      )}
      
      {/* Edge edit modal */}
      {editEdge && (
        <EdgeEditModal
          edge={editEdge}
          nodes={nodes}
          onSave={handleSaveEdge}
          onDelete={handleDeleteEdge}
          onCancel={() => setEditEdge(null)}
        />
      )}
    </div>
  );
}