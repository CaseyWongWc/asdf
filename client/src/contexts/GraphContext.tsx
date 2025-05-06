import { createContext, useState, ReactNode, useEffect } from "react";

// Extend the Window interface to include our cytoscape instance
declare global {
  interface Window {
    cy: any; // Cytoscape instance
  }
}

export interface GraphContextProps {
  title: string;
  setTitle: (title: string) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
  nodeCount: number;
  setNodeCount: (count: number) => void;
  edgeCount: number;
  setEdgeCount: (count: number) => void;
  nodeEditId: string | null;
  setNodeEditId: (id: string | null) => void;
  edgeEditId: string | null;
  setEdgeEditId: (id: string | null) => void;
  sourceNode: string | null;
  setSourceNode: (id: string | null) => void;
  nodeIdCounter: number;
  setNodeIdCounter: (count: number) => void;
  edgeIdCounter: number;
  setEdgeIdCounter: (count: number) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  resetGraph: () => void;
  createNode: (x: number, y: number, label?: string, cy?: any) => string;
  createEdge: (sourceId: string, targetId: string, weight?: number, cy?: any) => string | null;
}

export const GraphContext = createContext<GraphContextProps>({
  title: "Untitled Graph",
  setTitle: () => {},
  statusMessage: "Ready",
  setStatusMessage: () => {},
  nodeCount: 0,
  setNodeCount: () => {},
  edgeCount: 0,
  setEdgeCount: () => {},
  nodeEditId: null,
  setNodeEditId: () => {},
  edgeEditId: null,
  setEdgeEditId: () => {},
  sourceNode: null,
  setSourceNode: () => {},
  nodeIdCounter: 0,
  setNodeIdCounter: () => {},
  edgeIdCounter: 0,
  setEdgeIdCounter: () => {},
  showHelp: false,
  setShowHelp: () => {},
  resetGraph: () => {},
  createNode: () => "",
  createEdge: () => null,
});

interface GraphProviderProps {
  children: ReactNode;
}

export const GraphProvider = ({ children }: GraphProviderProps) => {
  const [title, setTitle] = useState<string>("Untitled Graph");
  const [statusMessage, setStatusMessage] = useState<string>("Ready");
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [edgeCount, setEdgeCount] = useState<number>(0);
  const [nodeEditId, setNodeEditId] = useState<string | null>(null);
  const [edgeEditId, setEdgeEditId] = useState<string | null>(null);
  const [sourceNode, setSourceNode] = useState<string | null>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState<number>(0);
  const [edgeIdCounter, setEdgeIdCounter] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const createNode = (x: number, y: number, label?: string, cy?: any) => {
    const nextId = nodeIdCounter + 1;
    setNodeIdCounter(nextId);
    const id = `n${nextId}`;
    const nodeLabel = label || `Node ${nextId}`;
    
    const cyInstance = cy || window.cy;
    if (cyInstance) {
      try {
        // Ensure we have valid coordinates
        const validX = isNaN(x) ? 100 : x; 
        const validY = isNaN(y) ? 100 : y;
        
        // Add the node to the graph
        cyInstance.add({
          group: 'nodes',
          data: { 
            id, 
            label: nodeLabel,
            description: `Node ${nextId}`
          },
          position: { x: validX, y: validY }
        });
        
        // Update state
        setNodeCount(cyInstance.nodes().length);
        setStatusMessage(`Node ${nodeLabel} created`);
        
        // Make sure the node is visible if it was created near the edge
        setTimeout(() => {
          const newNode = cyInstance.getElementById(id);
          if (newNode && !newNode.inside()) {
            cyInstance.fit(newNode, 50);
          }
        }, 50);
      } catch (error) {
        console.error("Error creating node:", error);
        setStatusMessage(`Error creating node: ${error}`);
      }
    } else {
      console.error("Cytoscape instance not available");
      setStatusMessage("Error: Graph not initialized");
    }
    
    return id;
  };

  const createEdge = (sourceId: string, targetId: string, weight: number = 1, cy?: any) => {
    const nextId = edgeIdCounter + 1;
    setEdgeIdCounter(nextId);
    const id = `e${nextId}`;
    
    const cyInstance = cy || window.cy;
    if (cyInstance) {
      // Check if edge already exists
      const existingEdge = cyInstance.edges(`[source="${sourceId}"][target="${targetId}"]`);
      if (existingEdge.length > 0) {
        setStatusMessage('Edge already exists');
        return null;
      }
      
      cyInstance.add({
        group: 'edges',
        data: {
          id,
          source: sourceId,
          target: targetId,
          weight: weight
        }
      });
      
      setEdgeCount(cyInstance.edges().length);
      setStatusMessage(`Edge created with weight ${weight}`);
    }
    
    return id;
  };

  const resetGraph = () => {
    if (window.cy) {
      window.cy.elements().remove();
      setNodeIdCounter(0);
      setEdgeIdCounter(0);
      setSourceNode(null);
      setNodeCount(0);
      setEdgeCount(0);
      setStatusMessage('Graph reset');
    }
  };

  return (
    <GraphContext.Provider
      value={{
        title,
        setTitle,
        statusMessage,
        setStatusMessage,
        nodeCount,
        setNodeCount,
        edgeCount,
        setEdgeCount,
        nodeEditId,
        setNodeEditId,
        edgeEditId,
        setEdgeEditId,
        sourceNode,
        setSourceNode,
        nodeIdCounter,
        setNodeIdCounter,
        edgeIdCounter,
        setEdgeIdCounter,
        showHelp,
        setShowHelp,
        resetGraph,
        createNode,
        createEdge,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};
