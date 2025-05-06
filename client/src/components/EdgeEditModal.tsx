import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash2 } from "lucide-react";

export default function EdgeEditModal() {
  const { edgeEditId, setEdgeEditId, setStatusMessage, setEdgeCount } = useContext(GraphContext);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [sourceNode, setSourceNode] = useState<string>("");
  const [targetNode, setTargetNode] = useState<string>("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (edgeEditId && window.cy) {
      const edge = window.cy.getElementById(edgeEditId);
      if (edge) {
        setEdgeWeight(parseInt(edge.data('weight') || "1", 10));
        setSourceNode(edge.data('source') || "");
        setTargetNode(edge.data('target') || "");
      }
    }
  }, [edgeEditId]);

  const handleSave = () => {
    if (edgeEditId && window.cy) {
      const edge = window.cy.getElementById(edgeEditId);
      if (edge) {
        edge.data('weight', edgeWeight);
        setStatusMessage(`Edge weight updated to ${edgeWeight}`);
      }
    }
    setEdgeEditId(null);
  };

  const handleCancel = () => {
    setEdgeEditId(null);
  };
  
  const handleDelete = () => {
    if (edgeEditId && window.cy) {
      const edge = window.cy.getElementById(edgeEditId);
      if (edge) {
        // Get source and target node labels for better feedback
        const sourceNodeLabel = window.cy.getElementById(sourceNode).data('label') || sourceNode;
        const targetNodeLabel = window.cy.getElementById(targetNode).data('label') || targetNode;
        
        // Delete the edge
        edge.remove();
        
        // Update the edge count
        setEdgeCount(window.cy.edges().length);
        
        // Update status
        setStatusMessage(`Edge from "${sourceNodeLabel}" to "${targetNodeLabel}" deleted`);
        setEdgeEditId(null);
      }
    }
  };

  return (
    <Dialog open={!!edgeEditId} onOpenChange={(open) => !open && setEdgeEditId(null)}>
      <DialogContent className={`${isMobile ? 'max-w-[90%]' : 'sm:max-w-[425px]'}`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className={isMobile ? 'text-xl' : ''}>Edit Edge</DialogTitle>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            className="h-8 w-8 p-0"
            title="Delete Edge"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="edge-id" className={isMobile ? 'text-left text-base' : 'text-right'}>
              ID
            </Label>
            <Input
              id="edge-id"
              value={edgeEditId || ""}
              disabled
              className={`${isMobile ? '' : 'col-span-3'} bg-gray-100`}
              size={isMobile ? 30 : undefined}
            />
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="edge-source" className={isMobile ? 'text-left text-base' : 'text-right'}>
              From
            </Label>
            <Input
              id="edge-source"
              value={sourceNode ? window.cy?.getElementById(sourceNode)?.data('label') || sourceNode : ""}
              disabled
              className={`${isMobile ? '' : 'col-span-3'} bg-gray-100`}
              size={isMobile ? 30 : undefined}
            />
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="edge-target" className={isMobile ? 'text-left text-base' : 'text-right'}>
              To
            </Label>
            <Input
              id="edge-target"
              value={targetNode ? window.cy?.getElementById(targetNode)?.data('label') || targetNode : ""}
              disabled
              className={`${isMobile ? '' : 'col-span-3'} bg-gray-100`}
              size={isMobile ? 30 : undefined}
            />
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="edge-weight" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Weight
            </Label>
            <Input
              id="edge-weight"
              type="number"
              min={0}
              step={1}
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(parseInt(e.target.value, 10) || 0)}
              className={isMobile ? '' : 'col-span-3'}
              autoFocus
              size={isMobile ? 30 : undefined}
            />
          </div>
        </div>
        <DialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
          <Button variant="outline" onClick={handleCancel} className={isMobile ? 'w-full py-3' : ''}>Cancel</Button>
          <Button onClick={handleSave} className={isMobile ? 'w-full py-3' : ''}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
