import { useState, useContext } from "react";
// Keep this import commented so we can easily restore it later if needed
// import SimpleGraph from "../components/simple-graph";
import CytoscapeGraph from "../components/CytoscapeGraph.new";
import Header from "../components/Header";
import InstructionBar from "../components/InstructionBar";
import StatusBar from "../components/StatusBar";
import AlgorithmPanel from "../components/AlgorithmPanel";
import { GraphProvider, GraphContext } from "../contexts/GraphContext";
import { MobileProvider } from "../hooks/use-mobile";

// Define implementation types for future extensibility
type ImplementationType = "cytoscape"; // We can add "simple" back later if needed

// Create a component to wrap the content with GraphContext
function HomeContent() {
  // We keep the state setup to maintain flexibility for future changes
  const [activeImpl, setActiveImpl] = useState<ImplementationType>("cytoscape");
  const { mode } = useContext(GraphContext);
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      {/* Show instruction bar only in editor mode */}
      {mode === 'editor' && <InstructionBar />}
      
      {/* Layout changes based on mode */}
      <div className={`flex ${mode === 'algorithm' ? 'flex-row' : 'flex-col'} flex-1`}>
        {/* Algorithm panel in algorithm mode */}
        {mode === 'algorithm' && (
          <div className="w-64 p-2 overflow-y-auto">
            <AlgorithmPanel />
          </div>
        )}
        
        {/* Graph Content Area */}
        <div className={`relative overflow-hidden ${mode === 'algorithm' ? 'flex-1' : 'flex-1'}`}>
          <CytoscapeGraph />
        </div>
      </div>
      
      <StatusBar />
    </div>
  );
}

export default function Home() {
  return (
    <MobileProvider>
      <GraphProvider>
        <HomeContent />
      </GraphProvider>
    </MobileProvider>
  );
}
