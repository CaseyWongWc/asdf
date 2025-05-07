import { useContext, useEffect, useState } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash2 } from "lucide-react";

// Edge color options
const EDGE_COLORS = [
  { name: "Gray", value: "#64748B" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#FACC15" },
  { name: "Teal", value: "#14B8A6" }
];

export default function EdgeEditModal() {
  const { edgeEditId, setEdgeEditId, setStatusMessage, setEdgeCount } = useContext(GraphContext);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [sourceNode, setSourceNode] = useState<string>("");
  const [targetNode, setTargetNode] = useState<string>("");
  const [edgeColor, setEdgeColor] = useState<string>("#64748B"); // Default gray
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (edgeEditId && window.cy) {
      const edge = window.cy.getElementById(edgeEditId);
      if (edge) {
        setEdgeWeight(parseInt(edge.data('weight') || "1", 10));
        setSourceNode(edge.data('source') || "");
        setTargetNode(edge.data('target') || "");
        
        // Get the current color of the edge
        const currentColor = edge.style('line-color') || "#64748B";
        setEdgeColor(currentColor);
      }
    }
  }, [edgeEditId]);

  const handleSave = () => {
    if (edgeEditId && window.cy) {
      const edge = window.cy.getElementById(edgeEditId);
      if (edge) {
        // Update edge data
        edge.data('weight', edgeWeight);
        
        // Update edge style
        edge.style({
          'line-color': edgeColor,
          'target-arrow-color': edgeColor
        });
        
        setStatusMessage(`Edge updated with weight ${edgeWeight}`);
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
          
          {/* Edge color selector */}
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2 mt-4' : 'grid grid-cols-4 items-center gap-4'}`}>
            <Label className={`${isMobile ? 'text-left font-medium text-base' : 'text-right'}`}>
              Line Color
            </Label>
            <div className={`${isMobile ? '' : 'col-span-3'}`}>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {EDGE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-10 rounded-md transition-all ${
                      edgeColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-blue-500' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEdgeColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  type="text" 
                  value={edgeColor} 
                  onChange={(e) => setEdgeColor(e.target.value)} 
                  className="w-32"
                  placeholder="#RRGGBB"
                />
                <div 
                  className="w-6 h-6 border border-gray-300 rounded" 
                  style={{ backgroundColor: edgeColor }}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className={isMobile ? 'flex-col space-y-2 mt-6' : 'mt-4'}>
          <Button variant="outline" onClick={handleCancel} className={isMobile ? 'w-full py-3' : ''}>Cancel</Button>
          <Button onClick={handleSave} className={isMobile ? 'w-full py-3' : ''}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
