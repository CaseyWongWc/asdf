import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HelpModal() {
  const { showHelp, setShowHelp } = useContext(GraphContext);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setShowHelp(false);
  };

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className={`${isMobile ? 'max-w-[95%]' : 'sm:max-w-[600px]'} max-h-[80vh] overflow-y-auto`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className={isMobile ? 'text-xl' : ''}>Graph Editor Help</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose} className={isMobile ? 'h-8 w-8' : 'h-6 w-6'}>
            <X className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className={`font-medium text-gray-800 mb-2 ${isMobile ? 'text-lg' : ''}`}>Basic Interactions</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              {isMobile ? (
                <>
                  <li><strong>Tap empty space:</strong> Add a node</li>
                  <li><strong>Drag node:</strong> Move it</li>
                  <li><strong>Long-press:</strong> Delete node/edge</li>
                  <li><strong>Tap node:</strong> Edit label</li>
                  <li><strong>Tap edge:</strong> Edit weight</li>
                </>
              ) : (
                <>
                  <li><strong>Add a node:</strong> Click on an empty area of the canvas</li>
                  <li><strong>Move a node:</strong> Click and drag a node to a new position</li>
                  <li><strong>Delete a node or edge:</strong> Right-click on the item you want to delete</li>
                  <li><strong>Edit a node:</strong> Click on a node to open the edit dialog</li>
                  <li><strong>Edit an edge weight:</strong> Click on an edge to open the edit dialog</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium text-gray-800 mb-2 ${isMobile ? 'text-lg' : ''}`}>Creating Edges</h4>
            <p className="text-gray-600">To create an edge between two nodes:</p>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600">
              <li>Tap/click on the first node (source)</li>
              <li>Tap/click on the second node (target)</li>
              <li>An edge will be created between them</li>
            </ol>
          </div>
          
          <div>
            <h4 className={`font-medium text-gray-800 mb-2 ${isMobile ? 'text-lg' : ''}`}>Navigation</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              {isMobile ? (
                <>
                  <li><strong>Zoom:</strong> Use the +/- buttons</li>
                  <li><strong>Pan:</strong> Drag on empty canvas area</li>
                  <li><strong>Reset view:</strong> Tap the expand button</li>
                </>
              ) : (
                <>
                  <li><strong>Zoom in/out:</strong> Use the zoom buttons or mouse wheel</li>
                  <li><strong>Pan:</strong> Click and drag on empty canvas area</li>
                  <li><strong>Reset view:</strong> Click the expand button in the zoom controls</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <DialogFooter className={isMobile ? 'mt-4' : ''}>
          <Button onClick={handleClose} className={isMobile ? 'w-full py-3' : ''}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
