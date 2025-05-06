import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";

export default function StatusBar() {
  const { statusMessage, nodeCount, edgeCount } = useContext(GraphContext);

  return (
    <footer className="bg-white border-t border-gray-200 py-2 px-4 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div id="status-message">{statusMessage}</div>
        <div className="flex space-x-4">
          <div><span>{nodeCount}</span> nodes</div>
          <div><span>{edgeCount}</span> edges</div>
        </div>
      </div>
    </footer>
  );
}
