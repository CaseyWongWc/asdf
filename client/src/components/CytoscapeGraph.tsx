import React, { useEffect, useRef, useContext, useState } from 'react';
import { GraphContext } from '../contexts/GraphContext';
import CytoscapeComponent from 'react-cytoscapejs';
import { useIsMobile } from '../hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import NodeStyleModal from "./NodeStyleModal";

// Define edge display style type for toggle
type EdgeDisplayStyle = 'curved' | 'straight';

export default function CytoscapeGraph() {
  const cyRef = useRef<any>(null);
  const { 
    setStatusMessage, 
    setNodeCount, 
    setEdgeCount, 
    sourceNode, 
    setSourceNode,
    mode 
  } = useContext(GraphContext);
  const isMobile = useIsMobile();
  
  // State for edge display style toggle
  const [edgeDisplayStyle, setEdgeDisplayStyle] = useState<EdgeDisplayStyle>('curved');
  
  // Edge edit dialog state
  const [editEdgeOpen, setEditEdgeOpen] = useState(false);
  const [currentEdge, setCurrentEdge] = useState<any>(null);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeDescription, setEdgeDescription] = useState('');
  const [descriptionPosition, setDescriptionPosition] = useState<'above' | 'below'>('above');
  const [isDirected, setIsDirected] = useState(false);
  const [hasWeight, setHasWeight] = useState(true);
  const [edgeStyle, setEdgeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [edgeCurve, setEdgeCurve] = useState<'straight' | 'bezier'>('bezier'); 
  const [edgeCurvature, setEdgeCurvature] = useState<number>(40); // Control point step size
  
  // Node style dialog state
  const [nodeStyleOpen, setNodeStyleOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Setup Cytoscape instance and initial nodes
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
        setEdgeCount(cy.edges().length);
      }, 500);
      
      // Cleanup function
      return () => {
        cy.removeAllListeners(); // Remove all registered event listeners
      };
    }
  }, [setStatusMessage, setNodeCount, setEdgeCount]);
  
  // Setup mode-specific event handlers
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      
      // Remove any existing event handlers
      cy.removeAllListeners();
      
      console.log(`Setting up ${mode} mode event handlers`);
      
      if (mode === 'editor') {
        // EDITOR MODE HANDLERS
        
        // Background click handler for node creation
        cy.on('tap', function(event: any) {
          if (event.target === cy) {
            if (sourceNode) {
              // Deselect source node if one is selected
              cy.getElementById(sourceNode).removeClass('source-node');
              setSourceNode(null);
              setStatusMessage('Source node deselected');
              return;
            }
            
            // Create new node at click position
            const pos = event.position;
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
        
        // Track the last click for double-click detection
        let lastClickTime = 0;
        let lastClickNodeId: string | null = null;
        const doubleClickDelay = 300; // milliseconds
        
        // Combined single/double click handler for node actions
        cy.on('tap', 'node', function(event: any) {
          const node = event.target;
          const nodeId = node.id();
          const clickTime = new Date().getTime();
          
          // Debug - log the click
          console.log(`Node clicked: ${nodeId}, source node: ${sourceNode}`);
          
          // Check if this is a double-click on the same node
          if (lastClickNodeId === nodeId && clickTime - lastClickTime < doubleClickDelay) {
            // Handle as double-click - open styling modal
            console.log(`Double-click detected on node ${nodeId}`);
            setSelectedNodeId(nodeId);
            setNodeStyleOpen(true);
            setStatusMessage(`Editing style for "${node.data('label')}"`);
            
            // If this was a source node, deselect it to avoid creating an edge
            if (sourceNode === nodeId) {
              node.removeClass('source-node');
              setSourceNode(null);
            }
            
            // Reset click tracking
            lastClickTime = 0;
            lastClickNodeId = null;
            return;
          }
          
          // Update click tracking for future double-click detection
          lastClickTime = clickTime;
          lastClickNodeId = nodeId;
          
          // Continue with regular node click handling for edge creation or node selection
          if (sourceNode) {
            // We already have a source node selected, so create an edge
            const sourceNodeElement = cy.getElementById(sourceNode);
            if (!sourceNodeElement) {
              console.error(`Source node ${sourceNode} not found`);
              setSourceNode(null);
              return;
            }
            
            const edgeId = `e${Date.now()}`;
            const isSelfLoop = sourceNode === nodeId;
            
            if (isSelfLoop) {
              // Creating a self-loop
              console.log(`Creating self-loop on node ${nodeId}`);
              
              // Check if we already have the max number of allowed self-loops
              const existingSelfLoops = cy.edges().filter(
                (edge: any) => (
                  edge.data('source') === sourceNode && edge.data('target') === sourceNode
                )
              );
              
              if (existingSelfLoops.length >= 2) {
                setStatusMessage('Two self-loops already exist on this node');
                sourceNodeElement.removeClass('source-node');
                setSourceNode(null);
                return;
              }
              
              // Create a self-loop with JFLAP-like styling
              const selfLoopEdge = cy.add({
                group: 'edges',
                data: { 
                  id: edgeId, 
                  source: sourceNode, 
                  target: sourceNode,
                  weight: 1,
                  label: '',
                  description: '',
                  descriptionPosition: 'above',
                  curveStyle: 'bezier',
                  curvature: 80,
                  targetArrow: 'none',
                  // Special properties for self-loops
                  loopDirection: '-45deg', // JFLAP-like loop start angle
                  loopSweep: '315deg',     // JFLAP-like loop arc size
                }
              });
              
              // Apply styles to the self-loop edge
              selfLoopEdge.style({
                'target-arrow-shape': 'none',
                'line-style': 'solid',
                'curve-style': 'bezier',
                'control-point-step-size': 80,
                'control-point-distance': 120, // Higher distance for more pronounced curve
                'control-point-weight': 0.7,   // Weight for curve position
              });
              
              console.log(`Self-loop created, new edge count: ${cy.edges().length}`);
              setEdgeCount(cy.edges().length);
              setStatusMessage(`Created self-loop with weight 1`);
            } else {
              // Creating an edge between two different nodes
              console.log(`Creating edge from ${sourceNode} to ${nodeId}`);
              
              // Check if we should limit the number of edges between the same nodes
              const existingEdges = cy.edges().filter(
                (edge: any) => (
                  edge.data('source') === sourceNode && edge.data('target') === nodeId
                )
              );
              
              if (existingEdges.length >= 2) {
                console.log('Two edges already exist for these two same nodes');
                setStatusMessage('Two edges already exist for these two same nodes');
              } else {
                // Add a new edge with directed style
                try {
                  // First, check if there's already an edge in this direction
                  const existingEdgeInDirection = cy.edges().filter(
                    (edge: any) => (
                      edge.data('source') === sourceNode && edge.data('target') === nodeId
                    )
                  );
                  
                  // Check if there's an edge in the opposite direction
                  const existingEdgeInOppositeDirection = cy.edges().filter(
                    (edge: any) => (
                      edge.data('source') === nodeId && edge.data('target') === sourceNode
                    )
                  );
                  
                  // Detect if we're creating a bidirectional relationship
                  const isCreatingBidirectional = existingEdgeInOppositeDirection.length > 0;
                  
                  // Use the selected edge display style
                  const curveStyle = edgeDisplayStyle === 'curved' ? 'unbundled-bezier' : 'straight';
                  
                  // Create stronger gravity effect for parallel edges if using curved style
                  // First edge has control points above, second below
                  const controlDistance = existingEdgeInDirection.length === 0 ? -80 : 80;
                  
                  // If we're creating a bidirectional relationship, update the existing edge in the opposite direction
                  if (isCreatingBidirectional) {
                    console.log('Creating bidirectional relationship');
                    
                    // Mark the existing edge as part of a bidirectional relationship
                    const oppositeEdge = existingEdgeInOppositeDirection[0];
                    oppositeEdge.data('isBidirectional', true);
                    
                    // Always make bidirectional edges curved with distinct style
                    // The first edge curves in one direction (outward)
                    oppositeEdge.style({
                      'curve-style': 'unbundled-bezier',
                      'control-point-distances': 80, // Curve outward
                      'control-point-weights': 0.5,
                      'target-arrow-color': '#3182CE', // Blue to indicate bidirectional
                      'line-color': '#3182CE'
                    });
                  }
                  
                  // Also mark the new edge as bidirectional if applicable
                  const isBidirectional = isCreatingBidirectional;
                  
                  const newEdge = cy.add({
                    group: 'edges',
                    data: { 
                      id: edgeId, 
                      source: sourceNode, 
                      target: nodeId,
                      weight: 1,
                      label: '',
                      description: '',
                      descriptionPosition: 'above',
                      curveStyle: curveStyle,
                      curvature: 40,
                      targetArrow: 'triangle',
                      // Store this info for parallel edge detection
                      parallelIndex: existingEdgeInDirection.length,
                      // Mark if this is part of a bidirectional pair
                      isBidirectional: isBidirectional
                    }
                  });
                  
                  // Apply styles to the new edge - with visual differentiation for multiple edges
                  const lineStyle = existingEdgeInDirection.length === 0 ? 'solid' : 'dashed';
                  
                  // Add a special indicator for multiple edges
                  const edgeNumber = existingEdgeInDirection.length + 1;
                  const multiEdgeLabel = edgeNumber > 1 ? `(${edgeNumber})` : '';
                  
                  newEdge.data('multiEdgeLabel', multiEdgeLabel);
                  newEdge.data('edgeNumber', edgeNumber);
                  
                  // Set up styling for the new edge
                  const styleObj: any = {
                    'target-arrow-shape': 'triangle',
                    'line-style': lineStyle,
                    'curve-style': curveStyle
                  };
                  
                  // Style bidirectional edges differently - always curved
                  if (isBidirectional) {
                    styleObj['target-arrow-color'] = '#3182CE'; // Blue arrows
                    styleObj['line-color'] = '#3182CE'; // Blue lines
                    styleObj['curve-style'] = 'unbundled-bezier'; // Force curved for bidirectional
                    styleObj['control-point-distances'] = -80; // Curve in opposite direction
                    styleObj['control-point-weights'] = 0.5;
                    
                    // If using a status message, indicate this is bidirectional
                    setStatusMessage(`Created bidirectional edge relationship`);
                  } else {
                    styleObj['target-arrow-color'] = '#64748B'; // Default gray
                    styleObj['line-color'] = '#64748B';
                    
                    // Only add control points if using curved style and not bidirectional
                    if (curveStyle === 'unbundled-bezier') {
                      styleObj['control-point-distances'] = controlDistance;
                      styleObj['control-point-weights'] = 0.5;
                    }
                    
                    setStatusMessage(`Created directed edge with weight 1`);
                  }
                  
                  newEdge.style(styleObj);
                  
                  console.log(`Edge created successfully, new edge count: ${cy.edges().length}`);
                  setEdgeCount(cy.edges().length);
                } catch (error) {
                  console.error('Error creating edge:', error);
                  setStatusMessage('Error creating edge');
                }
              }
            }
            
            // Deselect the source node in all cases
            sourceNodeElement.removeClass('source-node');
            setSourceNode(null);
          } else {
            // No source node selected yet, so select this node as the source
            console.log(`Selecting node ${nodeId} as source`);
            node.addClass('source-node');
            setSourceNode(nodeId);
            setStatusMessage(`Selected "${node.data('label')}" as source node`);
          }
        });
        
        // Edge click handler for edge editing
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
            
            // Get the description and position if they exist
            setEdgeDescription(edge.data('description') || '');
            setDescriptionPosition(edge.data('descriptionPosition') || 'above');
            
            // Check if the edge has an arrow (is directed)
            setIsDirected(edge.style('target-arrow-shape') !== 'none');
            
            // Determine the edge style
            const lineStyle = edge.style('line-style') || 'solid';
            setEdgeStyle(lineStyle as 'solid' | 'dashed' | 'dotted');
            
            // Get curve style and curvature
            const curveStyle = edge.style('curve-style') || 'bezier';
            setEdgeCurve(curveStyle as 'straight' | 'bezier');
            setEdgeCurvature(parseInt(edge.style('control-point-step-size') || '40', 10));
            
            setEditEdgeOpen(true);
          }
        });
        
        // Right-click handler for element editing
        cy.on('cxttap', 'node, edge', function(event: any) {
          const ele = event.target;
          
          if (ele.isNode()) {
            // Open node style dialog for nodes
            setSelectedNodeId(ele.id());
            setNodeStyleOpen(true);
            setStatusMessage(`Editing style for "${ele.data('label')}"`);
            
            // If this was the source node, deselect it
            if (sourceNode && sourceNode === ele.id()) {
              ele.removeClass('source-node');
              setSourceNode(null);
            }
          } else {
            // Open edge edit dialog for edges
            setCurrentEdge(ele);
            
            // Check if the edge has a weight
            const weight = ele.data('weight');
            const isWeightless = weight === null || weight === undefined;
            
            setEdgeWeight(isWeightless ? 1 : weight);
            setHasWeight(!isWeightless);
            setEdgeLabel(ele.data('label') || '');
            
            // Get the description and position if they exist
            setEdgeDescription(ele.data('description') || '');
            setDescriptionPosition(ele.data('descriptionPosition') || 'above');
            
            // Check if the edge has an arrow (is directed)
            setIsDirected(ele.style('target-arrow-shape') !== 'none');
            
            // Determine the edge style
            const lineStyle = ele.style('line-style') || 'solid';
            setEdgeStyle(lineStyle as 'solid' | 'dashed' | 'dotted');
            
            // Get curve style and curvature
            const curveStyle = ele.style('curve-style') || 'bezier';
            setEdgeCurve(curveStyle as 'straight' | 'bezier');
            setEdgeCurvature(parseInt(ele.style('control-point-step-size') || '40', 10));
            
            setEditEdgeOpen(true);
            setStatusMessage(`Editing edge properties`);
          }
        });
      } else {
        // ALGORITHM MODE HANDLERS
        
        // Node click handler for algorithm visualization 
        cy.on('tap', 'node', function(event: any) {
          const node = event.target;
          setStatusMessage(`Selected node "${node.data('label')}" for algorithm`);
          
          // We could set this as a start/end node for algorithms
          if (!sourceNode) {
            node.addClass('algorithm-start-node');
            setSourceNode(node.id());
          } else if (sourceNode !== node.id()) {
            // Could be used to select an end node for path algorithms
            cy.getElementById(sourceNode).removeClass('algorithm-start-node');
            setSourceNode(node.id());
            node.addClass('algorithm-start-node');
          } else {
            // Deselect if clicking the same node
            node.removeClass('algorithm-start-node');
            setSourceNode(null);
          }
        });
        
        // Edge click handler (simple selection for algorithm)
        cy.on('tap', 'edge', function(event: any) {
          const edge = event.target;
          const source = cy.getElementById(edge.data('source')).data('label');
          const target = cy.getElementById(edge.data('target')).data('label');
          const weight = edge.data('weight') || '';
          
          setStatusMessage(`Selected edge from ${source} to ${target}${weight ? ' with weight ' + weight : ''}`);
        });
      }
    }
  }, [mode, sourceNode, setSourceNode, setNodeCount, setEdgeCount, setStatusMessage, 
      setCurrentEdge, setEdgeWeight, setEdgeLabel, setEdgeDescription, setDescriptionPosition, 
      setIsDirected, setEditEdgeOpen, setHasWeight, setEdgeStyle, setEdgeCurve, setEdgeCurvature,
      setNodeStyleOpen, setSelectedNodeId, edgeDisplayStyle]);

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
    // Basic edge style
    {
      selector: 'edge',
      style: {
        'width': isMobile ? 3 : 2,
        'line-color': '#64748B',
        'target-arrow-shape': 'none',
        'target-arrow-color': '#64748B',
        'arrow-scale': 1.5,
        'curve-style': 'unbundled-bezier',
        'control-point-distances': 50,
        'control-point-weights': 0.5
      }
    },
    // Style for parallel edges between same nodes (first edge)
    {
      selector: 'edge[source][target]',
      style: {
        'curve-style': function(ele: any) {
          // Don't apply to self-loops
          if (ele.data('source') === ele.data('target')) {
            return 'bezier';
          }
          
          // Count how many edges there are between these two nodes
          const cy = ele.cy();
          const source = ele.data('source');
          const target = ele.data('target');
          
          const parallelEdges = cy.edges().filter((e: any) => 
            (e.data('source') === source && e.data('target') === target) ||
            (e.data('source') === target && e.data('target') === source)
          );
          
          // For all normal edges use unbundled-bezier to allow more control
          return parallelEdges.length > 1 ? 'unbundled-bezier' : 'unbundled-bezier';
        },
        'control-point-distances': function(ele: any) {
          if (ele.data('source') === ele.data('target')) {
            return 120; // Self-loops get special treatment
          }
          
          const cy = ele.cy();
          const source = ele.data('source');
          const target = ele.data('target');
          
          // Get all edges between these nodes
          const edgesBetween = cy.edges().filter((e: any) => 
            (e.data('source') === source && e.data('target') === target) ||
            (e.data('source') === target && e.data('target') === source)
          );
          
          // Get index of current edge
          const index = edgesBetween.indexOf(ele);
          
          // Apply stronger gravity effect based on index
          return index === 0 ? -100 : 100; // First edge above, second edge below with more pronounced curve
        },
        'control-point-weights': 0.5
      }
    },
    // Edge label style
    {
      selector: 'edge',
      style: {
        'font-size': isMobile ? '14px' : '12px',
        'color': '#1a202c',
        'text-rotation': 'none',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-outline-width': '1px',
        'text-outline-color': 'white',
        'text-background-opacity': 0.7,
        'text-background-color': '#ffffff',
        'text-background-padding': 2
      }
    },
    // Edge with weight and label style
    {
      selector: 'edge[weight]',
      style: {
        'label': (ele: any) => {
          const label = ele.data('label');
          const weight = ele.data('weight');
          const multiEdgeLabel = ele.data('multiEdgeLabel') || '';
          
          if (label && label.length > 0) {
            return `${label} (${weight}) ${multiEdgeLabel}`;
          }
          
          return `${weight}${multiEdgeLabel}`;
        },
        'text-background-opacity': 1,
        'text-background-color': '#ffffff',
        'text-background-padding': 3
      }
    },
    // Style for second edge to make it visually distinct
    {
      selector: 'edge[edgeNumber = 2]',
      style: {
        'line-style': 'dashed',
        'line-dash-pattern': [6, 3],
        'line-color': '#805AD5' // Purple to distinguish from first edge
      }
    },
    // Special style for bidirectional edges - always curved regardless of toggle setting
    {
      selector: 'edge[isBidirectional]',
      style: {
        'line-color': '#3182CE', // Blue for bidirectional
        'target-arrow-color': '#3182CE', // Blue arrows
        'width': isMobile ? 3 : 2.5, // Slightly thicker
        'arrow-scale': 1.7, // Slightly larger arrows
        'curve-style': 'unbundled-bezier', // Force curved for bidirectional
        // Special selector to determine curve direction for bidirectional relationships
        'control-point-distances': function(ele: any) {
          const cy = ele.cy();
          const source = ele.data('source');
          const target = ele.data('target');
          
          // Find all edges between these two nodes
          const edgesBetween = cy.edges().filter((e: any) => 
            (e.data('source') === source && e.data('target') === target) ||
            (e.data('source') === target && e.data('target') === source)
          );
          
          // Get index of current edge to determine curve direction
          // First edge curves in one direction, second edge curves in the opposite
          const index = edgesBetween.indexOf(ele);
          
          // If it's the first edge of the pair, curve outward (positive)
          // If it's the second edge of the pair, curve inward (negative)
          const direction = (ele.data('source') === source && ele.data('target') === target) ? 80 : -80;
          
          return direction;
        },
        'control-point-weights': 0.5
      }
    },
    // Edge with label but no weight style
    {
      selector: 'edge[!weight][label]',
      style: {
        'label': 'data(label)'
      }
    },
    // Edge with description for directed edges - only show at source node
    {
      selector: 'edge[description][targetArrow="triangle"]',
      style: {
        'source-label': 'data(description)',
        'source-text-offset': 15,
        'source-text-margin-y': -10
      }
    },
    // Edge with description for undirected edges - show at both source and target nodes
    {
      selector: 'edge[description][targetArrow="none"]',
      style: {
        'source-label': 'data(description)',
        'source-text-offset': 15,
        'source-text-margin-y': -10,
        'target-label': 'data(description)',
        'target-text-offset': 15,
        'target-text-margin-y': 10
      }
    },
    // Source node style
    {
      selector: '.source-node',
      style: {
        'border-width': '2px',
        'border-color': '#059669'
      }
    },
    // Algorithm start node style
    {
      selector: '.algorithm-start-node',
      style: {
        'border-width': '3px',
        'border-color': '#E53E3E',
        'background-color': '#FC8181'
      }
    },
    // Self-loop edge style - This implements JFLAP-like self-loops
    {
      selector: 'edge',
      style: {
        'curve-style': function(ele: any) {
          // If the source and target are the same, it's a self-loop
          return ele.data('source') === ele.data('target') ? 'bezier' : ele.style('curve-style');
        },
        'control-point-step-size': function(ele: any) {
          // Use a larger control point for self-loops to make them more visible
          return ele.data('source') === ele.data('target') ? 80 : ele.style('control-point-step-size');
        },
        'control-point-distance': function(ele: any) {
          // Only apply to self-loops, gives more pronounced curve like JFLAP
          return ele.data('source') === ele.data('target') ? 120 : 0;
        },
        'control-point-weight': function(ele: any) {
          // Only apply to self-loops, gives more pronounced curve like JFLAP
          return ele.data('source') === ele.data('target') ? 0.7 : 0.5;
        },
        'loop-direction': function(ele: any) {
          // Apply JFLAP-inspired loop direction
          if (ele.data('source') === ele.data('target')) {
            // Allow custom loop direction as stored in data (or default to -45)
            return ele.data('loopDirection') || '-45deg';
          }
          return '0deg';
        },
        'loop-sweep': function(ele: any) {
          // Apply JFLAP-inspired loop sweep
          if (ele.data('source') === ele.data('target')) {
            // Allow custom loop sweep as stored in data (or default to 315)
            return ele.data('loopSweep') || '315deg';
          }
          return '0deg';
        }
      }
    }
  ];

  // Handle edge update
  const updateEdge = () => {
    if (currentEdge && cyRef.current) {
      // Update edge data based on whether it has weight or not
      currentEdge.data('weight', hasWeight ? edgeWeight : null);
      currentEdge.data('label', edgeLabel);
      
      // Save the description and its position
      currentEdge.data('description', edgeDescription);
      currentEdge.data('descriptionPosition', descriptionPosition);
      
      // Create style object with line style, curve, and direction
      const styleObj: any = {
        'line-style': edgeStyle,
        'curve-style': edgeCurve,
        'control-point-step-size': edgeCurvature
      };
      
      // Add arrow if the edge is directed
      if (isDirected) {
        styleObj['target-arrow-shape'] = 'triangle';
        styleObj['target-arrow-color'] = '#64748B';
        currentEdge.data('targetArrow', 'triangle');
      } else {
        styleObj['target-arrow-shape'] = 'none';
        currentEdge.data('targetArrow', 'none');
      }
      
      // Save curvature data for persistence
      currentEdge.data('curveStyle', edgeCurve);
      currentEdge.data('curvature', edgeCurvature);
      
      // Apply all styles at once
      currentEdge.style(styleObj);
      
      // Close the dialog
      setEditEdgeOpen(false);
      
      // Update status message based on whether the edge has a weight or not
      if (hasWeight) {
        setStatusMessage(`Updated edge with weight ${edgeWeight}`);
      } else {
        setStatusMessage('Updated edge without weight');
      }
    }
  };

  // Handle reversing the edge direction
  const reverseEdge = () => {
    if (currentEdge && cyRef.current) {
      const sourceId = currentEdge.data('source');
      const targetId = currentEdge.data('target');
      
      // Only reverse if it's not a self-loop
      if (sourceId !== targetId) {
        // Store current edge data
        const edgeData = {
          ...currentEdge.data(),
          source: targetId,
          target: sourceId
        };
        
        // Remove the current edge
        currentEdge.remove();
        
        // Add a new edge with reversed direction
        const newEdge = cyRef.current.add({
          group: 'edges',
          data: edgeData
        });
        
        // Apply the same styles to the new edge
        newEdge.style({
          'line-style': edgeStyle,
          'curve-style': edgeCurve,
          'control-point-step-size': edgeCurvature,
          'target-arrow-shape': isDirected ? 'triangle' : 'none',
          'target-arrow-color': '#64748B'
        });
        
        // Update edge reference
        setCurrentEdge(newEdge);
        
        setStatusMessage('Reversed edge direction');
      } else {
        setStatusMessage('Cannot reverse a self-loop');
      }
    }
  };

  // Handle edge deletion
  const deleteEdge = () => {
    if (currentEdge && cyRef.current) {
      cyRef.current.remove(currentEdge);
      setCurrentEdge(null);
      setEditEdgeOpen(false);
      setEdgeCount(cyRef.current.edges().length);
      setStatusMessage('Edge deleted');
    }
  };

  return (
    <div className="w-full h-full relative">
      <CytoscapeComponent
        cy={(cy) => { cyRef.current = cy; }}
        elements={[]} // Start with empty elements, we'll add them programmatically
        style={{ width: '100%', height: '100%' }}
        stylesheet={cytoscapeStyle}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        boxSelectionEnabled={false}
        wheelSensitivity={0.2} // Reduce wheel sensitivity
        minZoom={0.1} // Allow zooming out far
        maxZoom={2} // Limit how far in users can zoom
        autoungrabify={false} // Allow nodes to be moved
        layout={{ name: 'preset' }} // Use preset layout to respect node positions
      />
      
      {/* Edge Style Toggle Control */}
      {mode === 'editor' && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-10 flex items-center gap-2 border border-gray-200">
          <span className="text-sm font-medium whitespace-nowrap">Edge Style:</span>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={edgeDisplayStyle === 'curved' ? 'default' : 'outline'}
              onClick={() => {
                setEdgeDisplayStyle('curved');
                setStatusMessage('Using curved edges with gravity effect');
                
                // Apply to existing edges
                if (cyRef.current) {
                  cyRef.current.edges().forEach((edge: any) => {
                    if (edge.data('source') === edge.data('target')) {
                      // Don't change self-loops
                      return;
                    }
                    
                    // Don't change bidirectional edges - they have their special styling
                    if (edge.data('isBidirectional') === true) {
                      return;
                    }
                    
                    // Get any existing parallel edges
                    const parallelEdges = cyRef.current.edges().filter((e: any) => 
                      (e.data('source') === edge.data('source') && e.data('target') === edge.data('target')) ||
                      (e.data('source') === edge.data('target') && e.data('target') === edge.data('source'))
                    );
                    
                    // Apply different control points based on edge number
                    const edgeNumber = edge.data('edgeNumber') || 1;
                    const controlDistance = edgeNumber === 1 ? -80 : 80;
                    
                    edge.style({
                      'curve-style': 'unbundled-bezier',
                      'control-point-distances': controlDistance,
                      'control-point-weights': 0.5
                    });
                  });
                }
              }}
            >
              Curved
            </Button>
            <Button 
              size="sm" 
              variant={edgeDisplayStyle === 'straight' ? 'default' : 'outline'}
              onClick={() => {
                setEdgeDisplayStyle('straight');
                setStatusMessage('Using straight edges (except for bidirectional edges)');
                
                // Apply to existing edges
                if (cyRef.current) {
                  cyRef.current.edges().forEach((edge: any) => {
                    // Don't change bidirectional edges - they should always be curved
                    if (edge.data('isBidirectional') === true) {
                      return;
                    }
                    
                    // Don't change self-loops
                    if (edge.data('source') === edge.data('target')) {
                      return;
                    }
                    
                    edge.style({
                      'curve-style': 'straight'
                    });
                  });
                }
              }}
            >
              Straight
            </Button>
          </div>
        </div>
      )}

      {/* Edge Edit Dialog */}
      <Dialog open={editEdgeOpen} onOpenChange={setEditEdgeOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-lg overflow-hidden">
          <DialogHeader className="p-4 md:p-6 border-b">
            <DialogTitle className="text-xl font-semibold">Edit Edge</DialogTitle>
          </DialogHeader>
          
          <div className="p-4 md:p-6 space-y-4">
            {/* Weight controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium">Edge Weight</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWeight}
                    onChange={(e) => setHasWeight(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-sm font-medium">
                    {hasWeight ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              
              {hasWeight && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 mr-2">Value:</span>
                  <input
                    type="number"
                    value={edgeWeight}
                    onChange={(e) => setEdgeWeight(Number(e.target.value))}
                    min={1}
                    step={1}
                    className="w-20 px-2 py-1 border rounded-md"
                  />
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[edgeWeight]}
                    onValueChange={(value) => setEdgeWeight(value[0])}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
            
            {/* Label */}
            <div className="space-y-2">
              <label className="text-base font-medium">Edge Label</label>
              <input
                type="text"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                placeholder="e.g., 'goto', 'then', etc."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Edge Description */}
            <div className="space-y-2">
              <label className="text-base font-medium">Description</label>
              <input
                type="text"
                value={edgeDescription}
                onChange={(e) => setEdgeDescription(e.target.value)}
                placeholder="e.g., 'if x > 0', 'when event occurs'"
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex items-center pt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="descriptionPosition"
                    value="above"
                    checked={descriptionPosition === 'above'}
                    onChange={() => setDescriptionPosition('above')}
                  />
                  <span className="ml-2">Above</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="descriptionPosition"
                    value="below"
                    checked={descriptionPosition === 'below'}
                    onChange={() => setDescriptionPosition('below')}
                  />
                  <span className="ml-2">Below</span>
                </label>
              </div>
            </div>
            
            {/* Edge Direction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium">Direction</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDirected}
                    onChange={(e) => setIsDirected(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-sm font-medium">
                    {isDirected ? 'Directed' : 'Undirected'}
                  </span>
                </label>
              </div>
              
              {isDirected && currentEdge && currentEdge.data('source') !== currentEdge.data('target') && (
                <button
                  onClick={reverseEdge}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Reverse Direction
                </button>
              )}
            </div>
            
            {/* Edge Style */}
            <div className="space-y-2">
              <label className="text-base font-medium">Line Style</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEdgeStyle('solid')}
                  className={`px-3 py-2 rounded-md border ${
                    edgeStyle === 'solid' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setEdgeStyle('dashed')}
                  className={`px-3 py-2 rounded-md border ${
                    edgeStyle === 'dashed' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Dashed
                </button>
                <button
                  onClick={() => setEdgeStyle('dotted')}
                  className={`px-3 py-2 rounded-md border ${
                    edgeStyle === 'dotted' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  Dotted
                </button>
              </div>
            </div>
            
            {/* Edge Curve */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium">Edge Shape</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEdgeCurve('straight')}
                    className={`px-3 py-1 rounded-md border ${
                      edgeCurve === 'straight' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    Straight
                  </button>
                  <button
                    onClick={() => setEdgeCurve('bezier')}
                    className={`px-3 py-1 rounded-md border ${
                      edgeCurve === 'bezier' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    Curved
                  </button>
                </div>
              </div>
              
              {edgeCurve === 'bezier' && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Curvature: {edgeCurvature}</span>
                  </div>
                  <Slider
                    min={20}
                    max={150}
                    step={10}
                    value={[edgeCurvature]}
                    onValueChange={(value) => setEdgeCurvature(value[0])}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="p-4 md:p-6 bg-gray-50 flex justify-between">
            <div>
              <Button variant="destructive" onClick={deleteEdge}>
                Delete Edge
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setEditEdgeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateEdge}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Node Style Modal */}
      <NodeStyleModal 
        open={nodeStyleOpen} 
        onOpenChange={setNodeStyleOpen}
        nodeId={selectedNodeId}
      />
    </div>
  );
}