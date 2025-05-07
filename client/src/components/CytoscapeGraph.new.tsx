import React, { useEffect, useRef, useContext, useState } from "react";
import { GraphContext } from "../contexts/GraphContext";
import CytoscapeComponent from "react-cytoscapejs";
import { useIsMobile } from "../hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import NodeStyleModal from "./NodeStyleModal.new";

// Define edge display style type for toggle
type EdgeDisplayStyle = "curved" | "straight";

export default function CytoscapeGraph() {
  const cyRef = useRef<any>(null);
  const {
    setStatusMessage,
    setNodeCount,
    setEdgeCount,
    sourceNode,
    setSourceNode,
    mode,
  } = useContext(GraphContext);
  const isMobile = useIsMobile();

  // State for edge display style toggle
  const [edgeDisplayStyle, setEdgeDisplayStyle] =
    useState<EdgeDisplayStyle>("curved");

  // Edge edit dialog state
  const [editEdgeOpen, setEditEdgeOpen] = useState(false);
  const [currentEdge, setCurrentEdge] = useState<any>(null);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeDescription, setEdgeDescription] = useState("");
  const [descriptionPosition, setDescriptionPosition] = useState<
    "above" | "below"
  >("above");
  const [isDirected, setIsDirected] = useState(false);
  const [hasWeight, setHasWeight] = useState(true);
  const [edgeStyle, setEdgeStyle] = useState<"solid" | "dashed" | "dotted">(
    "solid",
  );
  const [edgeCurve, setEdgeCurve] = useState<"straight" | "bezier">("bezier");
  const [edgeCurvature, setEdgeCurvature] = useState<number>(40); // Control point step size
  const [edgeColor, setEdgeColor] = useState<string>("#64748B"); // Default gray color

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
        console.log("Adding initial Cytoscape nodes");

        // Calculate center position of viewport
        const center = {
          x: cy.width() / 2,
          y: cy.height() / 2
        };
        
        // Add nodes in a triangle formation around the center
        // This creates a more balanced initial layout
        const nodeRadius = Math.min(cy.width(), cy.height()) * 0.15; // 15% of smallest dimension
        
        // Calculate positions in a triangle around center
        const positions = [
          { x: center.x - nodeRadius, y: center.y - nodeRadius/1.5 },
          { x: center.x + nodeRadius, y: center.y - nodeRadius/1.5 },
          { x: center.x, y: center.y + nodeRadius }
        ];
        
        // Create nodes with timestamp-based IDs to avoid collisions
        for (let i = 0; i < 3; i++) {
          const timestamp = Date.now() + i; // Add index to ensure uniqueness
          
          // Create example nodes with simple naming
          let nodeData = { 
            id: `n${timestamp}`, 
            label: i === 0 ? 'NODE1' : `Node ${i+1}`
          };
          
          const node = {
            group: "nodes",
            data: nodeData,
            position: positions[i]
          };
          
          // Add nodes with animations
          cy.add(node)
            .style('opacity', 0)
            .animate({
              style: { 'opacity': 1 },
              duration: 300,
              easing: 'ease-in-out'
            });
        }

        // Update node count in context
        setNodeCount(cy.nodes().length);
        setEdgeCount(cy.edges().length);
        
        // Center the view on the new nodes
        cy.fit(cy.nodes(), 50); // 50px padding
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

      if (mode === "editor") {
        // EDITOR MODE HANDLERS

        // Background click handler for node creation
        cy.on("tap", function (event: any) {
          if (event.target === cy) {
            if (sourceNode) {
              // Deselect source node if one is selected
              cy.getElementById(sourceNode).removeClass("source-node");
              setSourceNode(null);
              setStatusMessage("Source node deselected");
              return;
            }

            // Create new node at click position with improved ID generation
            const pos = event.position;
            
            // Use the node count plus a timestamp suffix for better uniqueness
            // This prevents collisions if nodes are created/deleted rapidly
            const existingCount = cy.nodes().length;
            const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp for uniqueness
            const nodeId = `n${existingCount+1}_${timestamp}`;
            const nodeLabel = `Node ${existingCount + 1}`;
            
            // First add the node with 0 opacity
            const newNode = cy.add({
              group: "nodes",
              data: { 
                id: nodeId, 
                label: nodeLabel
              },
              position: { x: pos.x, y: pos.y },
              style: { 'opacity': 0 } // Start invisible for animation
            });
            
            // Then animate it in with a gentle fade
            cy.getElementById(nodeId)
              .animate({
                style: { 'opacity': 1 },
                duration: 300,
                easing: 'ease-in-out'
              });
            
            // Apply a subtle "pop" animation
            cy.getElementById(nodeId)
              .animate({
                style: { 'height': isMobile ? 55 : 45, 'width': isMobile ? 55 : 45 },
                duration: 100
              })
              .delay(100)
              .animate({
                style: { 'height': isMobile ? 50 : 40, 'width': isMobile ? 50 : 40 },
                duration: 100
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
        cy.on("tap", "node", function (event: any) {
          const node = event.target;
          const nodeId = node.id();
          const clickTime = new Date().getTime();

          // Debug - log the click
          console.log(`Node clicked: ${nodeId}, source node: ${sourceNode}`);

          // Check if this is a double-click on the same node
          if (
            lastClickNodeId === nodeId &&
            clickTime - lastClickTime < doubleClickDelay
          ) {
            // Handle as double-click - open styling modal
            console.log(`Double-click detected on node ${nodeId}`);
            setSelectedNodeId(nodeId);
            setNodeStyleOpen(true);
            setStatusMessage(`Editing style for "${node.data("label")}"`);

            // If this was a source node, deselect it to avoid creating an edge
            if (sourceNode === nodeId) {
              node.removeClass("source-node");
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

              // Check if we already have a self-loop
              const existingSelfLoops = cy
                .edges()
                .filter(
                  (edge: any) =>
                    edge.data("source") === sourceNode &&
                    edge.data("target") === sourceNode,
                );

              if (existingSelfLoops.length >= 1) {
                setStatusMessage("A self-loop already exists on this node");
                sourceNodeElement.removeClass("source-node");
                setSourceNode(null);
                return;
              }

              // Create a self-loop with JFLAP-like styling
              const selfLoopEdge = cy.add({
                group: "edges",
                data: {
                  id: edgeId,
                  source: sourceNode,
                  target: sourceNode,
                  weight: 1,
                  label: "",
                  description: "",
                  descriptionPosition: "above",
                  targetArrow: "triangle",
                },
              });

              console.log(
                `Self-loop created, new edge count: ${cy.edges().length}`,
              );
              setEdgeCount(cy.edges().length);
              setStatusMessage(`Created self-loop with weight 1`);
            } else {
              // Creating an edge between two different nodes
              console.log(`Creating edge from ${sourceNode} to ${nodeId}`);

              // Check if an edge already exists between these nodes
              const existingEdges = cy
                .edges()
                .filter(
                  (edge: any) =>
                    edge.data("source") === sourceNode &&
                    edge.data("target") === nodeId,
                );

              if (existingEdges.length >= 1) {
                console.log(
                  "An edge already exists between these nodes in this direction",
                );
                setStatusMessage(
                  "An edge already exists between these nodes in this direction",
                );
              } else {
                // Add a new edge with directed style
                try {
                  // Check if there's already an edge in the opposite direction
                  const oppositeEdge = cy
                    .edges()
                    .filter(
                      (edge: any) =>
                        edge.data("source") === nodeId &&
                        edge.data("target") === sourceNode,
                    );

                  // Create a basic edge
                  const newEdge = cy.add({
                    group: "edges",
                    data: {
                      id: edgeId,
                      source: sourceNode,
                      target: nodeId,
                      weight: 1,
                      label: "",
                      description: "",
                      descriptionPosition: "above",
                      targetArrow: "triangle"
                    },
                  });

                  console.log(
                    `Edge created, new edge count: ${cy.edges().length}`,
                  );
                  setEdgeCount(cy.edges().length);
                  setStatusMessage(`Created edge with weight 1`);
                } catch (error) {
                  console.error("Error creating edge:", error);
                  setStatusMessage("Error creating edge");
                }
              }
            }

            // Clear source node selection after edge creation
            sourceNodeElement.removeClass("source-node");
            setSourceNode(null);
          } else {
            // No source node selected, so mark this as the source
            console.log(`Selecting node ${nodeId} as source`);
            node.addClass("source-node");
            setSourceNode(nodeId);
            setStatusMessage(`Selected "${node.data("label")}" as source node`);
          }
        });

        // Edge tap handler for editing
        cy.on("tap", "edge", function (event: any) {
          const edge = event.target;
          console.log("Edge clicked", edge.id());

          // Set currentEdge and edge-specific state variables
          setCurrentEdge(edge);

          // Populate state with current edge data for the edit form
          setEdgeWeight(edge.data("weight") || 1);
          setEdgeLabel(edge.data("label") || "");
          setEdgeDescription(edge.data("description") || "");
          setDescriptionPosition(edge.data("descriptionPosition") || "above");
          setIsDirected(edge.data("targetArrow") === "triangle");
          setHasWeight(edge.data("weight") !== null && edge.data("weight") !== undefined);
          
          // Extract edge styling
          const lineStyle = edge.style("line-style") || "solid";
          setEdgeStyle(lineStyle as "solid" | "dashed" | "dotted");
          
          const curveStyle = edge.style("curve-style") || "bezier";
          setEdgeCurve(curveStyle as "straight" | "bezier");
          
          const curvature = parseInt(edge.style("control-point-step-size") || "40");
          setEdgeCurvature(curvature);
          
          setEdgeColor(edge.style("line-color") || "#64748B");

          // Show edit dialog
          setEditEdgeOpen(true);
          setStatusMessage(`Editing edge ${edge.id()}`);
        });
      } else if (mode === "algorithm") {
        // ALGORITHM MODE HANDLERS - simplified for now, will be expanded

        // Clicking a node in algorithm mode
        cy.on("tap", "node", function (event: any) {
          const node = event.target;
          // In algorithm mode, clicking a node selects it as start node
          cy.nodes().removeClass("algorithm-start-node");
          node.addClass("algorithm-start-node");
          setStatusMessage(`Selected "${node.data("label")}" as algorithm start node`);
        });
      }
    }
  }, [sourceNode, setSourceNode, mode, isMobile, setStatusMessage, setNodeCount, setEdgeCount]);

  // Create stylesheet
  const cytoscapeStyle = [
    // Base node style
    {
      selector: "node",
      style: {
        "label": "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "color": "white",
        "font-weight": "bold",
        "font-size": isMobile ? "14px" : "12px",
        "background-color": "#4299E1", // Blue node
        "text-background-color": "#3182CE", // Slightly darker blue for the band
        "text-background-opacity": 1,
        "text-background-shape": "rectangle",
        "text-background-padding": 2,
        "text-margin-y": 0,
        "width": isMobile ? "50px" : "40px",
        "height": isMobile ? "50px" : "40px",
        "border-width": "2px",
        "border-color": "#2B6CB0",
        "shape": "ellipse",
      },
    },
    
    // Basic edge style
    {
      selector: "edge",
      style: {
        width: isMobile ? 3 : 2,
        "line-color": "#64748B",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#64748B",
        "arrow-scale": 1.5,
        "curve-style": "unbundled-bezier",
        "control-point-distances": 50,
        "control-point-weights": 0.5,
        "target-endpoint": "outside-to-node",
        "source-endpoint": "outside-to-node",
      },
    },
    
    // Self-loop edge style
    {
      selector: "edge",
      style: {
        "curve-style": function(ele: any) {
          return ele.data("source") === ele.data("target") ? "bezier" : ele.style("curve-style");
        },
        "control-point-step-size": function(ele: any) {
          return ele.data("source") === ele.data("target") ? 80 : ele.style("control-point-step-size");
        },
        "loop-direction": function(ele: any) {
          return ele.data("source") === ele.data("target") ? "-45deg" : "0deg";
        },
        "loop-sweep": function(ele: any) {
          return ele.data("source") === ele.data("target") ? "315deg" : "0deg";
        },
      },
    },
    
    // Edge with weight style
    {
      selector: "edge[weight]",
      style: {
        "label": function(ele: any) {
          const label = ele.data("label");
          const weight = ele.data("weight");
          
          if (label && label.length > 0) {
            return `${label} (${weight})`;
          }
          
          return `${weight}`;
        },
        "text-background-opacity": 1,
        "text-background-color": "#ffffff",
        "text-background-padding": 3,
      },
    },
    
    // Source node style
    {
      selector: ".source-node",
      style: {
        "border-width": "2px",
        "border-color": "#059669",
      },
    },
    
    // Algorithm start node style
    {
      selector: ".algorithm-start-node",
      style: {
        "border-width": "3px",
        "border-color": "#E53E3E",
        "background-color": "#FC8181",
      },
    },
  ];

  // Handle edge update
  const updateEdge = () => {
    if (currentEdge && cyRef.current) {
      // Update edge data
      currentEdge.data("weight", hasWeight ? edgeWeight : null);
      currentEdge.data("label", edgeLabel);
      currentEdge.data("description", edgeDescription);
      currentEdge.data("descriptionPosition", descriptionPosition);

      // Create style object
      const styleObj: any = {
        "line-style": edgeStyle,
        "curve-style": edgeCurve,
        "control-point-step-size": edgeCurvature,
        "line-color": edgeColor,
        "target-arrow-color": edgeColor,
      };

      // Add arrow if the edge is directed
      if (isDirected) {
        styleObj["target-arrow-shape"] = "triangle";
        currentEdge.data("targetArrow", "triangle");
      } else {
        styleObj["target-arrow-shape"] = "none";
        currentEdge.data("targetArrow", "none");
      }

      // Apply styles
      currentEdge.style(styleObj);

      // Close the dialog
      setEditEdgeOpen(false);
      setStatusMessage(hasWeight ? `Updated edge with weight ${edgeWeight}` : "Updated edge without weight");
    }
  };

  // Handle edge deletion
  const deleteEdge = () => {
    if (currentEdge && cyRef.current) {
      cyRef.current.remove(currentEdge);
      setCurrentEdge(null);
      setEditEdgeOpen(false);
      setEdgeCount(cyRef.current.edges().length);
      setStatusMessage("Edge deleted");
    }
  };

  return (
    <div className="w-full h-full relative">
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
        }}
        elements={[]} // Start with empty elements, we'll add them programmatically
        style={{ width: "100%", height: "100%" }}
        stylesheet={cytoscapeStyle}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        boxSelectionEnabled={false}
        wheelSensitivity={0.2} // Reduce wheel sensitivity
        minZoom={0.1} // Allow zooming out far
        maxZoom={2} // Limit how far in users can zoom
        autoungrabify={false} // Allow nodes to be moved
        layout={{ name: "preset" }} // Use preset layout to respect node positions
      />

      {/* Edge Style Toggle Control */}
      {mode === "editor" && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-10 flex flex-col items-start gap-2 border border-gray-200">
          <span className="text-xs font-medium text-gray-700">Edge Style:</span>
          <div className="flex gap-2">
            <button
              className={`px-2 py-1 rounded text-xs ${
                edgeDisplayStyle === "curved"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
              onClick={() => setEdgeDisplayStyle("curved")}
            >
              Curved
            </button>
            <button
              className={`px-2 py-1 rounded text-xs ${
                edgeDisplayStyle === "straight"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
              onClick={() => setEdgeDisplayStyle("straight")}
            >
              Straight
            </button>
          </div>
        </div>
      )}

      {/* Edge Edit Dialog */}
      <Dialog open={editEdgeOpen} onOpenChange={setEditEdgeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Edge</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Edge label */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Label:</label>
              <input
                className="col-span-3 p-2 border rounded"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                placeholder="Edge label (optional)"
              />
            </div>

            {/* Edge weight */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm">
                <input
                  type="checkbox"
                  checked={hasWeight}
                  onChange={(e) => setHasWeight(e.target.checked)}
                  className="mr-2"
                />
                <label>Weight:</label>
              </div>
              <input
                className="col-span-3 p-2 border rounded"
                type="number"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(parseInt(e.target.value))}
                disabled={!hasWeight}
                min={1}
              />
            </div>

            {/* Edge direction */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Direction:</label>
              <div className="col-span-3 flex items-center">
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={(e) => setIsDirected(e.target.checked)}
                  className="mr-2"
                />
                <span>{isDirected ? "Directed" : "Undirected"}</span>
              </div>
            </div>

            {/* Edge style */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Line Style:</label>
              <div className="col-span-3 flex gap-2">
                <button
                  className={`px-2 py-1 rounded text-xs ${
                    edgeStyle === "solid"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                  onClick={() => setEdgeStyle("solid")}
                >
                  Solid
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${
                    edgeStyle === "dashed"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                  onClick={() => setEdgeStyle("dashed")}
                >
                  Dashed
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${
                    edgeStyle === "dotted"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                  onClick={() => setEdgeStyle("dotted")}
                >
                  Dotted
                </button>
              </div>
            </div>

            {/* Edge color */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Color:</label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="color"
                  value={edgeColor}
                  onChange={(e) => setEdgeColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0"
                />
                <input
                  type="text"
                  value={edgeColor}
                  onChange={(e) => setEdgeColor(e.target.value)}
                  className="w-24 p-1 border rounded"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={deleteEdge}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setEditEdgeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateEdge}>Save</Button>
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