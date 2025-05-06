import { useIsMobile } from "@/hooks/use-mobile";

export default function InstructionBar() {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-gray-50 py-2 px-4 border-b border-gray-200 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto flex items-center space-x-4">
        {isMobile ? (
          // Mobile view - fewer items with more touch-oriented instructions
          <>
            <span><strong>Tap:</strong> Add node</span>
            <span className="border-l border-gray-300 pl-4"><strong>Drag:</strong> Move</span>
            <span className="border-l border-gray-300 pl-4"><strong>Long-press:</strong> Delete</span>
          </>
        ) : (
          // Desktop view - full instructions
          <>
            <span><strong>Click:</strong> Add node</span>
            <span className="border-l border-gray-300 pl-4"><strong>Click + Drag:</strong> Move node</span>
            <span className="border-l border-gray-300 pl-4"><strong>Click nodes in sequence:</strong> Add edge</span>
            <span className="border-l border-gray-300 pl-4"><strong>Right-click:</strong> Delete</span>
            <span className="border-l border-gray-300 pl-4"><strong>Click node:</strong> Edit name</span>
            <span className="border-l border-gray-300 pl-4"><strong>Click edge:</strong> Edit weight</span>
          </>
        )}
      </div>
    </div>
  );
}
