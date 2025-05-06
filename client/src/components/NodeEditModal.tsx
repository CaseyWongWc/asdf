import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NodeEditModal() {
  const { nodeEditId, setNodeEditId, statusMessage, setStatusMessage } = useContext(GraphContext);
  const [nodeLabel, setNodeLabel] = useState("");
  
  useEffect(() => {
    if (nodeEditId && window.cy) {
      const node = window.cy.getElementById(nodeEditId);
      if (node) {
        setNodeLabel(node.data('label') || "");
      }
    }
  }, [nodeEditId]);

  const handleSave = () => {
    if (nodeLabel.trim() && nodeEditId && window.cy) {
      const node = window.cy.getElementById(nodeEditId);
      if (node) {
        node.data('label', nodeLabel.trim());
        setStatusMessage(`Node renamed to "${nodeLabel.trim()}"`);
      }
    }
    setNodeEditId(null);
  };

  const handleCancel = () => {
    setNodeEditId(null);
  };

  return (
    <Dialog open={!!nodeEditId} onOpenChange={(open) => !open && setNodeEditId(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="node-label" className="text-right">
              Node Label
            </Label>
            <Input
              id="node-label"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
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
