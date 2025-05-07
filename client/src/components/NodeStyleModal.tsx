import React, { useState, useEffect, useContext } from 'react';
import { GraphContext } from '@/contexts/GraphContext';
import { useStyles, StyleScope } from '@/contexts/StyleContext';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Globe, Layers, Target } from 'lucide-react';

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
  const { 
    styleScope,
    setStyleScope,
    defaultNodeStyles,
    setDefaultNodeStyle,
    getNodeStyle,
    setNodeStyle,
    resetNodeStyles,
    resetDefaultNodeStyles
  } = useStyles();
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
  
  // Count of elements that will be affected
  const [nodeCount, setNodeStyleCount] = useState(0);
  
  // Load node settings and update counts when the dialog opens
  useEffect(() => {
    if (open && window.cy) {
      // Update node count based on scope
      if (styleScope === 'selected') {
        // Count selected nodes
        const selectedNodes = window.cy.nodes('.selected-node');
        setNodeStyleCount(selectedNodes.length);
        
        // If we have a specific node selected, load its styles
        if (nodeId) {
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
      } else if (styleScope === 'all') {
        // Count all nodes
        setNodeStyleCount(window.cy.nodes().length);
        
        // Load default node styles if no specific node is selected
        if (defaultNodeStyles) {
          setNodeColor(defaultNodeStyles.backgroundColor || '#4299E1');
          setNodeShape(defaultNodeStyles.shape || 'ellipse');
          setNodeSize([defaultNodeStyles.width || 40]);
          setBorderWidth([defaultNodeStyles.borderWidth || 2]);
          setBorderColor(defaultNodeStyles.borderColor || '#2B6CB0');
          setTextColor(defaultNodeStyles.color || '#FFFFFF');
        }
      } else if (styleScope === 'global') {
        // Global defaults affect future nodes
        setNodeStyleCount(0);
        
        // Load default node styles
        if (defaultNodeStyles) {
          setNodeColor(defaultNodeStyles.backgroundColor || '#4299E1');
          setNodeShape(defaultNodeStyles.shape || 'ellipse');
          setNodeSize([defaultNodeStyles.width || 40]);
          setBorderWidth([defaultNodeStyles.borderWidth || 2]);
          setBorderColor(defaultNodeStyles.borderColor || '#2B6CB0');
          setTextColor(defaultNodeStyles.color || '#FFFFFF');
        }
      }
    }
  }, [open, nodeId, styleScope, defaultNodeStyles]);

  const applyStyles = () => {
    if (!window.cy) {
      setStatusMessage('Graph not initialized');
      return;
    }

    // Collect styles into a style object
    const styleObj = {
      backgroundColor: nodeColor,
      shape: nodeShape,
      width: nodeSize[0],
      height: nodeSize[0],
      borderWidth: borderWidth[0],
      borderColor: borderColor,
      color: textColor,
    };

    // Text fields object
    const textFields = {
      label: nodeLabel.trim(),
      topText: topText.trim(),
      bottomText: bottomText.trim(),
    };

    // Apply based on selected scope
    if (styleScope === 'selected') {
      // Apply to selected nodes
      if (nodeId) {
        // Single node case
        const node = window.cy.getElementById(nodeId);
        if (node) {
          // Apply styles
          node.style({
            'background-color': nodeColor,
            'shape': nodeShape,
            'width': `${nodeSize[0]}px`,
            'height': `${nodeSize[0]}px`,
            'border-width': `${borderWidth[0]}px`,
            'border-color': borderColor,
            'color': textColor,
          });
          
          // Update text fields
          if (textFields.label) node.data('label', textFields.label);
          node.data('topText', textFields.topText);
          node.data('bottomText', textFields.bottomText);
          
          // Save to style context
          setNodeStyle([nodeId], 'backgroundColor', nodeColor);
          setNodeStyle([nodeId], 'shape', nodeShape);
          setNodeStyle([nodeId], 'width', nodeSize[0]);
          setNodeStyle([nodeId], 'borderWidth', borderWidth[0]);
          setNodeStyle([nodeId], 'borderColor', borderColor);
          setNodeStyle([nodeId], 'color', textColor);
          
          setStatusMessage(`Node styling updated`);
        }
      } else {
        // Multiple selected nodes
        const selectedNodes = window.cy.nodes('.selected-node');
        if (selectedNodes.length === 0) {
          setStatusMessage('No nodes selected');
          return;
        }
        
        // Collect node IDs for batch update
        const selectedIds: string[] = [];
        
        // Apply to all selected nodes
        selectedNodes.forEach((node: any) => {
          // Apply styles
          node.style({
            'background-color': nodeColor,
            'shape': nodeShape,
            'width': `${nodeSize[0]}px`,
            'height': `${nodeSize[0]}px`,
            'border-width': `${borderWidth[0]}px`,
            'border-color': borderColor,
            'color': textColor,
          });
          
          // Only update text fields if they're set and this is a single-node operation
          if (selectedNodes.length === 1) {
            if (textFields.label) node.data('label', textFields.label);
            node.data('topText', textFields.topText);
            node.data('bottomText', textFields.bottomText);
          }
          
          selectedIds.push(node.id());
        });
        
        // Batch update all styles
        setNodeStyle(selectedIds, 'backgroundColor', nodeColor);
        setNodeStyle(selectedIds, 'shape', nodeShape);
        setNodeStyle(selectedIds, 'width', nodeSize[0]);
        setNodeStyle(selectedIds, 'borderWidth', borderWidth[0]);
        setNodeStyle(selectedIds, 'borderColor', borderColor);
        setNodeStyle(selectedIds, 'color', textColor);
        
        setStatusMessage(`Updated styling for ${selectedNodes.length} nodes`);
      }
    } else if (styleScope === 'all') {
      // Apply to all nodes
      const allNodes = window.cy.nodes();
      
      // Apply to all nodes
      allNodes.forEach((node: any) => {
        node.style({
          'background-color': nodeColor,
          'shape': nodeShape,
          'width': `${nodeSize[0]}px`,
          'height': `${nodeSize[0]}px`,
          'border-width': `${borderWidth[0]}px`,
          'border-color': borderColor,
          'color': textColor,
        });
        
        // Don't modify text in batch operations
      });
      
      // Save as default style for all nodes - updating properties individually
      Object.entries(styleObj).forEach(([property, value]) => {
        setDefaultNodeStyle(property, value);
      });
      
      setStatusMessage(`Updated styling for all ${allNodes.length} nodes`);
    } else if (styleScope === 'global') {
      // Save as global default for future nodes - updating properties individually
      Object.entries(styleObj).forEach(([property, value]) => {
        setDefaultNodeStyle(property, value);
      });
      setStatusMessage('Updated default styling for new nodes');
    }
    
    onOpenChange(false);
  };

  const resetStyles = () => {
    if (!window.cy) return;
    
    // Default styles
    const defaultStyles = {
      backgroundColor: '#4299E1',
      shape: 'ellipse',
      width: 40,
      height: 40,
      borderWidth: 2,
      borderColor: '#2B6CB0',
      color: '#FFFFFF',
    };
    
    if (styleScope === 'selected') {
      if (nodeId) {
        // Reset just this node
        const targetNode = window.cy.getElementById(nodeId);
        if (!targetNode) return;
        
        // Reset to default styles
        targetNode.style({
          'background-color': defaultStyles.backgroundColor,
          'shape': defaultStyles.shape,
          'width': `${defaultStyles.width}px`,
          'height': `${defaultStyles.height}px`,
          'border-width': `${defaultStyles.borderWidth}px`,
          'border-color': defaultStyles.borderColor,
          'color': defaultStyles.color,
          'text-outline-width': '1px',
          'text-outline-color': defaultStyles.backgroundColor
        });
        
        // Reset text data for individual node
        targetNode.data('topText', '');
        targetNode.data('bottomText', '');
        
        // Reset in style context
        resetNodeStyles([nodeId]);
        
        setStatusMessage('Node style reset to default');
      } else {
        // Reset all selected nodes
        const selectedNodes = window.cy.nodes('.selected-node');
        const selectedIds: string[] = [];
        
        selectedNodes.forEach((node: any) => {
          node.style({
            'background-color': defaultStyles.backgroundColor,
            'shape': defaultStyles.shape,
            'width': `${defaultStyles.width}px`,
            'height': `${defaultStyles.height}px`,
            'border-width': `${defaultStyles.borderWidth}px`,
            'border-color': defaultStyles.borderColor,
            'color': defaultStyles.color,
            'text-outline-width': '1px',
            'text-outline-color': defaultStyles.backgroundColor
          });
          
          // Collect IDs for batch reset
          selectedIds.push(node.id());
        });
        
        // Reset all selected nodes at once
        if (selectedIds.length > 0) {
          resetNodeStyles(selectedIds);
        }
        
        setStatusMessage(`Reset styling for ${selectedNodes.length} nodes`);
      }
    } else if (styleScope === 'all' || styleScope === 'global') {
      // Reset defaults
      resetDefaultNodeStyles();
      
      if (styleScope === 'all') {
        // Reset all nodes to default
        const allNodes = window.cy.nodes();
        allNodes.forEach((node: any) => {
          node.style({
            'background-color': defaultStyles.backgroundColor,
            'shape': defaultStyles.shape,
            'width': `${defaultStyles.width}px`,
            'height': `${defaultStyles.height}px`,
            'border-width': `${defaultStyles.borderWidth}px`,
            'border-color': defaultStyles.borderColor,
            'color': defaultStyles.color,
            'text-outline-width': '1px',
            'text-outline-color': defaultStyles.backgroundColor
          });
        });
        
        setStatusMessage('All nodes reset to default style');
      } else {
        setStatusMessage('Global default node styles reset');
      }
    }
    
    // Update local state
    setNodeColor(defaultStyles.backgroundColor);
    setNodeShape(defaultStyles.shape);
    setNodeSize([defaultStyles.width]);
    setBorderWidth([defaultStyles.borderWidth]);
    setBorderColor(defaultStyles.borderColor);
    setTextColor(defaultStyles.color);
    setTopText('');
    setBottomText('');
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
            Customize the appearance of {nodeId ? 'the selected node' : 'nodes'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 md:p-6 space-y-6">
          {/* Scope selector */}
          <div className="mb-6">
            <Label className="text-base font-medium mb-2 block">Apply To:</Label>
            <RadioGroup 
              value={styleScope} 
              onValueChange={(val) => setStyleScope(val as StyleScope)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                <RadioGroupItem value="selected" id="scope-selected" />
                <Label htmlFor="scope-selected" className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Selected Only</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-purple-500" />
                  <span>All nodes</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                <RadioGroupItem value="global" id="scope-global" />
                <Label htmlFor="scope-global" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-green-500" />
                  <span>Global Default</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Current scope indicator */}
          <div className="p-2 bg-blue-50 rounded text-sm">
            {styleScope === 'selected' && (
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                <span>
                  Editing {nodeCount} selected {nodeCount === 1 ? 'node' : 'nodes'}
                </span>
              </div>
            )}
            
            {styleScope === 'all' && (
              <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2 text-purple-500" />
                <span>
                  Editing all nodes ({nodeCount})
                </span>
              </div>
            )}
            
            {styleScope === 'global' && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-green-500" />
                <span>
                  Setting default styles for new nodes
                </span>
              </div>
            )}
          </div>
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
          
          {/* Node text customization section - only for selected scope with 1 node */}
          {styleScope === 'selected' && (nodeId || (window.cy && window.cy.nodes('.selected-node').length === 1)) && (
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
          )}
        </div>
        
        <DialogFooter className="p-4 md:p-6 border-t bg-gray-50 flex justify-between">
          {/* Only show delete button for individual node editing */}
          {styleScope === 'selected' && nodeId && (
            <Button 
              variant="destructive" 
              onClick={deleteNode}
            >
              Delete Node
            </Button>
          )}
          
          {/* For other scopes, show a spacer */}
          {(styleScope !== 'selected' || !nodeId) && <div></div>}
          
          <div>
            <Button 
              variant="outline" 
              onClick={resetStyles}
              className="mr-2"
            >
              {styleScope === 'selected' ? 'Reset Selected' : 
               styleScope === 'all' ? 'Reset All Nodes' : 
               'Reset to Defaults'}
            </Button>
            <Button onClick={applyStyles}>
              {styleScope === 'selected' ? 'Apply to Selected' : 
               styleScope === 'all' ? 'Apply to All' : 
               'Set as Default'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}