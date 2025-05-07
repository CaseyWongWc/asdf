import { useState, useContext } from 'react';
import { GraphContext } from '@/contexts/GraphContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

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
  const { setStatusMessage } = useContext(GraphContext);
  const [nodeColor, setNodeColor] = useState('#4299E1');
  const [nodeShape, setNodeShape] = useState('ellipse');
  const [nodeSize, setNodeSize] = useState([40]); // Default is 40px
  const [borderWidth, setBorderWidth] = useState([2]); // Default is 2px
  const [borderColor, setBorderColor] = useState('#2B6CB0');
  const [textColor, setTextColor] = useState('#FFFFFF');
  
  // Load node settings when the dialog opens
  useState(() => {
    if (open && nodeId && window.cy) {
      const node = window.cy.getElementById(nodeId);
      if (node) {
        setNodeColor(node.style('background-color') || '#4299E1');
        setNodeShape(node.style('shape') || 'ellipse');
        setNodeSize([parseInt(node.style('width') || '40', 10)]);
        setBorderWidth([parseInt(node.style('border-width') || '2', 10)]);
        setBorderColor(node.style('border-color') || '#2B6CB0');
        setTextColor(node.style('color') || '#FFFFFF');
      }
    }
  });

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

    setStatusMessage(`Node styling updated`);
    onOpenChange(false);
  };

  const resetStyles = () => {
    if (!nodeId || !window.cy) return;
    
    const node = window.cy.getElementById(nodeId);
    if (!node) return;
    
    // Reset to default styles
    node.style({
      'background-color': '#4299E1',
      'shape': 'ellipse',
      'width': '40px',
      'height': '40px',
      'border-width': '2px',
      'border-color': '#2B6CB0',
      'color': '#FFFFFF',
    });
    
    // Update local state
    setNodeColor('#4299E1');
    setNodeShape('ellipse');
    setNodeSize([40]);
    setBorderWidth([2]);
    setBorderColor('#2B6CB0');
    setTextColor('#FFFFFF');
    
    setStatusMessage('Node style reset to default');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 md:p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Node Style Options</DialogTitle>
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
        </div>
        
        <DialogFooter className="p-4 md:p-6 border-t bg-gray-50">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}