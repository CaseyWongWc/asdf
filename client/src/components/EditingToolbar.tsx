import { useState, useContext } from "react";
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
  MousePointer, 
  Circle, 
  ArrowUpRight, 
  Trash2, 
  Undo2, 
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize,
  Minimize,
  Copy,
  Settings
} from "lucide-react";

type EditingMode = "select" | "add-node" | "add-edge" | "delete";

export default function EditingToolbar() {
  const isMobile = useIsMobile();
  const { resetGraph, setStatusMessage } = useContext(GraphContext);
  const [currentMode, setCurrentMode] = useState<EditingMode>("select");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleModeChange = (mode: EditingMode) => {
    setCurrentMode(mode);
    
    // Update status message based on selected mode
    switch(mode) {
      case "select":
        setStatusMessage("Select and move nodes");
        break;
      case "add-node":
        setStatusMessage("Click on canvas to add a new node");
        break;
      case "add-edge":
        setStatusMessage("Click source node then target node to create an edge");
        break;
      case "delete":
        setStatusMessage("Click any element to delete it");
        break;
    }
    
    // Apply mode to Cytoscape (example implementation)
    if (window.cy) {
      // Reset any existing modes/handlers
      window.cy.elements().unselect();
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
          variant={currentMode === "select" ? "default" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("select")}
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        
        <Button 
          variant={currentMode === "add-node" ? "default" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("add-node")}
        >
          <Circle className="h-4 w-4" />
        </Button>
        
        <Button 
          variant={currentMode === "add-edge" ? "default" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("add-edge")}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        
        <Button 
          variant={currentMode === "delete" ? "destructive" : "ghost"} 
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => handleModeChange("delete")}
        >
          <Trash2 className="h-4 w-4" />
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
                variant={currentMode === "select" ? "default" : "ghost"} 
                size="icon"
                className="h-9 w-9"
                onClick={() => handleModeChange("select")}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Select Mode</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={currentMode === "add-node" ? "default" : "ghost"} 
                size="icon"
                className="h-9 w-9"
                onClick={() => handleModeChange("add-node")}
              >
                <Circle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Node</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={currentMode === "add-edge" ? "default" : "ghost"} 
                size="icon"
                className="h-9 w-9"
                onClick={() => handleModeChange("add-edge")}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Edge</p>
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
              <p>Delete Mode</p>
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
                onClick={handleTogglePanel}
              >
                {isPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isPanelOpen ? "Hide Properties" : "Show Properties"}</p>
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
    </TooltipProvider>
  );
}