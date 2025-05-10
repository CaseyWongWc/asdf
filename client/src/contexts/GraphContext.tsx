import { createContext, useState, ReactNode, useEffect } from "react";

// Extend the Window interface to include our cytoscape instance
declare global {
  interface Window {
    cy: any; // Cytoscape instance
  }
}

export type GraphMode = 'editor' | 'algorithm' | 'draw' | 'edit' | 'delete';
export type EdgeStyle = 'curved' | 'straight';

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
  edgeStyle: EdgeStyle;
  setEdgeStyle: (style: EdgeStyle) => void;
  checkForModeSwitch: (title: string) => void;
  checkParity: () => boolean;
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
  edgeStyle: 'curved',
  setEdgeStyle: () => {},
  checkForModeSwitch: () => {},
  checkParity: () => false,
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
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>('curved');

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
      // Check if we already have 2 edges in this direction
      const existingEdges = cyInstance.edges(`[source="${sourceId}"][target="${targetId}"]`);
      if (existingEdges.length >= 2) {
        setStatusMessage('Two edges already exist for these two same nodes');
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

  // Check if all nodes in the graph have an even number of edges
  const checkParity = (): boolean => {
    if (!window.cy) {
      setStatusMessage('Graph not initialized');
      return false;
    }

    const cy = window.cy;

    // Map to store the degree (number of edges) for each node
    const nodeDegrees: Record<string, number> = {};

    // Initialize all nodes with 0 edges
    cy.nodes().forEach((node: any) => {
      nodeDegrees[node.id()] = 0;
    });

    // Count edges for each node
    cy.edges().forEach((edge: any) => {
      const sourceId = edge.data('source');
      const targetId = edge.data('target');

      // Increment edge count for source node
      nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1;

      // If it's not a self-loop, increment target node too
      if (sourceId !== targetId) {
        nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1;
      }
    });

    // Check if all nodes have an even number of edges (even parity)
    let allEven = true;
    let oddNodes: string[] = [];

    Object.entries(nodeDegrees).forEach(([nodeId, degree]) => {
      if (degree % 2 !== 0) {
        allEven = false;
        oddNodes.push(nodeId);
      }
    });

    if (allEven) {
      setStatusMessage('✓ All nodes have even parity (even number of edges)');
    } else {
      // Get node labels for better reporting
      const oddNodeLabels = oddNodes.map(id => {
        const node = cy.getElementById(id);
        return node ? node.data('label') : id;
      });

      setStatusMessage(`Odd parity: ${oddNodeLabels.join(', ')} have an odd number of edges`);
    }

    return allEven;
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
        edgeStyle,
        setEdgeStyle,
        checkForModeSwitch,
        checkParity,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};
