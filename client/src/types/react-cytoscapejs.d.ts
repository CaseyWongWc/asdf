declare module 'react-cytoscapejs' {
  import { ComponentType } from 'react';
  import cytoscape from 'cytoscape';

  export interface CytoscapeComponentProps {
    cy?: (cy: cytoscape.Core) => void;
    elements: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: cytoscape.Stylesheet[] | cytoscape.StylesheetCSS[];
    layout?: cytoscape.LayoutOptions;
    zoom?: number;
    pan?: { x: number; y: number };
    minZoom?: number;
    maxZoom?: number;
    zoomingEnabled?: boolean;
    userZoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autolock?: boolean;
    autounselectify?: boolean;
    autoRefreshLayout?: boolean;
    wheelSensitivity?: number;
  }

  const CytoscapeComponent: ComponentType<CytoscapeComponentProps>;
  export default CytoscapeComponent;
}