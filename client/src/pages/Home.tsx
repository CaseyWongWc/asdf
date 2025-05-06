import SimpleGraph from "../components/SimpleGraph";
import Header from "../components/Header";
import InstructionBar from "../components/InstructionBar";
import StatusBar from "../components/StatusBar";
import { GraphProvider } from "../contexts/GraphContext";
import { MobileProvider } from "../hooks/use-mobile";

export default function Home() {
  return (
    <MobileProvider>
      <GraphProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <InstructionBar />
          <div className="flex-1 relative overflow-hidden">
            <SimpleGraph />
          </div>
          <StatusBar />
        </div>
      </GraphProvider>
    </MobileProvider>
  );
}
