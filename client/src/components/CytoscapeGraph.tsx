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
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [isDirected, setIsDirected] = useState(false);
  const [hasWeight, setHasWeight] = useState(true);

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
                // Add a new edge (undirected by default)
                const newEdge = cy.add({
                  group: 'edges',
                  data: { 
                    id: edgeId, 
                    source: sourceNode, 
                    target: node.id(),
                    weight: 1,
                    label: ''  // Initialize with empty label
                  }
                }).style({
                  'target-arrow-shape': 'none'  // No arrow by default (undirected)
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
            
            // Check if the edge has a weight
            const weight = edge.data('weight');
            const isWeightless = weight === null || weight === undefined;
            
            setEdgeWeight(isWeightless ? 1 : weight);
            setHasWeight(!isWeightless);
            setEdgeLabel(edge.data('label') || '');
            
            // Check if the edge has an arrow (is directed)
            setIsDirected(edge.style('target-arrow-shape') !== 'none');
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
  }, [setStatusMessage, setNodeCount, setEdgeCount, sourceNode, setSourceNode, setCurrentEdge, setEdgeWeight, setEdgeLabel, setIsDirected, setEditEdgeOpen, setHasWeight]);

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
        // Remove arrow for undirected graph by default
        'target-arrow-shape': 'none',
        'target-arrow-color': '#64748B',
        'arrow-scale': 1.5,
        'curve-style': 'straight',
        'label': (ele: any) => {
          // Display based on label and weight availability
          const label = ele.data('label');
          const weight = ele.data('weight');
          
          // If the edge has no weight (weightless)
          if (weight === null || weight === undefined) {
            return label && label.length > 0 ? label : '';
          }
          
          // If the edge has both label and weight
          if (label && label.length > 0) {
            return `${label} (${weight})`;
          }
          
          // If the edge has only weight
          return weight;
        },
        'font-size': isMobile ? '14px' : '12px',
        'text-outline-width': '0px',
        'text-background-opacity': 0,
        'text-rotation': 'none',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#1a202c' // Darker text color
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

  // Handle edge update
  const updateEdge = () => {
    if (currentEdge && cyRef.current) {
      // Update edge data based on whether it has weight or not
      currentEdge.data('weight', hasWeight ? edgeWeight : null);
      currentEdge.data('label', edgeLabel);
      
      // Update edge style based on directed status
      if (isDirected) {
        currentEdge.style({
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#64748B'
        });
      } else {
        currentEdge.style({
          'target-arrow-shape': 'none'
        });
      }
      
      setEditEdgeOpen(false);
      
      // Show appropriate status message
      if (hasWeight) {
        setStatusMessage(`Edge updated with weight ${edgeWeight}`);
      } else {
        setStatusMessage(`Edge updated as weightless`);
      }
    }
  };
  
  // Handle reversing the edge direction
  const reverseEdge = () => {
    if (currentEdge && cyRef.current) {
      const sourceId = currentEdge.data('source');
      const targetId = currentEdge.data('target');
      
      // Store the edge properties
      const edgeId = currentEdge.id();
      const label = currentEdge.data('label');
      const weight = currentEdge.data('weight');
      
      // Remove the old edge
      currentEdge.remove();
      
      // Create a new edge with reversed direction
      const newEdge = cyRef.current.add({
        group: 'edges',
        data: {
          id: edgeId,
          source: targetId,
          target: sourceId,
          weight: weight,
          label: label
        }
      });
      
      // Apply the same styling
      if (isDirected) {
        newEdge.style({
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#64748B'
        });
      }
      
      setCurrentEdge(newEdge);
      
      // Update the dialog's from/to fields by forcing a re-render
      const fromLabel = cyRef.current.getElementById(targetId).data('label');
      const toLabel = cyRef.current.getElementById(sourceId).data('label');
      setStatusMessage(`Edge direction reversed: now ${fromLabel} → ${toLabel}`);
    }
  };

  // Handle edge deletion from dialog
  const deleteEdge = () => {
    if (currentEdge && cyRef.current) {
      const sourceLabel = cyRef.current.getElementById(currentEdge.data('source')).data('label');
      const targetLabel = cyRef.current.getElementById(currentEdge.data('target')).data('label');
      
      currentEdge.remove();
      setEditEdgeOpen(false);
      setEdgeCount(cyRef.current.edges().length);
      setStatusMessage(`Edge between ${sourceLabel} and ${targetLabel} deleted`);
    }
  };

  return (
    <>
      <CytoscapeComponent
        elements={[]}
        style={{ width: '100%', height: '100%' }}
        stylesheet={cytoscapeStyle}
        layout={{ name: 'preset' }}
        cy={(cy) => { cyRef.current = cy; }}
        // Use default wheel sensitivity to avoid warnings
      />

      {/* Edge Edit Dialog */}
      <Dialog open={editEdgeOpen} onOpenChange={setEditEdgeOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 bg-white rounded-md overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-semibold">Edit Edge</DialogTitle>
            </DialogHeader>
            
            {currentEdge && (
              <div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">From</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-base"
                    value={currentEdge ? cyRef.current?.getElementById(currentEdge.data('source')).data('label') : ''}
                    disabled 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">To</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-base"
                    value={currentEdge ? cyRef.current?.getElementById(currentEdge.data('target')).data('label') : ''}
                    disabled 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">Label</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md text-base"
                    value={edgeLabel} 
                    onChange={(e) => setEdgeLabel(e.target.value)} 
                    placeholder="Optional edge label"
                    autoFocus
                  />
                </div>
                
                <div className="mb-4 flex items-center py-1">
                  <input 
                    type="checkbox" 
                    id="weightless-toggle"
                    className="mr-3 h-5 w-5 accent-blue-600" 
                    checked={!hasWeight}
                    onChange={(e) => setHasWeight(!e.target.checked)}
                  />
                  <label htmlFor="weightless-toggle" className="text-base font-medium text-gray-700">
                    Weightless Edge (no number)
                  </label>
                </div>
                
                <div className={`mb-4 ${!hasWeight ? 'opacity-50' : ''}`}>
                  <label className="block text-base font-medium text-gray-700 mb-2">Weight</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-300 rounded-md text-base"
                    value={edgeWeight} 
                    onChange={(e) => setEdgeWeight(Number(e.target.value))} 
                    min={1}
                    disabled={!hasWeight}
                  />
                </div>
                
                <div className="mb-4 flex items-center py-1">
                  <input 
                    type="checkbox" 
                    id="directed-toggle"
                    className="mr-3 h-5 w-5 accent-blue-600" 
                    checked={isDirected}
                    onChange={(e) => setIsDirected(e.target.checked)}
                  />
                  <label htmlFor="directed-toggle" className="text-base font-medium text-gray-700">
                    Directed Edge (show arrow)
                  </label>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    className="w-full py-3 px-2 border border-orange-400 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 flex items-center justify-center"
                    onClick={() => {
                      reverseEdge();
                      // Keep the dialog open to show the change
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Reverse Edge Direction
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row w-full mt-6 sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            {/* Stack buttons vertically on mobile, horizontally on larger screens */}
            <button 
              className="w-full py-5 px-4 bg-red-500 text-white border-b md:border-b-0 md:border-r hover:bg-red-600 transition-colors font-medium text-base"
              onClick={deleteEdge}
            >
              Delete
            </button>
            
            <button 
              className="w-full py-5 px-4 bg-gray-100 text-gray-700 border-b md:border-b-0 md:border-r hover:bg-gray-200 transition-colors font-medium text-base"
              onClick={() => setEditEdgeOpen(false)}
            >
              Cancel
            </button>
            
            <button 
              className="w-full py-5 px-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-base"
              onClick={updateEdge}
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}