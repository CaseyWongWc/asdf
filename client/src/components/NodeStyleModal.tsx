import React, { useState, useEffect, useContext } from 'react';
import { GraphContext } from '@/contexts/GraphContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

// Define node style options
const NODE_COLORS = [
  { name: 'Blue', value: '#4299E1' },
  { name: 'Green', value: '#48BB78' },
  { name: 'Red', value: '#F56565' },
  { name: 'Purple', value: '#9F7AEA' },
  { name: 'Orange', value: '#ED8936' },
  { name: 'Teal', value: '#38B2AC' },
  { name: 'Pink', value: '#ED64A6' },
  { name: 'Gray', value: '#718096' },
];

const NODE_SHAPES = [
  { name: 'Circle', value: 'ellipse' },
  { name: 'Square', value: 'rectangle' },
  { name: 'Diamond', value: 'rhomboid' },
  { name: 'Triangle', value: 'triangle' },
  { name: 'Hexagon', value: 'hexagon' },
  { name: 'Star', value: 'star' },
];

interface NodeStyleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string | null;
}

export default function NodeStyleModal({ open, onOpenChange, nodeId }: NodeStyleModalProps) {
  const { setStatusMessage, setNodeCount, setEdgeCount } = useContext(GraphContext);
  const isMobile = useIsMobile();
  
  // Node style state
  const [nodeColor, setNodeColor] = useState('#4299E1');
  const [nodeShape, setNodeShape] = useState('ellipse');
  const [nodeSize, setNodeSize] = useState([40]); // Default is 40px
  const [borderWidth, setBorderWidth] = useState([2]); // Default is 2px
  const [borderColor, setBorderColor] = useState('#2B6CB0');
  const [textColor, setTextColor] = useState('#FFFFFF');
  
  // Node text fields
  const [nodeLabel, setNodeLabel] = useState('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  
  // Load node settings when the dialog opens and a node is selected
  useEffect(() => {
    if (open && nodeId && window.cy) {
      const node = window.cy.getElementById(nodeId);
      if (node) {
        // Get current styles
        setNodeColor(node.style('background-color') || '#4299E1');
        setNodeShape(node.style('shape') || 'ellipse');
        
        // Parse sizes (remove 'px' suffix)
        const width = node.style('width') || '40px';
        setNodeSize([parseInt(width.replace('px', ''), 10)]);
        
        const border = node.style('border-width') || '2px';
        setBorderWidth([parseInt(border.replace('px', ''), 10)]);
        
        setBorderColor(node.style('border-color') || '#2B6CB0');
        setTextColor(node.style('color') || '#FFFFFF');
        
        // Get text fields
        setNodeLabel(node.data('label') || '');
        setTopText(node.data('topText') || '');
        setBottomText(node.data('bottomText') || '');
      }
    }
  }, [open, nodeId]);

  const applyStyles = () => {
    if (!nodeId || !window.cy) {
      setStatusMessage('No node selected for styling');
      return;
    }

    const node = window.cy.getElementById(nodeId);
    if (!node) {
      setStatusMessage('Selected node not found');
      return;
    }

    // Apply all styling changes at once
    node.style({
      'background-color': nodeColor,
      'shape': nodeShape,
      'width': `${nodeSize[0]}px`,
      'height': `${nodeSize[0]}px`, // Keep it square for now
      'border-width': `${borderWidth[0]}px`,
      'border-color': borderColor,
      'color': textColor,
    });
    
    // Update node data with label, top text and bottom text
    if (nodeLabel.trim()) {
      node.data('label', nodeLabel.trim());
    }
    
    // Just store the text values directly in node data
    // The styling will take care of rendering them
    node.data('topText', topText.trim());
    node.data('bottomText', bottomText.trim());

    setStatusMessage(`Node styling updated`);
    onOpenChange(false);
  };

  const resetStyles = () => {
    if (!nodeId || !window.cy) return;
    
    const targetNode = window.cy.getElementById(nodeId);
    if (!targetNode) return;
    
    // Reset to default styles
    targetNode.style({
      'background-color': '#4299E1',
      'shape': 'ellipse',
      'width': '40px',
      'height': '40px',
      'border-width': '2px',
      'border-color': '#2B6CB0',
      'color': '#FFFFFF',
      'text-outline-width': '1px',
      'text-outline-color': '#4299E1'
    });
    
    // Reset node text data - this will remove top and bottom text
    targetNode.data('topText', '');
    targetNode.data('bottomText', '');
    targetNode.data('hasBottomText', false); // Clear flag
    
    // Update local state
    setNodeColor('#4299E1');
    setNodeShape('ellipse');
    setNodeSize([40]);
    setBorderWidth([2]);
    setBorderColor('#2B6CB0');
    setTextColor('#FFFFFF');
    setTopText('');
    setBottomText('');
    
    setStatusMessage('Node style reset to default');
  };
  
  const deleteNode = () => {
    if (!nodeId || !window.cy) return;
    
    const targetNode = window.cy.getElementById(nodeId);
    if (!targetNode) return;
    
    const nodeLabel = targetNode.data('label');
    
    // Remove the node and its connected edges
    targetNode.remove();
    
    // Update counts
    if (window.cy) {
      setNodeCount(window.cy.nodes().length);
      setEdgeCount(window.cy.edges().length);
    }
    
    setStatusMessage(`Node "${nodeLabel}" deleted`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 md:p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Node Style Options</DialogTitle>
          <DialogDescription>
            Customize the appearance of the selected node
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 md:p-6 space-y-6">
          {/* Node color selector */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Node Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {NODE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`h-12 rounded-md transition-all ${
                    nodeColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-blue-500' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setNodeColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Input 
                type="text" 
                value={nodeColor} 
                onChange={(e) => setNodeColor(e.target.value)} 
                className="w-32"
              />
              <div 
                className="w-6 h-6 border border-gray-300 rounded" 
                style={{ backgroundColor: nodeColor }}
              />
            </div>
          </div>
          
          {/* Node shape selector */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Node Shape</Label>
            <div className="grid grid-cols-3 gap-2">
              {NODE_SHAPES.map((shape) => (
                <button
                  key={shape.value}
                  type="button"
                  className={`p-3 border rounded-md text-center transition-colors ${
                    nodeShape === shape.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setNodeShape(shape.value)}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Node size slider */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Node Size: {nodeSize[0]}px
            </Label>
            <Slider
              value={nodeSize}
              onValueChange={setNodeSize}
              min={20}
              max={80}
              step={5}
              className="w-full"
            />
          </div>
          
          {/* Border width slider */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Border Width: {borderWidth[0]}px
            </Label>
            <Slider
              value={borderWidth}
              onValueChange={setBorderWidth}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Border color */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Border Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {NODE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`h-10 rounded-md transition-all ${
                    borderColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-blue-500' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setBorderColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Input 
                type="text" 
                value={borderColor} 
                onChange={(e) => setBorderColor(e.target.value)} 
                className="w-32"
              />
              <div 
                className="w-6 h-6 border border-gray-300 rounded" 
                style={{ backgroundColor: borderColor }}
              />
            </div>
          </div>
          
          {/* Text color */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Text Color</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                className={`h-10 rounded-md transition-all bg-white ${
                  textColor === '#FFFFFF' 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : 'hover:scale-105'
                } border border-gray-300`}
                onClick={() => setTextColor('#FFFFFF')}
                title="White"
              />
              <button
                type="button"
                className={`h-10 rounded-md transition-all bg-black ${
                  textColor === '#000000' 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setTextColor('#000000')}
                title="Black"
              />
              <button
                type="button"
                className={`h-10 rounded-md transition-all bg-gray-700 ${
                  textColor === '#2D3748' 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setTextColor('#2D3748')}
                title="Dark Gray"
              />
              <button
                type="button"
                className={`h-10 rounded-md transition-all bg-yellow-300 ${
                  textColor === '#FEFCBF' 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setTextColor('#FEFCBF')}
                title="Yellow"
              />
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Input 
                type="text" 
                value={textColor} 
                onChange={(e) => setTextColor(e.target.value)} 
                className="w-32"
              />
              <div 
                className="w-6 h-6 border border-gray-300 rounded" 
                style={{ backgroundColor: textColor }}
              />
            </div>
          </div>
          
          {/* Node text customization section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-base font-medium mb-4">Node Text Customization</h3>
            
            {/* Node Label (main text) */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="node-label" className="text-sm font-medium">
                <span className="font-bold">Main Label</span> (center)
              </Label>
              <Input
                id="node-label"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="Main node label/name"
                className="w-full font-medium"
              />
            </div>
            
            {/* Top Text */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="top-text" className="text-sm font-medium">
                Top Text
              </Label>
              <Input
                id="top-text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Text displayed above node"
                className="w-full"
              />
            </div>
            
            {/* Bottom Text */}
            <div className="space-y-2">
              <Label htmlFor="bottom-text" className="text-sm font-medium">
                Bottom Text
              </Label>
              <Input
                id="bottom-text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Text displayed below node"
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="p-4 md:p-6 border-t bg-gray-50 flex justify-between">
          <Button 
            variant="destructive" 
            onClick={deleteNode}
          >
            Delete Node
          </Button>
          
          <div>
            <Button 
              variant="outline" 
              onClick={resetStyles}
              className="mr-2"
            >
              Reset to Default
            </Button>
            <Button onClick={applyStyles}>
              Apply Styles
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}