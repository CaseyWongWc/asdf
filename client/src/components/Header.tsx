import { useContext } from "react";
import { GraphContext } from "@/contexts/GraphContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, HelpCircle, RotateCcw, Smartphone, Laptop, CheckCircle } from "lucide-react";
import { useIsMobile, useMobileContext } from "@/hooks/use-mobile";

export default function Header() {
  const { 
    title, 
    setTitle, 
    resetGraph, 
    showHelp, 
    setShowHelp,
    mode,
    checkParity
  } = useContext(GraphContext);
  const isMobile = useIsMobile();
  const { toggleMode, isAutoDetect, setAutoDetect } = useMobileContext();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleResetClick = () => {
    if (window.confirm('Are you sure you want to reset the graph? All nodes and edges will be deleted.')) {
      resetGraph();
    }
  };
  
  const handleModeToggle = () => {
    toggleMode();
  };

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={handleTitleChange}
              readOnly={mode === 'algorithm'}
              className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold border-none focus:ring-0 focus-visible:ring-0 p-0 focus-visible:ring-offset-0 h-auto ${mode === 'algorithm' ? 'bg-transparent cursor-default text-blue-600' : ''}`}
              placeholder="Enter graph title..."
            />
            {mode === 'editor' && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
            {mode === 'editor' 
              ? 'Enter "THIS IS NOT A DRILL" in title to complete' 
              : 'Algorithm visualization mode activated'}
          </p>
        </div>
        <div className={`flex items-center ${isMobile ? 'w-full justify-between mt-2' : 'space-x-2'}`}>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className={isMobile ? "flex-1 mr-2" : "h-9"}
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1.5`} />
            Help
          </Button>
          {/* Parity Check Button */}
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className={isMobile ? "flex-1 mr-2" : "h-9"}
            onClick={checkParity}
          >
            <CheckCircle className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1.5`} />
            Check Parity
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className={isMobile ? "flex-1 mr-2" : "h-9"}
            onClick={handleResetClick}
          >
            <RotateCcw className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1.5`} />
            Reset
          </Button>
          <Button 
            variant="ghost" 
            size={isMobile ? "icon" : "sm"}
            className={isMobile ? "w-10 h-10 ml-1 bg-gray-100" : "h-9"}
            onClick={handleModeToggle}
            title={isMobile ? "Switch to Desktop Mode" : "Switch to Mobile Mode"}
          >
            {isMobile ? (
              <Laptop className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${!isMobile ? 'mr-1.5' : ''}`} />
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Toggle Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
