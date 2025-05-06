import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

interface NodeEditModalProps {
  node: Node | null;
  onSave: (node: Node) => void;
  onDelete: (node: Node) => void;
  onCancel: () => void;
}

interface EdgeEditModalProps {
  edge: Edge | null;
  nodes: Node[];
  onSave: (edge: Edge) => void;
  onDelete: (edge: Edge) => void;
  onCancel: () => void;
}

function NodeEditModal({ node, onSave, onDelete, onCancel }: NodeEditModalProps) {
  const [label, setLabel] = useState(node?.label || '');

  useEffect(() => {
    if (node) {
      setLabel(node.label);
    }
  }, [node]);

  if (!node) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Node</h2>
          <button 
            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            onClick={() => onDelete(node)}
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Node ID</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={node.id} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Label</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            autoFocus
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => onSave({ ...node, label })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function EdgeEditModal({ edge, nodes, onSave, onDelete, onCancel }: EdgeEditModalProps) {
  const [weight, setWeight] = useState(edge?.weight || 1);

  useEffect(() => {
    if (edge) {
      setWeight(edge.weight);
    }
  }, [edge]);

  if (!edge) return null;

  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Edge</h2>
          <button 
            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            onClick={() => onDelete(edge)}
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Edge ID</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={edge.id} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">From</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={sourceNode?.label || edge.source} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">To</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={targetNode?.label || edge.target} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Weight</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded"
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))} 
            min={1}
            autoFocus
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => onSave({ ...edge, weight })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SimpleGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [edgeIdCounter, setEdgeIdCounter] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [editEdge, setEditEdge] = useState<Edge | null>(null);
  const [status, setStatus] = useState('Click on the canvas to add a node');
  const canvasRef = useRef<HTMLDivElement>(null);

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
    setStatus(`Node ${node.label} created`);
    return id;
  };

  // Add an edge between two nodes
  const addEdge = (sourceId: string, targetId: string, weight = 1) => {
    // Check if edge already exists
    const existing = edges.find(
      (e) => e.source === sourceId && e.target === targetId
    );
    
    if (existing) {
      setStatus('Edge already exists');
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
    setStatus(`Edge created with weight ${weight}`);
    return id;
  };

  // Handle clicks on the canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      // Check if clicking on a node or the canvas
      const target = e.target as HTMLElement;
      const isCanvas = target === canvasRef.current;
      
      if (isCanvas) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (selectedNode) {
          // Deselect the node when clicking canvas
          setSelectedNode(null);
          setStatus('Source node deselected');
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
    
    if (selectedNode) {
      if (selectedNode === node.id) {
        // Deselect if clicking the same node
        setSelectedNode(null);
        setStatus('Source node deselected');
      } else {
        // Create an edge to this node
        addEdge(selectedNode, node.id);
        setSelectedNode(null);
      }
    } else {
      // Select this node as source
      setSelectedNode(node.id);
      setStatus(`Selected ${node.label} as source node`);
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
      if (selectedNode === node.id) {
        setSelectedNode(null);
      }
      
      // Remove all edges connected to this node
      setEdges(edges.filter(e => e.source !== node.id && e.target !== node.id));
      
      // Remove the node
      setNodes(nodes.filter(n => n.id !== node.id));
      setStatus(`Node ${node.label} deleted`);
    } else {
      const edge = item as Edge;
      setEdges(edges.filter(e => e.id !== edge.id));
      setStatus('Edge deleted');
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
    setStatus(`Node ${updatedNode.label} updated`);
  };
  
  // Delete node from modal
  const handleDeleteNode = (node: Node) => {
    if (selectedNode === node.id) {
      setSelectedNode(null);
    }
    
    // Remove all edges connected to this node
    setEdges(edges.filter(e => e.source !== node.id && e.target !== node.id));
    
    // Remove the node
    setNodes(nodes.filter(n => n.id !== node.id));
    setEditNode(null);
    setStatus(`Node ${node.label} deleted`);
  };
  
  // Save edited edge
  const handleSaveEdge = (updatedEdge: Edge) => {
    setEdges(edges.map(e => e.id === updatedEdge.id ? updatedEdge : e));
    setEditEdge(null);
    setStatus(`Edge weight updated to ${updatedEdge.weight}`);
  };
  
  // Delete edge from modal
  const handleDeleteEdge = (edge: Edge) => {
    setEdges(edges.filter(e => e.id !== edge.id));
    setEditEdge(null);
    setStatus('Edge deleted');
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
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                onClick={(e) => handleEdgeClick(e, edge)}
                onContextMenu={(e) => handleRightClick(e, edge, 'edge')}
              />
              <circle 
                cx={labelPos.x} 
                cy={labelPos.y} 
                r="10" 
                fill="white" 
                onClick={(e) => handleEdgeClick(e, edge)}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dy=".3em"
                fontSize="10"
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
          className={`absolute rounded-full flex items-center justify-center w-10 h-10 select-none cursor-pointer
            ${selectedNode === node.id ? 'ring-2 ring-green-600' : ''}
          `}
          style={{
            left: node.x - 20,
            top: node.y - 20,
            backgroundColor: '#4299E1',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
          onClick={(e) => handleNodeClick(e, node)}
          onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
          onContextMenu={(e) => handleRightClick(e, node, 'node')}
        >
          {node.label}
        </div>
      ))}
      
      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 text-sm p-2 border-t border-gray-200">
        {status}
      </div>
      
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