import React, { useRef, useContext, useEffect, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { GraphContext } from "../contexts/GraphContext";
import { useIsMobile } from "../hooks/use-mobile";

declare global {
  interface Window {
    cy: any;
  }
}

export default function CytoscapeGraph() {
  const cyRef = useRef<any>(null);
  const isMobile = useIsMobile();
  const {
    elements,
    layout,
    stylesheet,
    setStatusMessage,
    setNodeCount,
    setEdgeCount,
  } = useContext(GraphContext);

  useEffect(() => {
    if (cyRef.current) {
      window.cy = cyRef.current;
    }
  }, [cyRef]);

  const safeElements = Array.isArray(elements) && elements.length > 0
    ? elements
    : [
        {
          data: {
            id: "n1",
            label: "Node 1",
            topText: "Q0",
            bottomText: "Initial",
            description: "Node 1 desc"
          },
          position: { x: 200, y: 200 },
          group: "nodes"
        },
        {
          data: {
            id: "n2",
            label: "Node 2",
            topText: "Q1",
            bottomText: "Final",
            description: "Node 2 desc"
          },
          position: { x: 400, y: 200 },
          group: "nodes"
        },
        {
          data: {
            id: "e1",
            source: "n1",
            target: "n2",
            weight: "1",
            title: "a,Z\n→\nZZ\n.",
            sourceLabel: "from",
            targetLabel: "to"
          },
          group: "edges"
        }
      ];

  const customStylesheet = [
    {
      selector: 'node',
      style: {
        'text-valign': 'center',
        'text-halign': 'center',
        'label': 'data(label)',
        'font-size': 18,
        'text-outline-color': '#fdd835',
        'text-outline-width': 4,
        'color': '#2196f3',
        'background-color': '#2196f3',
        'border-color': '#000',
        'border-width': 2,
        'text-wrap': 'wrap',
        'text-max-width': 100,
      },
    },
    {
      selector: 'node[description]',
      style: {
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 30,
        'label': 'data(description)',
        'font-size': 14,
        'color': '#444',
        'text-background-opacity': 0,
      },
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'vee',
        'source-arrow-shape': 'triangle',
        'arrow-scale': 1.5,
        'width': 2,
        'line-color': '#fdd835',
        'target-arrow-color': '#fdd835',
        'source-arrow-color': '#fdd835',
        'label': 'data(weight)',
        'font-size': 16,
        'font-weight': 'bold',
        'color': '#fdd835',
        'text-outline-color': '#ab47bc',
        'text-outline-width': 4,
        'text-background-color': '#ab47bc',
        'text-background-opacity': 1,
        'text-background-padding': 3,
        'text-halign': 'center',
      },
    },
    {
      selector: 'edge[title]',
      style: {
        'text-margin-y': -20,
        'text-halign': 'center',
        'text-valign': 'top',
        'text-rotation': 'autorotate',
        'text-wrap': 'wrap',
        'text-max-width': 80,
        'text-background-opacity': 0,
        'font-size': 14,
        'color': '#b39ddb',
        'label': 'data(title)',
      },
    },
    {
      selector: 'edge[sourceLabel]',
      style: {
        'edge-text-rotation': 'autorotate',
        'text-margin-x': -40,
        'text-halign': 'left',
        'text-valign': 'center',
        'label': 'data(sourceLabel)',
        'font-size': 14,
        'color': '#555',
        'text-background-opacity': 0,
      },
    },
    {
      selector: 'edge[targetLabel]',
      style: {
        'edge-text-rotation': 'autorotate',
        'text-margin-x': 40,
        'text-halign': 'right',
        'text-valign': 'center',
        'label': 'data(targetLabel)',
        'font-size': 14,
        'color': '#555',
        'text-background-opacity': 0,
      },
    }
  ];

const processedElements = useMemo(() => {
    return safeElements.map((el) => {
      if (el.data) {
        if (el.group === 'nodes') {
          const combinedLabel = [el.data.topText, el.data.label ?? el.data.id, el.data.bottomText]
            .filter(Boolean)
            .join("\n");
          return {
            ...el,
            data: {
              ...el.data,
              label: combinedLabel,
              description: el.data.description ?? ''
            },
          };
        } else if (el.group === 'edges') {
          return {
            ...el,
            data: {
              ...el.data,
              weight: el.data.weight ?? '',
              title: `( ${(el.data.title ?? '').replace(/\n/g, '\n')} )`,
              sourceLabel: el.data.sourceLabel ?? '',
              targetLabel: el.data.targetLabel ?? ''
            },
          };
        }
      }
      return el;
    });
  }, [safeElements]);

  return (
    <div className="w-full h-full relative">
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
        }}
        elements={processedElements}
        layout={layout}
        stylesheet={customStylesheet}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
