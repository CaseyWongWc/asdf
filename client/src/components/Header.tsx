import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, HelpCircle, RotateCcw } from "lucide-react";

export default function Header() {
  const { 
    title, 
    setTitle, 
    resetGraph, 
    showHelp, 
    setShowHelp 
  } = useContext(GraphContext);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleResetClick = () => {
    if (window.confirm('Are you sure you want to reset the graph? All nodes and edges will be deleted.')) {
      resetGraph();
    }
  };

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={handleTitleChange}
              className="text-xl font-semibold border-none focus:ring-0 focus-visible:ring-0 p-0 focus-visible:ring-offset-0 h-auto"
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-1">Enter "THIS IS NOT A DRILL" in title to complete</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className="h-4 w-4 mr-1.5" />
            Help
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={handleResetClick}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
}
