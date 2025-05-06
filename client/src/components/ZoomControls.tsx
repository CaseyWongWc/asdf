import { Button } from "@/components/ui/button";
import { Plus, Minus, Maximize, Circle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";

interface ZoomControlsProps {
  cyRef: React.MutableRefObject<cytoscape.Core | null>;
}

export default function ZoomControls({ cyRef }: ZoomControlsProps) {
  const isMobile = useIsMobile();
  const { createNode } = useContext(GraphContext);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.2,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2
        }
      });
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() / 1.2,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2
        }
      });
    }
  };

  const handleZoomReset = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };
  
  const handleAddNode = () => {
    if (cyRef.current) {
      // Get the center of the viewport
      const centerX = cyRef.current.width() / 2;
      const centerY = cyRef.current.height() / 2;
      
      // Get current pan and zoom level
      const pan = cyRef.current.pan();
      const zoom = cyRef.current.zoom();
      
      // Calculate the position in the graph
      const modelX = (centerX - pan.x) / zoom;
      const modelY = (centerY - pan.y) / zoom;
      
      // Create a node at this position with a slight random offset
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 100;
      
      createNode(modelX + offsetX, modelY + offsetY, undefined, cyRef.current);
    }
  };

  return (
    <div className={`absolute ${isMobile ? 'bottom-4 right-4 flex flex-col space-y-2 bg-white/90 rounded-lg shadow p-2' : 'bottom-4 right-4 flex flex-col space-y-2 bg-white rounded-lg shadow p-1'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className={isMobile ? "w-10 h-10 rounded-full" : "w-8 h-8 rounded"}
        onClick={handleZoomIn}
      >
        <Plus className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className={isMobile ? "w-10 h-10 rounded-full" : "w-8 h-8 rounded"}
        onClick={handleZoomOut}
      >
        <Minus className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className={isMobile ? "w-10 h-10 rounded-full" : "w-8 h-8 rounded"}
        onClick={handleZoomReset}
      >
        <Maximize className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
      </Button>
      <div className="border-t border-gray-200 pt-2 mt-1"></div>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`${isMobile ? "w-10 h-10 rounded-full" : "w-8 h-8 rounded"} bg-blue-100 hover:bg-blue-200`}
        onClick={handleAddNode}
      >
        <Circle className={`${isMobile ? "h-5 w-5" : "h-4 w-4"} text-blue-600`} />
      </Button>
    </div>
  );
}
