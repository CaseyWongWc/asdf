import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NodeEditModal() {
  const { nodeEditId, setNodeEditId, statusMessage, setStatusMessage } = useContext(GraphContext);
  const [nodeLabel, setNodeLabel] = useState("");
  const isMobile = useIsMobile();
  
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
      <DialogContent className={`${isMobile ? 'max-w-[90%]' : 'sm:max-w-[425px]'}`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? 'text-xl' : ''}>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-label" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Node Label
            </Label>
            <Input
              id="node-label"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
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
