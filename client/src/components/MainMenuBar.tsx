import { useContext, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GraphContext } from "@/contexts/GraphContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  MousePointer,
  Plus,
  BrainCircuit,
  ArrowDownRight,
  SeparatorVertical,
  PenTool,
  Download,
  Upload,
  Copy,
  Trash2,
  HelpCircle,
  Menu,
  X,
  Info,
  Settings,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MainMenuBar() {
  const isMobile = useIsMobile();
  const { 
    mode, 
    setMode, 
    edgeStyle, 
    setEdgeStyle, 
    showHelp, 
    setShowHelp,
    resetGraph,
    setStatusMessage,
    checkParity
  } = useContext(GraphContext);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleModeChange = (newMode: 'editor' | 'algorithm') => {
    setMode(newMode);
    setStatusMessage(`Switched to ${newMode === 'editor' ? 'Graph Editor' : 'Algorithm'} Mode`);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleEdgeStyleChange = (newStyle: 'curved' | 'straight') => {
    setEdgeStyle(newStyle);
    setStatusMessage(`Edge style set to ${newStyle}`);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleShowHelp = () => {
    setShowHelp(true);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleResetGraph = () => {
    resetGraph();
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleCheckParity = () => {
    checkParity();
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // Mobile version with slide-out menu
  if (isMobile) {
    return (
      <div className="bg-gray-50 py-2 px-4 border-b border-gray-200">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col h-full">
                  <div className="py-4 border-b">
                    <h3 className="text-lg font-medium">Graph Menu</h3>
                  </div>
                  
                  <div className="flex flex-col py-2 space-y-1">
                    <h4 className="text-sm font-semibold px-1 py-2">Mode</h4>
                    <Button 
                      variant={mode === 'editor' ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => handleModeChange('editor')}
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Editor Mode
                    </Button>
                    <Button 
                      variant={mode === 'algorithm' ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleModeChange('algorithm')}
                    >
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Algorithm Mode
                    </Button>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex flex-col py-2 space-y-1">
                    <h4 className="text-sm font-semibold px-1 py-2">Edge Style</h4>
                    <Button 
                      variant={edgeStyle === 'curved' ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleEdgeStyleChange('curved')}
                    >
                      <ArrowDownRight className="h-4 w-4 mr-2" />
                      Curved
                    </Button>
                    <Button 
                      variant={edgeStyle === 'straight' ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleEdgeStyleChange('straight')}
                    >
                      <SeparatorVertical className="h-4 w-4 mr-2" />
                      Straight
                    </Button>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex flex-col py-2 space-y-1">
                    <h4 className="text-sm font-semibold px-1 py-2">Actions</h4>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={handleCheckParity}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Check Parity
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={handleResetGraph}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset Graph
                    </Button>
                  </div>
                  
                  <div className="mt-auto py-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleShowHelp}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="font-medium text-sm">
              {mode === 'editor' ? (
                <div className="flex items-center">
                  <PenTool className="h-3 w-3 mr-1" />
                  <span>Editor Mode</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <BrainCircuit className="h-3 w-3 mr-1" />
                  <span>Algorithm Mode</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="text-xs px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
              {mode === 'editor' ? (
                <>
                  <span><strong>Tap:</strong> Add node</span>
                </>
              ) : (
                <>
                  <span><strong>Alg:</strong> Select</span>
                </>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleShowHelp}
              aria-label="Help"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop version with menubar
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Menubar className="border-none bg-transparent">
          <MenubarMenu>
            <MenubarTrigger className="font-medium">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleResetGraph}>
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Graph
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <Download className="h-4 w-4 mr-2" />
                Export Graph
              </MenubarItem>
              <MenubarItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Graph
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger className="font-medium">Mode</MenubarTrigger>
            <MenubarContent>
              <MenubarItem 
                onClick={() => handleModeChange('editor')}
                className={mode === 'editor' ? "bg-muted" : ""}
              >
                <PenTool className="h-4 w-4 mr-2" />
                Editor Mode
              </MenubarItem>
              <MenubarItem 
                onClick={() => handleModeChange('algorithm')}
                className={mode === 'algorithm' ? "bg-muted" : ""}
              >
                <BrainCircuit className="h-4 w-4 mr-2" />
                Algorithm Mode
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger className="font-medium">Style</MenubarTrigger>
            <MenubarContent>
              <MenubarItem 
                onClick={() => handleEdgeStyleChange('curved')}
                className={edgeStyle === 'curved' ? "bg-muted" : ""}
              >
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Curved Edges
              </MenubarItem>
              <MenubarItem 
                onClick={() => handleEdgeStyleChange('straight')}
                className={edgeStyle === 'straight' ? "bg-muted" : ""}
              >
                <SeparatorVertical className="h-4 w-4 mr-2" />
                Straight Edges
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger className="font-medium">Tools</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleCheckParity}>
                <Layers className="h-4 w-4 mr-2" />
                Check Parity
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger className="font-medium">Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleShowHelp}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Show Help
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        
        <div className="flex items-center py-1 pr-4">
          <div className="bg-gray-100 px-3 py-1 rounded-md border border-gray-200 text-sm text-gray-700 flex items-center space-x-2">
            {mode === 'editor' ? (
              <>
                <div className="flex items-center space-x-1">
                  <MousePointer className="h-3 w-3" />
                  <span><strong>Click:</strong> Add</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span><strong>+Drag:</strong> Move</span>
                <Separator orientation="vertical" className="h-4" />
                <span><strong>2-Click:</strong> Connect</span>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1">
                  <MousePointer className="h-3 w-3" />
                  <span><strong>Click:</strong> Select</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span><strong>Path:</strong> Find route</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}