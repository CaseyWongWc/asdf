import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

export default function EdgeEditModal() {
  const { edgeEditId, setEdgeEditId, setStatusMessage } = useContext(GraphContext);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (edgeEditId && window.cy) {
      const edge = window.cy.getElementById(edgeEditId);
      if (edge) {
        setEdgeWeight(parseInt(edge.data('weight') || "1", 10));
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

  return (
    <Dialog open={!!edgeEditId} onOpenChange={(open) => !open && setEdgeEditId(null)}>
      <DialogContent className={`${isMobile ? 'max-w-[90%]' : 'sm:max-w-[425px]'}`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? 'text-xl' : ''}>Edit Edge Weight</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button onClick={handleSave} className={isMobile ? 'w-full py-3' : ''}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
