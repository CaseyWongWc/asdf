import { useState, useContext, useEffect } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Pencil, 
  PenLine, 
  Trash2, 
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Info,
  Copy
} from "lucide-react";

// Define our three editing modes
type EditingMode = "draw" | "edit" | "delete";

export default function EditingToolbar() {
  const isMobile = useIsMobile();
  const { resetGraph, setStatusMessage } = useContext(GraphContext);
  const [currentMode, setCurrentMode] = useState<EditingMode>("draw");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  
  // When component mounts, initialize the graph with draw mode
  useEffect(() => {
    // Set initial mode
    if (window.cy) {
      window.cy.data('editingMode', 'draw');
      setStatusMessage("Draw Mode: Click canvas to add nodes, click nodes to connect with edges");
    }
  }, []);

  const handleModeChange = (mode: EditingMode) => {
    setCurrentMode(mode);
    
    // Update status message based on selected mode
    switch(mode) {
      case "draw":
        setStatusMessage("Draw Mode: Click canvas to add nodes, click nodes to connect with edges");
        break;
      case "edit":
        setStatusMessage("Edit Mode: Click on nodes or edges to edit labels and weights");
        break;
      case "delete":
        setStatusMessage("Delete Mode: Click on nodes or edges to delete them");
        break;
    }
    
    // Apply mode to Cytoscape (example implementation)
    if (window.cy) {
      // Reset any existing modes/handlers
      window.cy.elements().unselect();
      
      // Store the mode in a data attribute that Cytoscape event handlers can check
      window.cy.data('editingMode', mode);
    }
  };
  
  const handleZoomIn = () => {
    if (window.cy) {
      window.cy.zoom(window.cy.zoom() * 1.2);
      window.cy.center();
    }
  };
  
  const handleZoomOut = () => {
    if (window.cy) {
      window.cy.zoom(window.cy.zoom() / 1.2);
      window.cy.center();
    }
  };
  
  const handleResetView = () => {
    if (window.cy) {
      window.cy.fit();
      window.cy.center();
    }
  };
  
  const handleTogglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // Simplified interface for mobile
  if (isMobile) {
    return (
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full border border-gray-200 shadow-md p-1 flex items-center space-x-1">
        <Button 
          variant={currentMode === "draw" ? "default" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("draw")}
        >
          <PenLine className="h-4 w-4" />
        </Button>
        
        <Button 
          variant={currentMode === "edit" ? "default" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Button 
          variant={currentMode === "delete" ? "destructive" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("delete")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setShowHelpOverlay(!showHelpOverlay)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Full desktop interface
  return (
    <TooltipProvider>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-lg border border-gray-200 shadow-md p-2 flex flex-col items-center space-y-2">
        <div className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={currentMode === "draw" ? "default" : "ghost"} 
                size="icon"
                className="h-9 w-9"
                onClick={() => handleModeChange("draw")}
              >
                <PenLine className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="max-w-xs">
                <p className="font-semibold">Draw Mode</p>
                <p className="text-xs mt-1">Click canvas to add nodes. Click nodes to connect with edges.</p>
              </div>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={currentMode === "edit" ? "default" : "ghost"} 
                size="icon"
                className="h-9 w-9"
                onClick={() => handleModeChange("edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="max-w-xs">
                <p className="font-semibold">Edit Mode</p>
                <p className="text-xs mt-1">Click on nodes or edges to edit labels and weights.</p>
              </div>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={currentMode === "delete" ? "destructive" : "ghost"} 
                size="icon"
                className="h-9 w-9"
                onClick={() => handleModeChange("delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="max-w-xs">
                <p className="font-semibold">Delete Mode</p>
                <p className="text-xs mt-1">Click on nodes or edges to delete them.</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <Separator className="my-1" />
        
        <div className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={handleResetView}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Fit to View</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <Separator className="my-1" />
        
        <div className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={resetGraph}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Reset Graph</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowHelpOverlay(!showHelpOverlay)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Help</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Graph Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {/* Help Overlay with Mode Instructions */}
      {showHelpOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelpOverlay(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Graph Editor Modes</h2>
            
            <div className="mb-4">
              <h3 className="font-bold flex items-center"><PenLine className="h-4 w-4 mr-2" /> Draw Mode</h3>
              <p className="text-sm mt-1">
                • Click anywhere on the canvas to create a new node.<br />
                • Click on a node to start drawing an edge.<br />
                • To cancel the edge, click on empty space.<br />
                • To complete the edge, click on another node.
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold flex items-center"><Pencil className="h-4 w-4 mr-2" /> Edit Mode</h3>
              <p className="text-sm mt-1">
                • Click on a node label to edit it.<br />
                • Click on an edge to edit its weight.<br />
                • Click elsewhere or press Enter to finish editing.
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold flex items-center"><Trash2 className="h-4 w-4 mr-2" /> Delete Mode</h3>
              <p className="text-sm mt-1">
                • Click on a node to delete it and all its connected edges.<br />
                • Click on an edge to delete just that connection.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowHelpOverlay(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}