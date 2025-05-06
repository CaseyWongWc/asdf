import { useContext } from "react";
import Header from "./Header";
import InstructionBar from "./InstructionBar";
import GraphCanvas from "./GraphCanvas";
import StatusBar from "./StatusBar";
import NodeEditModal from "./NodeEditModal";
import EdgeEditModal from "./EdgeEditModal";
import HelpModal from "./HelpModal";
import { GraphContext } from "@/contexts/GraphContext";

export default function GraphEditor() {
  const { title } = useContext(GraphContext);
  
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
