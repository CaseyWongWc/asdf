import { useEffect, useRef, useContext } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { GraphContext } from "@/contexts/GraphContext";
import ZoomControls from "./ZoomControls";
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
      
      // Event: Tap on canvas
      cy.on('tap', function(event) {
        if (sourceNode) {
          // Deselect source node if clicking empty space
          cy.getElementById(sourceNode).removeClass('source-node');
          setSourceNode(null);
          setStatusMessage('Source node deselected');
          return;
        }
        
        // If clicking on empty space, create a new node
        if (event.target === cy) {
          const position = event.position;
          createNode(position.x, position.y, undefined, cy);
        }
      });

      // Event: Tap on node
      cy.on('tap', 'node', function(event) {
        const node = event.target;
        
        if (sourceNode) {
          // Create edge if source node was previously selected
          if (sourceNode !== node.id()) {
            createEdge(sourceNode, node.id(), 1, cy);
            cy.getElementById(sourceNode).removeClass('source-node');
            setSourceNode(null);
          } else {
            // Clicked on same node, deselect it
            node.removeClass('source-node');
            setSourceNode(null);
            setStatusMessage('Source node deselected');
          }
        } else {
          // Select as source node
          node.addClass('source-node');
          setSourceNode(node.id());
          setStatusMessage(`Selected "${node.data('label')}" as source node`);
        }
      });

      // Event: Right-click on node or edge (desktop)
      cy.on('cxttap', 'node, edge', function(event) {
        const ele = event.target;
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

      // Event: Tap on node for editing
      cy.on('tap', 'node', function(event) {
        // Don't open edit modal if we're creating an edge
        if (sourceNode && sourceNode !== event.target.id()) return;
        
        // Open edit modal
        setNodeEditId(event.target.id());
      });

      // Event: Tap on edge for editing
      cy.on('tap', 'edge', function(event) {
        setEdgeEditId(event.target.id());
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
      <ZoomControls cyRef={cyRef} />
    </main>
  );
}
