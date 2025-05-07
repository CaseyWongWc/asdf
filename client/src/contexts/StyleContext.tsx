import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define style property types
export interface StyleProperty {
  id: string;
  name: string;
  type: 'color' | 'number' | 'text' | 'select' | 'boolean';
  default: any;
  options?: string[]; // For select type
  min?: number;       // For number type
  max?: number;       // For number type
  step?: number;      // For number type
  unit?: string;      // For number type (px, em, etc.)
}

// Define node style properties
export const nodeStyleProperties: StyleProperty[] = [
  { id: 'backgroundColor', name: 'Common Color', type: 'color', default: '#3B82F6' },
  { id: 'borderColor', name: 'Stroke Color', type: 'color', default: '#FACC15' },
  { id: 'borderWidth', name: 'Thickness', type: 'number', default: 2, min: 0, max: 10, step: 1 },
  { id: 'fontSize', name: 'Text size', type: 'number', default: 16, min: 8, max: 36, step: 1 },
  { id: 'color', name: 'Text Color', type: 'color', default: '#FACC15' },
  { id: 'secondaryColor', name: 'Another text color', type: 'color', default: '#14B8A6' },
  { id: 'textPosition', name: 'Text position', type: 'select', default: 'Center', options: ['Center', 'Top', 'Bottom'] },
  { id: 'shape', name: 'Shape', type: 'select', default: 'Circle', options: ['Circle', 'Rectangle', 'Diamond', 'Ellipse'] },
  { id: 'width', name: 'Vertex size', type: 'number', default: 30, min: 10, max: 100, step: 5 },
];

// Define edge style properties
export const edgeStyleProperties: StyleProperty[] = [
  { id: 'lineColor', name: 'Common Color', type: 'color', default: '#FACC15' },
  { id: 'fontSize', name: 'Text size', type: 'number', default: 16, min: 8, max: 36, step: 1 },
  { id: 'color', name: 'Text Color', type: 'color', default: '#FACC15' },
  { id: 'secondaryColor', name: 'Another text color', type: 'color', default: '#D8B4FE' },
  { id: 'weightPosition', name: 'Weight position', type: 'select', default: 'Center', options: ['Center', 'Source', 'Target'] },
  { id: 'textBackgroundColor', name: 'Text background', type: 'color', default: '#EC4899' },
  { id: 'lineStyle', name: 'Edge style', type: 'select', default: 'Solid', options: ['Solid', 'Dotted', 'Dashed'] },
  { id: 'width', name: 'Edge width', type: 'number', default: 4, min: 1, max: 10, step: 1 },
];

// Style scope type
export type StyleScope = 'selected' | 'all' | 'global';

// Style context interface
export interface StyleContextProps {
  // Default styles
  defaultNodeStyles: Record<string, any>;
  defaultEdgeStyles: Record<string, any>;
  
  // Custom styles for specific elements
  nodeCustomStyles: Record<string, Record<string, any>>;
  edgeCustomStyles: Record<string, Record<string, any>>;
  
  // Style operations
  getNodeStyle: (nodeId: string, property: string) => any;
  setNodeStyle: (nodeIds: string[], property: string, value: any) => void;
  getEdgeStyle: (edgeId: string, property: string) => any;
  setEdgeStyle: (edgeIds: string[], property: string, value: any) => void;
  
  // Set default styles
  setDefaultNodeStyle: (property: string, value: any) => void;
  setDefaultEdgeStyle: (property: string, value: any) => void;
  
  // Reset functions
  resetNodeStyles: (nodeIds?: string[]) => void;
  resetEdgeStyles: (edgeIds?: string[]) => void;
  resetDefaultNodeStyles: () => void;
  resetDefaultEdgeStyles: () => void;
  
  // Style presets
  saveStylePreset: (name: string) => void;
  loadStylePreset: (name: string) => void;
  availablePresets: string[];
  
  // Current style scope
  styleScope: StyleScope;
  setStyleScope: (scope: StyleScope) => void;
  
  // Current style tab
  activeStyleTab: 'node' | 'edge' | 'global';
  setActiveStyleTab: (tab: 'node' | 'edge' | 'global') => void;
}

// Initial default styles
const initialNodeStyles = nodeStyleProperties.reduce((acc, prop) => {
  acc[prop.id] = prop.default;
  return acc;
}, {} as Record<string, any>);

const initialEdgeStyles = edgeStyleProperties.reduce((acc, prop) => {
  acc[prop.id] = prop.default;
  return acc;
}, {} as Record<string, any>);

// Create the context
export const StyleContext = createContext<StyleContextProps>({
  defaultNodeStyles: initialNodeStyles,
  defaultEdgeStyles: initialEdgeStyles,
  nodeCustomStyles: {},
  edgeCustomStyles: {},
  getNodeStyle: () => undefined,
  setNodeStyle: () => {},
  getEdgeStyle: () => undefined,
  setEdgeStyle: () => {},
  setDefaultNodeStyle: () => {},
  setDefaultEdgeStyle: () => {},
  resetNodeStyles: () => {},
  resetEdgeStyles: () => {},
  resetDefaultNodeStyles: () => {},
  resetDefaultEdgeStyles: () => {},
  saveStylePreset: () => {},
  loadStylePreset: () => {},
  availablePresets: [],
  styleScope: 'selected',
  setStyleScope: () => {},
  activeStyleTab: 'node',
  setActiveStyleTab: () => {},
});

// Provider component
interface StyleProviderProps {
  children: ReactNode;
}

export const StyleProvider = ({ children }: StyleProviderProps) => {
  // State for default styles
  const [defaultNodeStyles, setDefaultNodeStylesState] = useState<Record<string, any>>(initialNodeStyles);
  const [defaultEdgeStyles, setDefaultEdgeStylesState] = useState<Record<string, any>>(initialEdgeStyles);
  
  // State for custom styles
  const [nodeCustomStyles, setNodeCustomStyles] = useState<Record<string, Record<string, any>>>({});
  const [edgeCustomStyles, setEdgeCustomStyles] = useState<Record<string, Record<string, any>>>({});
  
  // State for presets
  const [availablePresets, setAvailablePresets] = useState<string[]>([]);
  
  // State for style scope and active tab
  const [styleScope, setStyleScope] = useState<StyleScope>('selected');
  const [activeStyleTab, setActiveStyleTab] = useState<'node' | 'edge' | 'global'>('node');
  
  // Load saved styles from localStorage on mount
  useEffect(() => {
    const storedStyles = localStorage.getItem('graphStyles');
    if (storedStyles) {
      try {
        const parsedStyles = JSON.parse(storedStyles);
        if (parsedStyles.nodeDefaults) setDefaultNodeStylesState(parsedStyles.nodeDefaults);
        if (parsedStyles.edgeDefaults) setDefaultEdgeStylesState(parsedStyles.edgeDefaults);
        if (parsedStyles.nodeCustom) setNodeCustomStyles(parsedStyles.nodeCustom);
        if (parsedStyles.edgeCustom) setEdgeCustomStyles(parsedStyles.edgeCustom);
      } catch (e) {
        console.error('Error loading saved styles:', e);
      }
    }
    
    // Load available presets
    const presetsList = localStorage.getItem('stylePresets');
    if (presetsList) {
      try {
        setAvailablePresets(JSON.parse(presetsList));
      } catch (e) {
        console.error('Error loading style presets list:', e);
      }
    }
  }, []);
  
  // Save styles whenever they change
  useEffect(() => {
    const styles = {
      nodeDefaults: defaultNodeStyles,
      edgeDefaults: defaultEdgeStyles,
      nodeCustom: nodeCustomStyles,
      edgeCustom: edgeCustomStyles,
    };
    
    localStorage.setItem('graphStyles', JSON.stringify(styles));
  }, [defaultNodeStyles, defaultEdgeStyles, nodeCustomStyles, edgeCustomStyles]);
  
  // Get resolved node style (with inheritance)
  const getNodeStyle = (nodeId: string, property: string): any => {
    // Check for node-specific style
    const nodeCustomStyle = nodeCustomStyles[nodeId]?.[property];
    if (nodeCustomStyle !== undefined) return nodeCustomStyle;
    
    // Fall back to default node style
    return defaultNodeStyles[property];
  };
  
  // Get resolved edge style (with inheritance)
  const getEdgeStyle = (edgeId: string, property: string): any => {
    // Check for edge-specific style
    const edgeCustomStyle = edgeCustomStyles[edgeId]?.[property];
    if (edgeCustomStyle !== undefined) return edgeCustomStyle;
    
    // Fall back to default edge style
    return defaultEdgeStyles[property];
  };
  
  // Set style for specific nodes
  const setNodeStyle = (nodeIds: string[], property: string, value: any) => {
    setNodeCustomStyles(prev => {
      const updated = { ...prev };
      
      nodeIds.forEach(nodeId => {
        if (!updated[nodeId]) {
          updated[nodeId] = {};
        }
        updated[nodeId] = {
          ...updated[nodeId],
          [property]: value
        };
      });
      
      return updated;
    });
  };
  
  // Set style for specific edges
  const setEdgeStyle = (edgeIds: string[], property: string, value: any) => {
    setEdgeCustomStyles(prev => {
      const updated = { ...prev };
      
      edgeIds.forEach(edgeId => {
        if (!updated[edgeId]) {
          updated[edgeId] = {};
        }
        updated[edgeId] = {
          ...updated[edgeId],
          [property]: value
        };
      });
      
      return updated;
    });
  };
  
  // Set default style for all nodes
  const setDefaultNodeStyle = (property: string, value: any) => {
    setDefaultNodeStylesState(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  // Set default style for all edges
  const setDefaultEdgeStyle = (property: string, value: any) => {
    setDefaultEdgeStylesState(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  // Reset styles for specific nodes
  const resetNodeStyles = (nodeIds?: string[]) => {
    if (!nodeIds || nodeIds.length === 0) {
      // Reset all node custom styles
      setNodeCustomStyles({});
    } else {
      // Reset specific nodes
      setNodeCustomStyles(prev => {
        const updated = { ...prev };
        nodeIds.forEach(id => {
          delete updated[id];
        });
        return updated;
      });
    }
  };
  
  // Reset styles for specific edges
  const resetEdgeStyles = (edgeIds?: string[]) => {
    if (!edgeIds || edgeIds.length === 0) {
      // Reset all edge custom styles
      setEdgeCustomStyles({});
    } else {
      // Reset specific edges
      setEdgeCustomStyles(prev => {
        const updated = { ...prev };
        edgeIds.forEach(id => {
          delete updated[id];
        });
        return updated;
      });
    }
  };
  
  // Reset default node styles to initial values
  const resetDefaultNodeStyles = () => {
    setDefaultNodeStylesState(initialNodeStyles);
  };
  
  // Reset default edge styles to initial values
  const resetDefaultEdgeStyles = () => {
    setDefaultEdgeStylesState(initialEdgeStyles);
  };
  
  // Save current styles as a preset
  const saveStylePreset = (name: string) => {
    const preset = {
      name,
      nodeDefaults: defaultNodeStyles,
      edgeDefaults: defaultEdgeStyles,
    };
    
    // Save preset
    localStorage.setItem(`stylePreset_${name}`, JSON.stringify(preset));
    
    // Update presets list
    const updatedPresets = [...availablePresets];
    if (!updatedPresets.includes(name)) {
      updatedPresets.push(name);
      setAvailablePresets(updatedPresets);
      localStorage.setItem('stylePresets', JSON.stringify(updatedPresets));
    }
  };
  
  // Load a saved preset
  const loadStylePreset = (name: string) => {
    const presetData = localStorage.getItem(`stylePreset_${name}`);
    if (presetData) {
      try {
        const preset = JSON.parse(presetData);
        if (preset.nodeDefaults) setDefaultNodeStylesState(preset.nodeDefaults);
        if (preset.edgeDefaults) setDefaultEdgeStylesState(preset.edgeDefaults);
      } catch (e) {
        console.error(`Error loading preset "${name}":`, e);
      }
    }
  };
  
  // Context value
  const value: StyleContextProps = {
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
  };
  
  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  );
};

// Custom hook to use the style context
export const useStyles = () => useContext(StyleContext);

// Helper function to map style properties to Cytoscape style properties
export function mapStylePropToCytoscape(property: string, value: any): Record<string, any> {
  const mappings: Record<string, string> = {
    'backgroundColor': 'background-color',
    'borderColor': 'border-color',
    'borderWidth': 'border-width',
    'fontSize': 'font-size',
    'color': 'color',
    'shape': 'shape',
    'width': 'width',
    'lineColor': 'line-color',
    'lineStyle': 'line-style',
    // Add other mappings as needed
  };
  
  const result: Record<string, any> = {};
  result[mappings[property] || property] = value;
  return result;
}