import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash2 } from "lucide-react";

export default function NodeEditModal() {
  const { nodeEditId, setNodeEditId, statusMessage, setStatusMessage, setNodeCount, setEdgeCount } = useContext(GraphContext);
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [nodeColor, setNodeColor] = useState("#64748b");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (nodeEditId && window.cy) {
      const node = window.cy.getElementById(nodeEditId);
      if (node) {
        setNodeLabel(node.data('label') || "");
        setNodeDescription(node.data('description') || "");
        setTopText(node.data('topText') || "");
        setBottomText(node.data('bottomText') || "");
        setNodeColor(node.style('background-color') || "#64748b");
      }
    }
  }, [nodeEditId]);

  const handleSave = () => {
    if (nodeLabel.trim() && nodeEditId && window.cy) {
      const node = window.cy.getElementById(nodeEditId);
      if (node) {
        node.data('label', nodeLabel.trim());
        node.data('description', nodeDescription.trim());
        node.data('topText', topText.trim());
        node.data('bottomText', bottomText.trim());
        node.style('background-color', nodeColor);
        setStatusMessage(`Node "${nodeLabel.trim()}" updated`);
      }
    }
    setNodeEditId(null);
  };

  const handleCancel = () => {
    setNodeEditId(null);
  };
  
  const handleDelete = () => {
    if (nodeEditId && window.cy) {
      const node = window.cy.getElementById(nodeEditId);
      if (node) {
        const nodeLabel = node.data('label');
        // Create an explosion animation effect for fun
        const pos = node.position();
        
        // First remove any connected edges to prevent errors
        const connectedEdges = node.connectedEdges();
        connectedEdges.remove();
        
        // Then remove the node
        node.remove();
        
        // Update counts
        setNodeCount(window.cy.nodes().length);
        setEdgeCount(window.cy.edges().length);
        
        setStatusMessage(`Node "${nodeLabel}" deleted`);
        setNodeEditId(null);
      }
    }
  };

  return (
    <Dialog open={!!nodeEditId} onOpenChange={(open) => !open && setNodeEditId(null)}>
      <DialogContent className={`${isMobile ? 'max-w-[90%]' : 'sm:max-w-[425px]'}`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className={isMobile ? 'text-xl' : ''}>Edit Node</DialogTitle>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            className="h-8 w-8 p-0"
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-label" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Label
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
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-id" className={isMobile ? 'text-left text-base' : 'text-right'}>
              ID
            </Label>
            <Input
              id="node-id"
              value={nodeEditId || ""}
              disabled
              className={`${isMobile ? '' : 'col-span-3'} bg-gray-100`}
              size={isMobile ? 30 : undefined}
            />
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-top-text" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Top Text
            </Label>
            <Input
              id="node-top-text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className={isMobile ? '' : 'col-span-3'}
              size={isMobile ? 30 : undefined}
              placeholder="Text displayed above node"
            />
          </div>

          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-description" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Description
            </Label>
            <Input
              id="node-description"
              value={nodeDescription}
              onChange={(e) => setNodeDescription(e.target.value)}
              className={isMobile ? '' : 'col-span-3'}
              size={isMobile ? 30 : undefined}
            />
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-bottom-text" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Bottom Text
            </Label>
            <Input
              id="node-bottom-text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              className={isMobile ? '' : 'col-span-3'}
              size={isMobile ? 30 : undefined}
              placeholder="Text displayed below node"
            />
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label htmlFor="node-color" className={isMobile ? 'text-left text-base' : 'text-right'}>
              Color
            </Label>
            <div className={`flex items-center gap-2 ${isMobile ? '' : 'col-span-3'}`}>
              <input
                type="color"
                id="node-color"
                value={nodeColor}
                onChange={(e) => setNodeColor(e.target.value)}
                className="w-10 h-8 cursor-pointer"
              />
              <Input
                value={nodeColor}
                onChange={(e) => setNodeColor(e.target.value)}
                className="flex-1"
                size={isMobile ? 25 : undefined}
              />
            </div>
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
