import { Button } from "@/components/ui/button";
import { Plus, Minus, Maximize } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ZoomControlsProps {
  cyRef: React.MutableRefObject<cytoscape.Core | null>;
}

export default function ZoomControls({ cyRef }: ZoomControlsProps) {
  const isMobile = useIsMobile();

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
    </div>
  );
}
