import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function HelpModal() {
  const { showHelp, setShowHelp } = useContext(GraphContext);

  const handleClose = () => {
    setShowHelp(false);
  };

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Graph Editor Help</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Basic Interactions</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Add a node:</strong> Click on an empty area of the canvas</li>
              <li><strong>Move a node:</strong> Click and drag a node to a new position</li>
              <li><strong>Delete a node or edge:</strong> Right-click on the item you want to delete</li>
              <li><strong>Edit a node:</strong> Click on a node to open the edit dialog</li>
              <li><strong>Edit an edge weight:</strong> Click on an edge to open the edit dialog</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Creating Edges</h4>
            <p className="text-gray-600">To create an edge between two nodes:</p>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600">
              <li>Click on the first node (source)</li>
              <li>Click on the second node (target)</li>
              <li>An edge will be created between them</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Navigation</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Zoom in/out:</strong> Use the zoom buttons or mouse wheel</li>
              <li><strong>Pan:</strong> Click and drag on empty canvas area</li>
              <li><strong>Reset view:</strong> Click the expand button in the zoom controls</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
