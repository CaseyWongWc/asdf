import { createContext, useState, ReactNode, useEffect } from "react";

// Extend the Window interface to include our cytoscape instance
declare global {
  interface Window {
    cy: any; // Cytoscape instance
  }
}

export type GraphMode = 'editor' | 'algorithm';

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
  mode: GraphMode;
  setMode: (mode: GraphMode) => void;
  checkForModeSwitch: (title: string) => void;
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
  mode: 'editor',
  setMode: () => {},
  checkForModeSwitch: () => {},
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
  const [mode, setMode] = useState<GraphMode>('editor');

  const createNode = (x: number, y: number, label?: string, cy?: any) => {
    try {
      // Increment counter
      const nextId = nodeIdCounter + 1;
      setNodeIdCounter(nextId);
      
      // Generate IDs and labels
      const id = `n${nextId}`;
      const nodeLabel = label || `Node ${nextId}`;
      
      // Get Cytoscape instance
      const cyInstance = cy || window.cy;
      if (!cyInstance) {
        console.error("No Cytoscape instance available");
        setStatusMessage("Error: Graph not initialized");
        return id;
      }
    
      // Simple validation
      const validX = isNaN(x) ? 100 : x; 
      const validY = isNaN(y) ? 100 : y;
    
      // Create the new element data
      const newNode = {
        group: 'nodes',
        data: { 
          id, 
          label: nodeLabel,
          description: `Node ${nextId}`
        },
        position: { x: validX, y: validY }
      };
    
      // Explicitly add to the graph
      cyInstance.add(newNode);
      console.log(`Added node ${id} at (${validX}, ${validY})`, newNode);
    
      // Force a render update
      cyInstance.forceRender();
      
      // Update state
      setNodeCount(cyInstance.nodes().length);
      setStatusMessage(`Node ${nodeLabel} created`);
      
      return id;
    } catch (error) {
      console.error("Error creating node:", error);
      setStatusMessage(`Error creating node: ${error}`);
      return `error_${Date.now()}`;
    }
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
  
  // Function to check for the special title that triggers mode switch
  const checkForModeSwitch = (newTitle: string) => {
    if (newTitle.toUpperCase() === "THIS IS NOT A DRILL") {
      setMode('algorithm');
      setStatusMessage('✓ Switched to Algorithm Visualization Mode');
    } else if (mode === 'algorithm' && newTitle.toUpperCase() !== "THIS IS NOT A DRILL") {
      setMode('editor');
      setStatusMessage('✓ Switched to Graph Editor Mode');
    }
  };

  // Use the effect hook to check for title changes
  useEffect(() => {
    checkForModeSwitch(title);
  }, [title]);

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
        mode,
        setMode,
        checkForModeSwitch,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};
