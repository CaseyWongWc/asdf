import React, { useEffect, useRef, useContext, useState, useCallback } from "react";
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
import NodeStyleModal from "./NodeStyleModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  Menubar,
} from "@/components/ui/menubar";
import {
  Plus,
  Minimize,
  Maximize,
  Copy,
  Trash2,
  Save,
  FileText,
  Settings,
  PenTool,
  Layers,
  Palette,
  ArrowUpRight,
  ArrowDownLeft,
  SeparatorVertical,
  Image,
  LayoutGrid,
  MousePointer,
  BrainCircuit
} from "lucide-react";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    cy: any;
  }
}

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
  
  // Multi-selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [multiEditModalOpen, setMultiEditModalOpen] = useState(false);
  
  // For multi-edit form state
  const [labelPrefix, setLabelPrefix] = useState<string>("");
  const [nodeColor, setNodeColor] = useState<string>("");

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
  
  // Helper function to apply Auto Smart edge styling
  const applyAutoSmartEdgeStyling = useCallback(() => {
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    
    // Set display style to curved for tracking state
    setEdgeDisplayStyle("curved");
    setStatusMessage(
      "Auto Edge Style: Single edges are straight, bidirectional are curved",
    );

    // First pass: identify bidirectional edges
    const nodes = new Map();
    cy.edges().forEach((edge: any) => {
      const source = edge.data("source");
      const target = edge.data("target");

      // Skip self-loops
      if (source === target) return;

      const key =
        source < target
          ? `${source}-${target}`
          : `${target}-${source}`;
      if (!nodes.has(key)) {
        nodes.set(key, { edges: [], count: 0 });
      }

      const info = nodes.get(key);
      info.edges.push(edge);
      info.count++;
    });

    // Second pass: apply appropriate styles
    nodes.forEach(({ edges, count }) => {
      const isBidirectional = count > 1;

      edges.forEach((edge: any, index: number) => {
        if (isBidirectional) {
          // Bidirectional edges are curved - use same direction curve for both
          // This makes both edges curve in the same direction instead of opposite
          const controlDistance = -80; // Both edges curve above the straight line
          edge.style({
            "curve-style": "unbundled-bezier",
            "control-point-distances": controlDistance,
            "control-point-weights": 0.5,
          });
        } else {
          // Single edges are straight
          edge.style({
            "curve-style": "straight",
          });
        }
      });
    });
  }, [setEdgeDisplayStyle, setStatusMessage]);

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
          y: cy.height() / 2,
        };

        // Add nodes in a triangle formation around the center
        // This creates a more balanced initial layout
        const nodeRadius = Math.min(cy.width(), cy.height()) * 0.15; // 15% of smallest dimension

        // Calculate positions in a triangle around center
        const positions = [
          { x: center.x - nodeRadius, y: center.y - nodeRadius / 1.5 },
          { x: center.x + nodeRadius, y: center.y - nodeRadius / 1.5 },
          { x: center.x, y: center.y + nodeRadius },
        ];

        // Create nodes with timestamp-based IDs to avoid collisions
        for (let i = 0; i < 3; i++) {
          const timestamp = Date.now() + i; // Add index to ensure uniqueness
          const node = {
            group: "nodes",
            data: {
              id: `n${timestamp}`,
              label: `Node ${i + 1}`,
            },
            position: positions[i],
          };

          // Add node with animation
          cy.add(node);

          // Apply a subtle fade-in animation
          cy.getElementById(`n${timestamp}`)
            .style("opacity", 0)
            .animate({
              style: { opacity: 1 },
              duration: 300,
              easing: "ease-in-out",
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
            const nodeId = `n${existingCount + 1}_${timestamp}`;
            const nodeLabel = `Node ${existingCount + 1}`;

            // First add the node with 0 opacity
            const newNode = cy.add({
              group: "nodes",
              data: { id: nodeId, label: nodeLabel },
              position: { x: pos.x, y: pos.y },
              style: { opacity: 0 }, // Start invisible for animation
            });

            // Then animate it in with a gentle fade
            cy.getElementById(nodeId).animate({
              style: { opacity: 1 },
              duration: 300,
              easing: "ease-in-out",
            });

            // Apply a subtle "pop" animation
            cy.getElementById(nodeId)
              .animate({
                style: {
                  height: isMobile ? 55 : 45,
                  width: isMobile ? 55 : 45,
                },
                duration: 100,
              })
              .delay(100)
              .animate({
                style: {
                  height: isMobile ? 50 : 40,
                  width: isMobile ? 50 : 40,
                },
                duration: 100,
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

          // Handle multi-select mode
          if (selectionMode) {
            // In selection mode, clicking toggles selection state
            if (node.hasClass('selected-node')) {
              // Deselect the node
              node.removeClass('selected-node');
              setSelectedNodes(prev => prev.filter(n => n.id() !== nodeId));
              setStatusMessage(`Removed "${node.data("label")}" from selection (${selectedNodes.length - 1} selected)`);
            } else {
              // Select the node
              node.addClass('selected-node');
              setSelectedNodes(prev => [...prev, node]);
              setStatusMessage(`Added "${node.data("label")}" to selection (${selectedNodes.length + 1} selected)`);
            }
            return;
          }

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

              // Apply styles to the self-loop edge
              selfLoopEdge.style({
                "target-arrow-shape": "triangle",
                "target-arrow-color": "#64748B",
                "line-style": "solid",
                "curve-style": "bezier",
                "loop-direction": "-45deg",
                "loop-sweep": "315deg",
                "target-endpoint": "outside-to-node",
                "source-endpoint": "outside-to-node",
                "control-point-step-size": 80,
                "control-point-distances": 120,
                "control-point-weights": 0.7,
                "arrow-scale": 1.2,
              });

              console.log(
                `Self-loop created, new edge count: ${cy.edges().length}`,
              );
              setEdgeCount(cy.edges().length);
              setStatusMessage(`Created self-loop with weight 1`);
              
              // Apply Auto Smart styling automatically
              applyAutoSmartEdgeStyling();
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
                  // Use existingEdges as our check - which will be 0 at this point
                  const existingEdgeInDirection = existingEdges;

                  // Check if there's already an edge in the opposite direction
                  const oppositeEdge = cy
                    .edges()
                    .filter(
                      (edge: any) =>
                        edge.data("source") === nodeId &&
                        edge.data("target") === sourceNode,
                    );

                  // Determine curve style based on whether there are two edges (bidirectional)
                  // If there's only one edge (this new one), it's straight
                  // If there will be two edges (bidirectional), they're curved
                  const willHaveTwoEdges = oppositeEdge.length === 1;
                  const curveStyle = willHaveTwoEdges
                    ? "unbundled-bezier"
                    : "straight";

                  // Apply curve style to opposite edge if it exists - same curve direction
                  if (willHaveTwoEdges) {
                    oppositeEdge.style({
                      "curve-style": "unbundled-bezier",
                      "control-point-distances": -80, // Both curves go above the straight line
                      "control-point-weights": 0.5,
                    });
                  }

                  // Create control point effect for curved edges - same curve direction
                  const controlDistance = -80; // Both edges curve above the straight line

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
                      curveStyle: curveStyle,
                      curvature: 40,
                      targetArrow: "triangle",
                      // Store this info for parallel edge detection
                      parallelIndex: existingEdgeInDirection.length,
                    },
                  });

                  // Apply styles to the new edge - with visual differentiation for multiple edges
                  const lineStyle =
                    existingEdgeInDirection.length === 0 ? "solid" : "dashed";

                  // Add a special indicator for multiple edges
                  const edgeNumber = existingEdgeInDirection.length + 1;
                  const multiEdgeLabel =
                    edgeNumber > 1 ? `(${edgeNumber})` : "";

                  newEdge.data("multiEdgeLabel", multiEdgeLabel);
                  newEdge.data("edgeNumber", edgeNumber);

                  const styleObj: any = {
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "#64748B",
                    "line-style": lineStyle,
                    "curve-style": curveStyle,
                  };

                  // Only add control points if using curved style
                  if (curveStyle === "unbundled-bezier") {
                    styleObj["control-point-distances"] = controlDistance;
                    styleObj["control-point-weights"] = 0.5;
                  }

                  // First set the edge with opacity 0
                  styleObj["opacity"] = 0;
                  newEdge.style(styleObj);

                  // Then animate it in with a gentle fade
                  newEdge.animate({
                    style: { opacity: 1 },
                    duration: 300,
                    easing: "ease-in-out",
                  });

                  // Add a subtle width animation for emphasis
                  const finalWidth = isMobile ? 3 : 2;
                  newEdge
                    .animate({
                      style: { width: finalWidth * 1.5 },
                      duration: 150,
                    })
                    .delay(150)
                    .animate({
                      style: { width: finalWidth },
                      duration: 150,
                    });

                  console.log(
                    `Edge created successfully, new edge count: ${cy.edges().length}`,
                  );
                  setEdgeCount(cy.edges().length);
                  setStatusMessage(`Created directed edge with weight 1`);
                  
                  // Apply Auto Smart styling automatically after edge creation
                  applyAutoSmartEdgeStyling();
                } catch (error) {
                  console.error("Error creating edge:", error);
                  setStatusMessage("Error creating edge");
                }
              }
            }

            // Deselect the source node in all cases
            sourceNodeElement.removeClass("source-node");
            setSourceNode(null);
          } else {
            // No source node selected yet, so select this node as the source
            console.log(`Selecting node ${nodeId} as source`);
            node.addClass("source-node");
            setSourceNode(nodeId);
            setStatusMessage(`Selected "${node.data("label")}" as source node`);
          }
        });

        // Edge click handler for edge editing
        cy.on("tap", "edge", function (event: any) {
          const edge = event.target;
          // Only handle edge taps if no source node is selected
          if (!sourceNode) {
            setCurrentEdge(edge);

            // Check if the edge has a weight
            const weight = edge.data("weight");
            const isWeightless = weight === null || weight === undefined;

            setEdgeWeight(isWeightless ? 1 : weight);
            setHasWeight(!isWeightless);
            setEdgeLabel(edge.data("label") || "");

            // Get the description and position if they exist
            setEdgeDescription(edge.data("description") || "");
            setDescriptionPosition(edge.data("descriptionPosition") || "above");

            // Check if the edge has an arrow (is directed)
            setIsDirected(edge.style("target-arrow-shape") !== "none");

            // Determine the edge style
            const lineStyle = edge.style("line-style") || "solid";
            setEdgeStyle(lineStyle as "solid" | "dashed" | "dotted");

            // Get edge color
            const color = edge.style("line-color") || "#64748B";
            setEdgeColor(color);

            // Get curve style and curvature
            const curveStyle = edge.style("curve-style") || "bezier";
            setEdgeCurve(curveStyle as "straight" | "bezier");
            setEdgeCurvature(
              parseInt(edge.style("control-point-step-size") || "40", 10),
            );

            setEditEdgeOpen(true);
          }
        });

        // Right-click handler for element editing
        cy.on("cxttap", "node, edge", function (event: any) {
          const ele = event.target;

          if (ele.isNode()) {
            // Open node style dialog for nodes
            setSelectedNodeId(ele.id());
            setNodeStyleOpen(true);
            setStatusMessage(`Editing style for "${ele.data("label")}"`);

            // If this was the source node, deselect it
            if (sourceNode && sourceNode === ele.id()) {
              ele.removeClass("source-node");
              setSourceNode(null);
            }
          } else {
            // Open edge edit dialog for edges
            setCurrentEdge(ele);

            // Check if the edge has a weight
            const weight = ele.data("weight");
            const isWeightless = weight === null || weight === undefined;

            setEdgeWeight(isWeightless ? 1 : weight);
            setHasWeight(!isWeightless);
            setEdgeLabel(ele.data("label") || "");

            // Get the description and position if they exist
            setEdgeDescription(ele.data("description") || "");
            setDescriptionPosition(ele.data("descriptionPosition") || "above");

            // Check if the edge has an arrow (is directed)
            setIsDirected(ele.style("target-arrow-shape") !== "none");

            // Determine the edge style
            const lineStyle = ele.style("line-style") || "solid";
            setEdgeStyle(lineStyle as "solid" | "dashed" | "dotted");

            // Get edge color
            const color = ele.style("line-color") || "#64748B";
            setEdgeColor(color);

            // Get curve style and curvature
            const curveStyle = ele.style("curve-style") || "bezier";
            setEdgeCurve(curveStyle as "straight" | "bezier");
            setEdgeCurvature(
              parseInt(ele.style("control-point-step-size") || "40", 10),
            );

            setEditEdgeOpen(true);
            setStatusMessage(`Editing edge properties`);
          }
        });
      } else {
        // ALGORITHM MODE HANDLERS

        // Node click handler for algorithm visualization
        cy.on("tap", "node", function (event: any) {
          const node = event.target;
          setStatusMessage(
            `Selected node "${node.data("label")}" for algorithm`,
          );

          // We could set this as a start/end node for algorithms
          if (!sourceNode) {
            node.addClass("algorithm-start-node");
            setSourceNode(node.id());
          } else if (sourceNode !== node.id()) {
            // Could be used to select an end node for path algorithms
            cy.getElementById(sourceNode).removeClass("algorithm-start-node");
            setSourceNode(node.id());
            node.addClass("algorithm-start-node");
          } else {
            // Deselect if clicking the same node
            node.removeClass("algorithm-start-node");
            setSourceNode(null);
          }
        });

        // Edge click handler (simple selection for algorithm)
        cy.on("tap", "edge", function (event: any) {
          const edge = event.target;
          const source = cy.getElementById(edge.data("source")).data("label");
          const target = cy.getElementById(edge.data("target")).data("label");
          const weight = edge.data("weight") || "";

          setStatusMessage(
            `Selected edge from ${source} to ${target}${weight ? " with weight " + weight : ""}`,
          );
        });
      }
    }
  }, [
    mode,
    sourceNode,
    setSourceNode,
    setNodeCount,
    setEdgeCount,
    setStatusMessage,
    setCurrentEdge,
    setEdgeWeight,
    setEdgeLabel,
    setEdgeDescription,
    setDescriptionPosition,
    setIsDirected,
    setEditEdgeOpen,
    setHasWeight,
    setEdgeStyle,
    setEdgeCurve,
    setEdgeCurvature,
    setNodeStyleOpen,
    setSelectedNodeId,
    setEdgeColor,
    edgeDisplayStyle,
  ]);

  const cytoscapeStyle: any[] = [
    {
      selector: "node",
      style: {
        "background-color": "#4299E1",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        color: "white",
        "font-size": isMobile ? "14px" : "12px",
        width: isMobile ? "50px" : "40px",
        height: isMobile ? "50px" : "40px",
        "text-outline-width": "1px",
        "text-outline-color": "#4299E1",
      },
    },
    // Main node label (always visible, regardless of top/bottom text)
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-margin-y": 0,
        "font-weight": "bold",
        "font-size": isMobile ? "16px" : "14px",
        "text-outline-width": 2,
        "text-outline-color": function (ele: any) {
          return ele.style("background-color");
        },
        color: function (ele: any) {
          return ele.style("color") || "#FFFFFF";
        },
        "text-background-opacity": 0,
      },
    },

    // Add top-text label as overlay
    {
      selector: "node[topText]",
      style: {
        "overlay-padding": 5,
        "overlay-opacity": 0,
        "overlay-color": "#000",
      },
    },

    // Complete node style with multiline label for top, main, and bottom text
    {
      selector: "node[topText], node[bottomText]",
      style: {
        // Create a multi-line label with all three parts
        label: function (ele: any) {
          const topText = ele.data("topText") || "";
          const mainLabel = ele.data("label") || "";
          const bottomText = ele.data("bottomText") || "";

          // Format the text with special markers for styling
          let labelParts = [];

          // Add top text if present (with a more subtle indicator)
          if (topText) {
            labelParts.push(`${topText}`); //⌈⌉
          }

          // Add main label
          if (mainLabel) {
            labelParts.push(mainLabel);
          }

          // Add bottom text if present (with a more subtle indicator)
          if (bottomText) {
            labelParts.push(`${bottomText}`); //⌊⌋
          }

          return labelParts.join("\n");
        },
        "text-wrap": "wrap",
        "text-max-width": "120px",
        "text-valign": "center",
        "text-halign": "center",
        "font-family": "Arial, sans-serif",
        "text-margin-y": 0,
        color: "#333333", // Default color for all text
      },
    },

    // Special styling for top text to make it distinct
    {
      selector: "node[topText]",
      style: {
        // Apply special color to top text
        color: "#3182CE", // Blue color for top text
      },
    },

    // Special styling for bottom text to make it distinct
    {
      selector: "node[bottomText]",
      style: {
        // Apply special color to bottom text
        color: "#805AD5", // Purple color for bottom text
      },
    },

    // Style for nodes with top text - increase node height to accommodate and style the text
    {
      selector: "node[topText]",
      style: {
        // Increase node dimensions to fit additional text
        height: function (ele: any) {
          // Get the base height and add space for top text
          const baseHeight = parseInt(ele.style("height").replace("px", ""));
          return `${baseHeight + 20}px`;
        },
        width: function (ele: any) {
          // Make node wider to accommodate text
          const baseWidth = parseInt(ele.style("width").replace("px", ""));
          return `${Math.max(baseWidth, 60)}px`;
        },
        // Add background band
        "background-blacken": 0.1,
        // Make text styling more prominent
        "font-weight": "normal",
        "text-background-opacity": 0, // Fully transparent background
        "text-outline-width": 2,
        "text-outline-color": "white",
        "text-outline-opacity": 0.9,
      },
    },

    // Style for nodes with bottom text - increase height and style
    {
      selector: "node[bottomText]",
      style: {
        // Increase node dimensions to fit additional text
        height: function (ele: any) {
          // Get the base height and add space for bottom text
          const baseHeight = parseInt(ele.style("height").replace("px", ""));
          return `${baseHeight + 20}px`;
        },
        width: function (ele: any) {
          // Make node wider to accommodate text
          const baseWidth = parseInt(ele.style("width").replace("px", ""));
          return `${Math.max(baseWidth, 60)}px`;
        },
        // Add styling for better visibility
        "background-blacken": 0.1,
        "font-weight": "normal",
        "text-background-opacity": 0, // Fully transparent background
        "text-outline-width": 2,
        "text-outline-color": "white",
        "text-outline-opacity": 0.9,
      },
    },
    // Basic edge style
    {
      selector: "edge",
      style: {
        width: isMobile ? 3 : 2,
        "line-color": function (ele: any) {
          // Use the edge's custom color if set, otherwise default
          return ele.style("line-color") || "#64748B";
        },
        "target-arrow-shape": "triangle",
        "target-arrow-color": function (ele: any) {
          // Match arrow color to line color for consistency
          return ele.style("line-color") || "#64748B";
        },
        "arrow-scale": 1.5,
        "curve-style": "unbundled-bezier",
        "control-point-distances": 50,
        "control-point-weights": 0.5,
        "target-endpoint": "outside-to-node", // Make arrows end at the node edges
        "source-endpoint": "outside-to-node", // Make edges start at the node edges
      },
    },
    // Style for parallel edges between same nodes (first edge)
    {
      selector: "edge[source][target]",
      style: {
        "curve-style": function (ele: any) {
          // Don't apply to self-loops
          if (ele.data("source") === ele.data("target")) {
            return "bezier";
          }

          // Count how many edges there are between these two nodes
          const cy = ele.cy();
          const source = ele.data("source");
          const target = ele.data("target");

          const parallelEdges = cy
            .edges()
            .filter(
              (e: any) =>
                (e.data("source") === source && e.data("target") === target) ||
                (e.data("source") === target && e.data("target") === source),
            );

          // If there's only one edge (regardless of direction), it's straight
          // If there are two edges (one in each direction), they're curved
          return parallelEdges.length === 1 ? "straight" : "unbundled-bezier";
        },
        "control-point-distances": function (ele: any) {
          if (ele.data("source") === ele.data("target")) {
            return 120; // Self-loops get special treatment
          }

          const cy = ele.cy();
          const source = ele.data("source");
          const target = ele.data("target");

          // Get all edges between these nodes
          const edgesBetween = cy
            .edges()
            .filter(
              (e: any) =>
                (e.data("source") === source && e.data("target") === target) ||
                (e.data("source") === target && e.data("target") === source),
            );

          // For bidirectional edges, both curve the same way (above)
          return -80; // All curves go above the straight line
        },
        "control-point-weights": 0.5,
      },
    },
    // Edge label style
    {
      selector: "edge",
      style: {
        "font-size": isMobile ? "14px" : "12px",
        color: "#1a202c",
        "text-rotation": "none",
        "text-valign": "center",
        "text-halign": "center",
        "text-outline-width": "1px",
        "text-outline-color": "white",
        "text-background-opacity": 0.7,
        "text-background-color": "#ffffff",
        "text-background-padding": 2,
      },
    },
    // Edge with weight and label style
    {
      selector: "edge[weight]",
      style: {
        label: (ele: any) => {
          const label = ele.data("label");
          const weight = ele.data("weight");
          const multiEdgeLabel = ele.data("multiEdgeLabel") || "";

          if (label && label.length > 0) {
            return `${label} (${weight}) ${multiEdgeLabel}`;
          }

          return `${weight}${multiEdgeLabel}`;
        },
        "text-background-opacity": 1,
        "text-background-color": "#ffffff",
        "text-background-padding": 3,
      },
    },
    // Style for second edge to make it visually distinct
    {
      selector: "edge[edgeNumber = 2]",
      style: {
        "line-style": "dashed",
        "line-dash-pattern": [6, 3],
        "line-color": "#805AD5", // Purple to distinguish from first edge
      },
    },
    // Edge with label but no weight style
    {
      selector: "edge[!weight][label]",
      style: {
        label: "data(label)",
      },
    },
    // Edge with description for directed edges - only show at source node
    {
      selector: 'edge[description][targetArrow="triangle"]',
      style: {
        "source-label": "data(description)",
        "source-text-offset": 15,
        "source-text-margin-y": -10,
      },
    },
    // Edge with description for undirected edges - show at both source and target nodes
    {
      selector: 'edge[description][targetArrow="none"]',
      style: {
        "source-label": "data(description)",
        "source-text-offset": 15,
        "source-text-margin-y": -10,
        "target-label": "data(description)",
        "target-text-offset": 15,
        "target-text-margin-y": 10,
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
    
    // Multi-selected node style
    {
      selector: ".selected-node",
      style: {
        "border-width": "3px",
        "border-color": "#6B46C1", // Purple border
        "border-style": "double", // Double line border
        "background-opacity": 0.9,
      },
    },
    // Self-loop edge style - This implements JFLAP-like self-loops
    {
      selector: "edge[source][target]",
      style: {
        "curve-style": function (ele: any) {
          return ele.data("source") === ele.data("target")
            ? "bezier"
            : ele.style("curve-style");
        },
        "target-endpoint": function (ele: any) {
          return "outside-to-node";
        },
        "source-endpoint": function (ele: any) {
          return "outside-to-node";
        },
        "control-point-step-size": function (ele: any) {
          return ele.data("source") === ele.data("target")
            ? 80
            : ele.style("control-point-step-size");
        },
        "control-point-distances": function (ele: any) {
          return ele.data("source") === ele.data("target")
            ? 120
            : ele.style("control-point-distances");
        },
        "control-point-weights": function (ele: any) {
          return ele.data("source") === ele.data("target")
            ? 0.7
            : ele.style("control-point-weights");
        },
        "loop-direction": function (ele: any) {
          return ele.data("source") === ele.data("target") ? "-45deg" : "0deg";
        },
        "loop-sweep": function (ele: any) {
          return ele.data("source") === ele.data("target") ? "315deg" : "0deg";
        },
        "arrow-scale": function (ele: any) {
          return ele.data("source") === ele.data("target") ? 1.2 : 1.5;
        },
      },
    },
  ];

  // Handle edge update
  const updateEdge = () => {
    if (currentEdge && cyRef.current) {
      // Update edge data based on whether it has weight or not
      currentEdge.data("weight", hasWeight ? edgeWeight : null);
      currentEdge.data("label", edgeLabel);

      // Save the description and its position
      currentEdge.data("description", edgeDescription);
      currentEdge.data("descriptionPosition", descriptionPosition);

      // Create style object with line style, curve, direction and color
      const styleObj: any = {
        "line-style": edgeStyle,
        "curve-style": edgeCurve,
        "control-point-step-size": edgeCurvature,
        "line-color": edgeColor,
        "target-arrow-color": edgeColor, // Match arrow color to line color
      };

      // Add arrow if the edge is directed
      if (isDirected) {
        styleObj["target-arrow-shape"] = "triangle";
        currentEdge.data("targetArrow", "triangle");
      } else {
        styleObj["target-arrow-shape"] = "none";
        currentEdge.data("targetArrow", "none");
      }

      // Save curvature data for persistence
      currentEdge.data("curveStyle", edgeCurve);
      currentEdge.data("curvature", edgeCurvature);

      // Apply all styles at once
      currentEdge.style(styleObj);

      // Close the dialog
      setEditEdgeOpen(false);

      // Update status message based on whether the edge has a weight or not
      if (hasWeight) {
        setStatusMessage(`Updated edge with weight ${edgeWeight}`);
      } else {
        setStatusMessage("Updated edge without weight");
      }
    }
  };

  // Handle reversing the edge direction
  const reverseEdge = () => {
    if (currentEdge && cyRef.current) {
      const sourceId = currentEdge.data("source");
      const targetId = currentEdge.data("target");

      // Only reverse if it's not a self-loop
      if (sourceId !== targetId) {
        // Store current edge data
        const edgeData = {
          ...currentEdge.data(),
          source: targetId,
          target: sourceId,
        };

        // Remove the current edge
        currentEdge.remove();

        // Add a new edge with reversed direction
        const newEdge = cyRef.current.add({
          group: "edges",
          data: edgeData,
        });

        // Apply the same styles to the new edge
        newEdge.style({
          "line-style": edgeStyle,
          "curve-style": edgeCurve,
          "control-point-step-size": edgeCurvature,
          "target-arrow-shape": isDirected ? "triangle" : "none",
          "line-color": edgeColor,
          "target-arrow-color": edgeColor,
        });

        // Update edge reference
        setCurrentEdge(newEdge);

        setStatusMessage("Reversed edge direction");
      } else {
        setStatusMessage("Cannot reverse a self-loop");
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

      {/* Selection Mode Toggle */}
      {mode === "editor" && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md z-10 flex items-center gap-2 border border-gray-200">
          <span className="text-sm font-medium whitespace-nowrap">
            Multi-Select:
          </span>
          <Button
            size="sm"
            variant={selectionMode ? "default" : "outline"}
            className={selectionMode ? "bg-purple-600 hover:bg-purple-700" : ""}
            onClick={() => {
              const newMode = !selectionMode;
              setSelectionMode(newMode);
              setStatusMessage(newMode ? 'Multi-select mode enabled' : 'Multi-select mode disabled');
              
              // Clear selection when disabling selection mode
              if (!newMode && cyRef.current) {
                selectedNodes.forEach(node => {
                  node.removeClass('selected-node');
                });
                setSelectedNodes([]);
              }
            }}
          >
            {selectionMode ? "Selection ON" : "Selection OFF"}
          </Button>
          {selectedNodes.length > 0 && (
            <Button 
              size="sm" 
              variant="default"
              className="ml-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => setMultiEditModalOpen(true)}
            >
              Edit {selectedNodes.length} selected
            </Button>
          )}
        </div>
      )}
      
      {/* Edge Style Toggle Control */}
      {mode === "editor" && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-10 flex flex-col items-start gap-2 border border-gray-200">
          <span className="text-sm font-medium whitespace-nowrap">
            Edge Style:
          </span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={edgeDisplayStyle === "curved" ? "default" : "outline"}
              onClick={() => {
                setEdgeDisplayStyle("curved");
                setStatusMessage(
                  "Auto Edge Style: Single edges are straight, bidirectional are curved",
                );

                // Apply to existing edges
                if (cyRef.current) {
                  // First pass: identify bidirectional edges
                  const nodes = new Map();
                  cyRef.current.edges().forEach((edge: any) => {
                    const source = edge.data("source");
                    const target = edge.data("target");

                    // Skip self-loops
                    if (source === target) return;

                    const key =
                      source < target
                        ? `${source}-${target}`
                        : `${target}-${source}`;
                    if (!nodes.has(key)) {
                      nodes.set(key, { edges: [], count: 0 });
                    }

                    const info = nodes.get(key);
                    info.edges.push(edge);
                    info.count++;
                  });

                  // Second pass: apply appropriate styles
                  nodes.forEach(({ edges, count }) => {
                    const isBidirectional = count > 1;

                    edges.forEach((edge: any, index: number) => {
                      if (isBidirectional) {
                        // Bidirectional edges are curved - use same direction curve for both
                        // This makes both edges curve in the same direction instead of opposite
                        const controlDistance = -80; // Both edges curve above the straight line
                        edge.style({
                          "curve-style": "unbundled-bezier",
                          "control-point-distances": controlDistance,
                          "control-point-weights": 0.5,
                        });
                      } else {
                        // Single edges are straight
                        edge.style({
                          "curve-style": "straight",
                        });
                      }
                    });
                  });
                }
              }}
            >
              Auto (Smart)
            </Button>
            <Button
              size="sm"
              variant={edgeDisplayStyle === "straight" ? "default" : "outline"}
              onClick={() => {
                setEdgeDisplayStyle("straight");
                setStatusMessage("Using all straight edges");

                // Apply to existing edges
                if (cyRef.current) {
                  cyRef.current.edges().forEach((edge: any) => {
                    if (edge.data("source") === edge.data("target")) {
                      // Don't change self-loops
                      return;
                    }

                    edge.style({
                      "curve-style": "straight",
                    });
                  });
                }
              }}
            >
              All Straight
            </Button>
          </div>
        </div>
      )}

      {/* Edge Edit Dialog */}
      <Dialog open={editEdgeOpen} onOpenChange={setEditEdgeOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-lg overflow-hidden">
          <DialogHeader className="p-4 md:p-6 border-b">
            <DialogTitle className="text-xl font-semibold">
              Edit Edge
            </DialogTitle>
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
                    {hasWeight ? "Enabled" : "Disabled"}
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
                    checked={descriptionPosition === "above"}
                    onChange={() => setDescriptionPosition("above")}
                  />
                  <span className="ml-2">Above</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="descriptionPosition"
                    value="below"
                    checked={descriptionPosition === "below"}
                    onChange={() => setDescriptionPosition("below")}
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
                    {isDirected ? "Directed" : "Undirected"}
                  </span>
                </label>
              </div>

              {isDirected &&
                currentEdge &&
                currentEdge.data("source") !== currentEdge.data("target") && (
                  <button
                    onClick={reverseEdge}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Reverse Direction
                  </button>
                )}
            </div>

            {/* Edge Color Picker */}
            <div className="space-y-2">
              <label className="text-base font-medium">Line Color</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { name: "Gray", value: "#64748B" },
                  { name: "Blue", value: "#3B82F6" },
                  { name: "Green", value: "#10B981" },
                  { name: "Red", value: "#EF4444" },
                  { name: "Purple", value: "#8B5CF6" },
                  { name: "Orange", value: "#F97316" },
                  { name: "Yellow", value: "#FACC15" },
                  { name: "Teal", value: "#14B8A6" },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 rounded-md transition-all ${
                      edgeColor === color.value
                        ? "ring-2 ring-offset-1 ring-blue-500"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEdgeColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={edgeColor}
                  onChange={(e) => setEdgeColor(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="#RRGGBB"
                />
                <div
                  className="w-8 h-8 border border-gray-300 rounded"
                  style={{ backgroundColor: edgeColor }}
                />
              </div>
            </div>

            {/* Edge Style */}
            <div className="space-y-2">
              <label className="text-base font-medium">Line Style</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEdgeStyle("solid")}
                  className={`px-3 py-2 rounded-md border ${
                    edgeStyle === "solid"
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setEdgeStyle("dashed")}
                  className={`px-3 py-2 rounded-md border ${
                    edgeStyle === "dashed"
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  Dashed
                </button>
                <button
                  onClick={() => setEdgeStyle("dotted")}
                  className={`px-3 py-2 rounded-md border ${
                    edgeStyle === "dotted"
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
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
                    onClick={() => setEdgeCurve("straight")}
                    className={`px-3 py-1 rounded-md border ${
                      edgeCurve === "straight"
                        ? "bg-blue-100 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    Straight
                  </button>
                  <button
                    onClick={() => setEdgeCurve("bezier")}
                    className={`px-3 py-1 rounded-md border ${
                      edgeCurve === "bezier"
                        ? "bg-blue-100 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    Curved
                  </button>
                </div>
              </div>

              {edgeCurve === "bezier" && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Curvature: {edgeCurvature}</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[edgeCurvature]}
                    onValueChange={(value) => setEdgeCurvature(value[0])}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 md:p-6 border-t bg-gray-50 flex justify-between">
            <Button variant="destructive" onClick={deleteEdge}>
              Delete Edge
            </Button>
            <div>
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => setEditEdgeOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateEdge}>Update Edge</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Style Dialog */}
      <NodeStyleModal
        open={nodeStyleOpen}
        onOpenChange={setNodeStyleOpen}
        nodeId={selectedNodeId}
      />

      {/* Multi-Edit Modal */}
      <Dialog open={multiEditModalOpen} onOpenChange={setMultiEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-lg overflow-hidden">
          <DialogHeader className="p-4 md:p-6 border-b">
            <DialogTitle className="text-xl font-semibold">
              Batch Edit {selectedNodes.length} Nodes
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 md:p-6 space-y-4">
            {/* Multi-edit form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-base font-medium">Node Label Prefix</label>
                <input
                  type="text"
                  placeholder="e.g., 'State' - will become State 1, State 2, etc."
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={(e) => setLabelPrefix(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-base font-medium">Node Background Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {["#4299E1", "#9F7AEA", "#48BB78", "#F56565", "#ED8936", "#ECC94B", "#A0AEC0", "#38B2AC"].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border border-gray-300 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${nodeColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNodeColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setMultiEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Apply batch changes to all selected nodes
                  if (cyRef.current) {
                    selectedNodes.forEach((node, index) => {
                      // Apply label prefix if provided
                      if (labelPrefix) {
                        node.data('label', `${labelPrefix} ${index + 1}`);
                      }
                      
                      // Apply color if selected
                      if (nodeColor) {
                        node.style('background-color', nodeColor);
                      }
                    });
                    
                    // Reset form state
                    setLabelPrefix("");
                    setNodeColor("");
                    
                    // Close dialog
                    setMultiEditModalOpen(false);
                    setStatusMessage(`Updated ${selectedNodes.length} nodes`);
                  }
                }}
              >
                Apply to All Selected
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
