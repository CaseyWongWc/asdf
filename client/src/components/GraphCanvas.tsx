import { useEffect, useRef, useContext } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { GraphContext } from "@/contexts/GraphContext";
import ZoomControls from "./ZoomControls";
import EditingToolbar from "./EditingToolbar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function GraphCanvas() {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const isMobile = useIsMobile();
  const { 
    setNodeCount, 
    setEdgeCount, 
    nodeEditId,
    setNodeEditId,
    edgeEditId,
    setEdgeEditId,
    sourceNode,
    setSourceNode,
    setStatusMessage,
    nodeIdCounter,
    setNodeIdCounter,
    edgeIdCounter,
    setEdgeIdCounter,
    createNode,
    createEdge,
  } = useContext(GraphContext);

  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      
      // Update counters initially
      setNodeCount(cy.nodes().length);
      setEdgeCount(cy.edges().length);

      // Create initial sample nodes
      if (cy.nodes().length === 0) {
        createNode(100, 100, "Node 1", cy);
        createNode(200, 200, "Node 2", cy);
        createEdge("n1", "n2", 5, cy);
        cy.fit();
      }
      
      // Configure mobile-specific options
      if (isMobile) {
        cy.userZoomingEnabled(false); // Disable mousewheel/pinch zoom
        // Optimize touch handling
        cy.autoungrabify(false); // Allow nodes to be dragged
        cy.autounselectify(false); // Allow elements to be selected by touch
      }

      // Helper function to handle long press on elements (for mobile context menu)
      let pressTimer: number | null = null;
      let pressedElement: any = null;
      
      const handleTouchStart = (event: any) => {
        const target = event.target;
        if (target === cy) return; // Ignore if tapping on background
        
        pressedElement = target;
        pressTimer = window.setTimeout(() => {
          // This is a long press - simulate right-click operation
          if (pressedElement) {
            const ele = pressedElement;
            const type = ele.isNode() ? 'Node' : 'Edge';
            const label = ele.isNode() 
              ? ele.data('label') 
              : `from ${cy.getElementById(ele.data('source')).data('label')} to ${cy.getElementById(ele.data('target')).data('label')}`;
            
            if (sourceNode && sourceNode === ele.id()) {
              setSourceNode(null);
            }
            
            ele.remove();
            setNodeCount(cy.nodes().length);
            setEdgeCount(cy.edges().length);
            setStatusMessage(`${type} ${label} deleted`);
            
            pressedElement = null;
          }
        }, 750); // 750ms for long press
      };
      
      const handleTouchEnd = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        pressedElement = null;
      };
      
      // Add a default node on initialization just to make sure we have something on screen
      setTimeout(() => {
        console.log('Adding default node');
        createNode(300, 200, "Node 1", cy);
        
        // Add a second node to show the layout
        createNode(400, 200, "Node 2", cy);
      }, 500);

      // We'll try the cytoscape tap event which is more reliable than click
      cy.on('tap', function(event) {
        const currentMode = cy.data('editingMode') || 'draw';
        console.log('Canvas tap event, mode:', currentMode, event.target === cy);
        
        // Only handle taps on the background (not on nodes/edges)
        if (event.target === cy) {
          console.log('Background tap detected', event.position);
          
          // Draw mode - create new nodes on canvas click
          if (currentMode === 'draw') {
            // If a source node is selected (edge drawing in progress), cancel it
            if (sourceNode) {
              cy.getElementById(sourceNode).removeClass('source-node');
              setSourceNode(null);
              setStatusMessage('Edge drawing cancelled');
              return;
            }
            
            // Hard-code a position if we don't get one from the event
            const pos = event.position || { x: 100, y: 100 };
            console.log('Using position for new node:', pos);
            
            // Add a node at this position with a simple label
            const newLabel = `Node ${nodeIdCounter + 1}`;
            const newNodeId = createNode(pos.x, pos.y, newLabel, cy);
            console.log('Created node with ID:', newNodeId);
            
            setStatusMessage(`Created ${newLabel}`);
          } 
          else if (currentMode === 'edit') {
            // In edit mode, clicking empty space does nothing special
            setStatusMessage('Click on a node or edge to edit its properties');
          }
          else if (currentMode === 'delete') {
            // In delete mode, clicking empty space does nothing special
            setStatusMessage('Click on a node or edge to delete it');
          }
        }
      });

      // Event: Tap on node
      cy.on('tap', 'node', function(event) {
        const node = event.target;
        const currentMode = cy.data('editingMode') || 'draw';
        
        if (currentMode === 'draw') {
          if (sourceNode) {
            // Create edge if source node was previously selected
            if (sourceNode !== node.id()) {
              // Store source node label before we clear the source node reference
              const sourceNodeLabel = cy.getElementById(sourceNode).data('label');
              createEdge(sourceNode, node.id(), 1, cy);
              cy.getElementById(sourceNode).removeClass('source-node');
              setSourceNode(null);
              setStatusMessage(`Created edge from "${sourceNodeLabel}" to "${node.data('label')}"`);
            } else {
              // Clicked on same node, deselect it
              node.removeClass('source-node');
              setSourceNode(null);
              setStatusMessage('Source node deselected');
            }
          } else {
            // Select as source node for edge creation
            node.addClass('source-node');
            setSourceNode(node.id());
            setStatusMessage(`Selected "${node.data('label')}" as source node - click another node to create an edge`);
          }
        } 
        else if (currentMode === 'edit') {
          // In edit mode, open the node edit modal
          setNodeEditId(node.id());
          setStatusMessage(`Editing node "${node.data('label')}"`);
        }
        else if (currentMode === 'delete') {
          // In delete mode, remove the node
          const nodeLabel = node.data('label');
          
          // If this is a source node in edge creation mode, clear that first
          if (sourceNode && sourceNode === node.id()) {
            setSourceNode(null);
          }
          
          // Remove the node (this will also remove connected edges)
          node.remove();
          setNodeCount(cy.nodes().length);
          setEdgeCount(cy.edges().length);
          setStatusMessage(`Deleted node "${nodeLabel}" and its connections`);
        }
      });

      // Event: Right-click on node or edge (desktop) - this is a backup for desktop users
      cy.on('cxttap', 'node, edge', function(event) {
        const ele = event.target;
        const currentMode = cy.data('editingMode') || 'draw';
        
        // For right-click, we'll always offer delete functionality regardless of mode
        // This gives desktop users a quick way to delete elements
        const type = ele.isNode() ? 'Node' : 'Edge';
        const label = ele.isNode() 
          ? ele.data('label') 
          : `from ${cy.getElementById(ele.data('source')).data('label')} to ${cy.getElementById(ele.data('target')).data('label')}`;
        
        if (sourceNode && sourceNode === ele.id()) {
          setSourceNode(null);
        }
        
        ele.remove();
        setNodeCount(cy.nodes().length);
        setEdgeCount(cy.edges().length);
        setStatusMessage(`${type} ${label} deleted`);
      });

      // Event: Tap on edge
      cy.on('tap', 'edge', function(event) {
        const edge = event.target;
        const currentMode = cy.data('editingMode') || 'draw';
        const sourceLabel = cy.getElementById(edge.data('source')).data('label');
        const targetLabel = cy.getElementById(edge.data('target')).data('label');
        
        if (currentMode === 'draw') {
          // In draw mode, edge clicks just select the edge
          setStatusMessage(`Selected edge from "${sourceLabel}" to "${targetLabel}"`);
        }
        else if (currentMode === 'edit') {
          // In edit mode, open the edge edit modal
          setEdgeEditId(edge.id());
          setStatusMessage(`Editing edge from "${sourceLabel}" to "${targetLabel}"`);
        }
        else if (currentMode === 'delete') {
          // In delete mode, remove the edge
          edge.remove();
          setEdgeCount(cy.edges().length);
          setStatusMessage(`Deleted edge from "${sourceLabel}" to "${targetLabel}"`);
        }
      });
      
      // Register touch handlers for mobile
      if (isMobile) {
        cy.on('touchstart', 'node, edge', handleTouchStart);
        cy.on('touchend', handleTouchEnd);
      }
      
      // Cleanup function
      return () => {
        cy.removeListener('touchstart', 'node, edge', handleTouchStart);
        cy.removeListener('touchend', handleTouchEnd);
        if (pressTimer) {
          clearTimeout(pressTimer);
        }
      };
    }
  }, [isMobile]);

  const cytoscapeStyle: any[] = [
    {
      selector: 'node',
      style: {
        'background-color': '#4299E1',
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': 'white',
        'font-size': isMobile ? '14px' : '12px',
        'width': isMobile ? '50px' : '40px',
        'height': isMobile ? '50px' : '40px',
        'text-outline-width': '1px',
        'text-outline-color': '#4299E1'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': isMobile ? 3 : 2,
        'line-color': '#64748B',
        'target-arrow-color': '#64748B',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(weight)',
        'font-size': isMobile ? '14px' : '10px',
        'text-outline-width': '2px',
        'text-outline-color': 'white',
        'text-background-opacity': 1,
        'text-background-color': 'white',
        'text-background-padding': isMobile ? '4px' : '2px',
        'text-background-shape': 'roundrectangle'
      }
    },
    {
      selector: '.selected',
      style: {
        'background-color': '#2563EB',
        'border-width': '2px',
        'border-color': '#1E40AF'
      }
    },
    {
      selector: '.source-node',
      style: {
        'border-width': '2px',
        'border-color': '#059669'
      }
    }
  ];

  const layout = {
    name: 'grid',
    rows: 1
  };

  return (
    <main className="flex-1 relative overflow-hidden">
      <CytoscapeComponent
        elements={[]}
        style={{ width: '100%', height: '100%' }}
        stylesheet={cytoscapeStyle}
        layout={layout}
        cy={(cy) => {
          cyRef.current = cy;
        }}
        wheelSensitivity={0.3}
      />
      <EditingToolbar />
      <ZoomControls cyRef={cyRef} />
    </main>
  );
}
