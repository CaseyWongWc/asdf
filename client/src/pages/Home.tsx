import { useState, useContext } from "react";
// Keep this import commented so we can easily restore it later if needed
// import SimpleGraph from "../components/simple-graph";
import CytoscapeGraph from "../components/CytoscapeGraph";
import Header from "../components/Header";
import InstructionBar from "../components/InstructionBar";
import StatusBar from "../components/StatusBar";
import AlgorithmPanel from "../components/AlgorithmPanel";
import { GraphProvider, GraphContext } from "../contexts/GraphContext";
import { MobileProvider } from "../hooks/use-mobile";

// Define implementation types for future extensibility
type ImplementationType = "cytoscape"; // We can add "simple" back later if needed

export default function Home() {
  // We keep the state setup to maintain flexibility for future changes
  const [activeImpl, setActiveImpl] = useState<ImplementationType>("cytoscape");

  return (
    <MobileProvider>
      <GraphProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <InstructionBar />
          
          {/* 
            Note: Implementation selector is removed but the code structure
            remains flexible to add it back later if needed
          */}
          
          {/* Graph Content Area */}
          <div className="flex-1 relative overflow-hidden">
            <CytoscapeGraph />
          </div>
          
          <StatusBar />
        </div>
      </GraphProvider>
    </MobileProvider>
  );
}
