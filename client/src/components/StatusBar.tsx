import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { useIsMobile } from "@/hooks/use-mobile";

export default function StatusBar() {
  const { statusMessage, nodeCount, edgeCount } = useContext(GraphContext);
  const isMobile = useIsMobile();

  return (
    <footer className="bg-white border-t border-gray-200 py-2 px-4 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div id="status-message" className={isMobile ? "text-xs truncate max-w-[60%]" : ""}>
          {statusMessage}
        </div>
        <div className="flex space-x-3">
          <div className={isMobile ? "text-xs font-medium" : ""}>
            <span className="font-semibold">{nodeCount}</span> {isMobile ? "n" : "nodes"}
          </div>
          <div className={isMobile ? "text-xs font-medium" : ""}>
            <span className="font-semibold">{edgeCount}</span> {isMobile ? "e" : "edges"}
          </div>
        </div>
      </div>
    </footer>
  );
}
