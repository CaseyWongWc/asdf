import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EdgeEditModal() {
  const { edgeEditId, setEdgeEditId, setStatusMessage } = useContext(GraphContext);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Edge Weight</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edge-weight" className="text-right">
              Weight
            </Label>
            <Input
              id="edge-weight"
              type="number"
              min={0}
              step={1}
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(parseInt(e.target.value, 10) || 0)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
