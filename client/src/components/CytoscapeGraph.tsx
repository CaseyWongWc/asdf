import React, { useEffect, useRef, useContext, useState } from 'react';
import { GraphContext } from '../contexts/GraphContext';
import CytoscapeComponent from 'react-cytoscapejs';
import { useIsMobile } from '../hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function CytoscapeGraph() {
  const cyRef = useRef<any>(null);
  const { 
    setStatusMessage, 
    setNodeCount, 
    setEdgeCount, 
    sourceNode, 
    setSourceNode 
  } = useContext(GraphContext);
  const isMobile = useIsMobile();
  
  // Edge edit dialog state
  const [editEdgeOpen, setEditEdgeOpen] = useState(false);
  const [currentEdge, setCurrentEdge] = useState<any>(null);
  const [edgeWeight, setEdgeWeight] = useState(1);

  useEffect(() => {
    if (cyRef.current) {
      // Store reference to the Cytoscape instance
      const cy = cyRef.current;
      window.cy = cy; // For debugging
      
      // Add a default node on initialization
      setTimeout(() => {
        console.log('Adding initial Cytoscape nodes');
        
        // Add nodes positioned across the canvas, using timestamp to ensure unique IDs
        const timestamp1 = Date.now();
        cy.add({
          group: 'nodes',
          data: { id: `n${timestamp1}`, label: 'Node 1' },
          position: { x: 100, y: 100 }
        });
        
        const timestamp2 = Date.now() + 1; // Add 1 ms to ensure uniqueness
        cy.add({
          group: 'nodes',
          data: { id: `n${timestamp2}`, label: 'Node 2' },
          position: { x: 250, y: 100 }
        });
        
        const timestamp3 = Date.now() + 2; // Add 2 ms to ensure uniqueness
        cy.add({
          group: 'nodes',
          data: { id: `n${timestamp3}`, label: 'Node 3' },
          position: { x: 175, y: 200 }
        });
        
        // Update node count in context
        setNodeCount(cy.nodes().length);

        // Background click event for adding new nodes
        cy.on('tap', function(event: any) {
          // Only handle clicks on the background (not on nodes/edges)
          if (event.target === cy) {
            console.log('Background tap in Cytoscape detected', event.position);
            
            if (sourceNode) {
              // Deselect source node if one is selected
              cy.getElementById(sourceNode).removeClass('source-node');
              setSourceNode(null);
              setStatusMessage('Source node deselected');
              return;
            }
            
            // Get the position where the user clicked
            const pos = event.position;
            
            // Create a new node
            const nodeId = `n${Date.now()}`;
            const nodeLabel = `Node ${cy.nodes().length + 1}`;
            
            cy.add({
              group: 'nodes',
              data: { id: nodeId, label: nodeLabel },
              position: { x: pos.x, y: pos.y }
            });
            
            setNodeCount(cy.nodes().length);
            setStatusMessage(`Created ${nodeLabel}`);
          }
        });
        
        // Node click events for edge creation
        cy.on('tap', 'node', function(event: any) {
          const node = event.target;
          console.log('Node tap in Cytoscape detected', node.id());
          
          if (sourceNode) {
            // Create an edge if a source node was already selected
            if (sourceNode !== node.id()) {
              const edgeId = `e${Date.now()}`;
              
              // Check if an edge already exists between these nodes (in either direction)
              const existingEdge = cy.edges().filter(
                (edge: any) => (
                  (edge.data('source') === sourceNode && edge.data('target') === node.id()) ||
                  (edge.data('source') === node.id() && edge.data('target') === sourceNode)
                )
              );
              
              if (existingEdge.length > 0) {
                setStatusMessage('Edge already exists between these nodes');
              } else {
                // Add an undirected edge (visually)
                cy.add({
                  group: 'edges',
                  data: { 
                    id: edgeId, 
                    source: sourceNode, 
                    target: node.id(),
                    weight: 1 
                  }
                });
                
                setEdgeCount(cy.edges().length);
                setStatusMessage(`Created edge with weight 1`);
              }
              
              // Deselect the source node
              cy.getElementById(sourceNode).removeClass('source-node');
              setSourceNode(null);
            } else {
              // Clicked on the same node, deselect it
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
        
        // Edge click to edit
        cy.on('tap', 'edge', function(event: any) {
          const edge = event.target;
          // Only handle edge taps if no source node is selected
          if (!sourceNode) {
            setCurrentEdge(edge);
            setEdgeWeight(edge.data('weight') || 1);
            setEditEdgeOpen(true);
          }
        });
        
        // Right-click to delete
        cy.on('cxttap', 'node, edge', function(event: any) {
          const ele = event.target;
          const type = ele.isNode() ? 'Node' : 'Edge';
          const label = ele.isNode() 
            ? ele.data('label') 
            : `edge from ${cy.getElementById(ele.data('source')).data('label')} to ${cy.getElementById(ele.data('target')).data('label')}`;
          
          // If this is the source node, deselect it
          if (sourceNode && sourceNode === ele.id()) {
            setSourceNode(null);
          }
          
          // Remove the element
          ele.remove();
          
          // Update counts
          setNodeCount(cy.nodes().length);
          setEdgeCount(cy.edges().length);
          setStatusMessage(`${type} ${label} deleted`);
        });
      }, 500);
      
      // Cleanup function
      return () => {
        cy.removeAllListeners(); // Remove all registered event listeners
      };
    }
  }, [setStatusMessage, setNodeCount, setEdgeCount, sourceNode, setSourceNode]);

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
        // Remove arrow for undirected graph
        'target-arrow-shape': 'none',
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
      selector: '.source-node',
      style: {
        'border-width': '2px',
        'border-color': '#059669'
      }
    }
  ];

  return (
    <CytoscapeComponent
      elements={[]}
      style={{ width: '100%', height: '100%' }}
      stylesheet={cytoscapeStyle}
      layout={{ name: 'preset' }}
      cy={(cy) => { cyRef.current = cy; }}
      // Use default wheel sensitivity to avoid warnings
    />
  );
}