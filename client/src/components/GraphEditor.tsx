import { useContext, useEffect } from "react";
import Header from "./Header";
import InstructionBar from "./InstructionBar";
import GraphCanvas from "./GraphCanvas";
import StatusBar from "./StatusBar";
import NodeEditModal from "./NodeEditModal";
import EdgeEditModal from "./EdgeEditModal";
import HelpModal from "./HelpModal";
import { GraphContext } from "@/contexts/GraphContext";

export default function GraphEditor() {
  const { title, createNode } = useContext(GraphContext);
  
  // Add one default node when the app loads
  useEffect(() => {
    // Small delay to ensure Cytoscape is initialized
    const timer = setTimeout(() => {
      if (window.cy) {
        // Create a default node near the center
        createNode(300, 200, "Node 1", window.cy);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [createNode]);
  
  return (
    <div className={`flex flex-col h-screen ${title === "THIS IS NOT A DRILL" ? "bg-green-50" : "bg-background"}`}>
      <Header />
      <InstructionBar />
      <GraphCanvas />
      <StatusBar />
      <NodeEditModal />
      <EdgeEditModal />
      <HelpModal />
    </div>
  );
}
