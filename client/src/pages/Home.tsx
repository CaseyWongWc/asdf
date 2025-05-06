import { useState } from "react";
import SimpleGraph from "../components/SimpleGraph";
import CytoscapeGraph from "../components/CytoscapeGraph";
import Header from "../components/Header";
import InstructionBar from "../components/InstructionBar";
import StatusBar from "../components/StatusBar";
import { GraphProvider } from "../contexts/GraphContext";
import { MobileProvider } from "../hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  // We'll use this state to track which implementation is active
  const [activeImpl, setActiveImpl] = useState<"simple" | "cytoscape">("simple");

  return (
    <MobileProvider>
      <GraphProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <InstructionBar />
          
          {/* Implementation Selector */}
          <div className="bg-gray-100 px-4 py-2 border-t border-b border-gray-200">
            <Tabs value={activeImpl} onValueChange={(v) => setActiveImpl(v as "simple" | "cytoscape")} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
                <TabsTrigger value="simple">Simple Implementation</TabsTrigger>
                <TabsTrigger value="cytoscape">Cytoscape Implementation</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Graph Content Area */}
          <div className="flex-1 relative overflow-hidden">
            {activeImpl === "simple" ? (
              <SimpleGraph />
            ) : (
              <CytoscapeGraph />
            )}
          </div>
          
          <StatusBar />
        </div>
      </GraphProvider>
    </MobileProvider>
  );
}
