import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStyles, nodeStyleProperties, edgeStyleProperties, StyleScope } from '@/contexts/StyleContext';
import StyleEditor from './StyleEditor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Sliders, Save, Upload } from 'lucide-react';

export default function StyleMenu() {
  const {
    defaultNodeStyles,
    defaultEdgeStyles,
    nodeCustomStyles,
    edgeCustomStyles,
    getNodeStyle,
    setNodeStyle,
    getEdgeStyle,
    setEdgeStyle,
    setDefaultNodeStyle,
    setDefaultEdgeStyle,
    resetNodeStyles,
    resetEdgeStyles,
    resetDefaultNodeStyles,
    resetDefaultEdgeStyles,
    saveStylePreset,
    loadStylePreset,
    availablePresets,
    styleScope,
    setStyleScope,
    activeStyleTab,
    setActiveStyleTab,
  } = useStyles();

  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [edgeModalOpen, setEdgeModalOpen] = useState(false);
  
  // Temporary state for style being edited
  const [editingNodeStyles, setEditingNodeStyles] = useState<Record<string, any>>({});
  const [editingEdgeStyles, setEditingEdgeStyles] = useState<Record<string, any>>({});
  
  // State for preset management
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  // Open node style editor
  const openNodeStyleEditor = () => {
    // Initialize with current node styles based on scope
    setEditingNodeStyles(styleScope === 'global' ? { ...defaultNodeStyles } : {});
    setNodeModalOpen(true);
  };

  // Open edge style editor
  const openEdgeStyleEditor = () => {
    // Initialize with current edge styles based on scope
    setEditingEdgeStyles(styleScope === 'global' ? { ...defaultEdgeStyles } : {});
    setEdgeModalOpen(true);
  };

  // Handle node style change
  const handleNodeStyleChange = (property: string, value: any) => {
    setEditingNodeStyles(prev => ({
      ...prev,
      [property]: value
    }));
  };

  // Handle edge style change
  const handleEdgeStyleChange = (property: string, value: any) => {
    setEditingEdgeStyles(prev => ({
      ...prev,
      [property]: value
    }));
  };

  // Apply node style changes based on scope
  const applyNodeStyles = () => {
    // Logic will depend on the scope and elements selected in CytoscapeGraph
    // Will be implemented when integrating with the graph
    setNodeModalOpen(false);
  };

  // Apply edge style changes based on scope
  const applyEdgeStyles = () => {
    // Logic will depend on the scope and elements selected in CytoscapeGraph
    // Will be implemented when integrating with the graph
    setEdgeModalOpen(false);
  };

  // Reset node styles based on scope
  const resetNodeStylesHandler = () => {
    if (styleScope === 'global') {
      resetDefaultNodeStyles();
    } else {
      // Reset for selected or all nodes
      // The actual implementation will depend on integration with CytoscapeGraph
      resetNodeStyles();
    }
  };

  // Reset edge styles based on scope
  const resetEdgeStylesHandler = () => {
    if (styleScope === 'global') {
      resetDefaultEdgeStyles();
    } else {
      // Reset for selected or all edges
      // The actual implementation will depend on integration with CytoscapeGraph
      resetEdgeStyles();
    }
  };

  // Save current preset
  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      saveStylePreset(newPresetName.trim());
      setNewPresetName('');
    }
  };

  // Load selected preset
  const handleLoadPreset = () => {
    if (selectedPreset) {
      loadStylePreset(selectedPreset);
    }
  };

  return (
    <div className="p-2">
      <Tabs defaultValue="node" onValueChange={(val) => setActiveStyleTab(val as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="node" className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            Node Styles
          </TabsTrigger>
          <TabsTrigger value="edge" className="flex items-center gap-1">
            <div className="w-4 h-[2px] bg-yellow-500"></div>
            Edge Styles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="node" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Node Styling</h3>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={openNodeStyleEditor}
            >
              <Palette className="h-4 w-4" />
              Open Editor
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div 
                className="h-8 rounded border"
                style={{ backgroundColor: defaultNodeStyles.backgroundColor }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shape</label>
              <select
                className="w-full px-2 py-1 text-sm border rounded"
                value={defaultNodeStyles.shape}
                disabled
              >
                <option>{defaultNodeStyles.shape}</option>
              </select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="edge" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Edge Styling</h3>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={openEdgeStyleEditor}
            >
              <Sliders className="h-4 w-4" />
              Open Editor
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div 
                className="h-8 rounded border"
                style={{ backgroundColor: defaultEdgeStyles.lineColor }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <select
                className="w-full px-2 py-1 text-sm border rounded"
                value={defaultEdgeStyles.lineStyle}
                disabled
              >
                <option>{defaultEdgeStyles.lineStyle}</option>
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Presets section */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="font-medium mb-3">Style Presets</h3>
        
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="New preset name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                {availablePresets.map(preset => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleLoadPreset}
              disabled={!selectedPreset}
            >
              <Upload className="h-4 w-4" />
              Load
            </Button>
          </div>
        </div>
      </div>
      
      {/* Node Style Editor Modal */}
      <StyleEditor
        properties={nodeStyleProperties}
        values={editingNodeStyles}
        onChange={handleNodeStyleChange}
        title="Node"
        scope={styleScope}
        onScopeChange={setStyleScope}
        elementCount={0} // Will be populated when integrated with graph
        selectedCount={0} // Will be populated when integrated with graph
        onReset={resetNodeStylesHandler}
        onCancel={() => setNodeModalOpen(false)}
        onApply={applyNodeStyles}
        isOpen={nodeModalOpen}
        onClose={() => setNodeModalOpen(false)}
      />
      
      {/* Edge Style Editor Modal */}
      <StyleEditor
        properties={edgeStyleProperties}
        values={editingEdgeStyles}
        onChange={handleEdgeStyleChange}
        title="Edge"
        scope={styleScope}
        onScopeChange={setStyleScope}
        elementCount={0} // Will be populated when integrated with graph
        selectedCount={0} // Will be populated when integrated with graph
        onReset={resetEdgeStylesHandler}
        onCancel={() => setEdgeModalOpen(false)}
        onApply={applyEdgeStyles}
        isOpen={edgeModalOpen}
        onClose={() => setEdgeModalOpen(false)}
      />
    </div>
  );
}