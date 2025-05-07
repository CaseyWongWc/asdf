import { useContext, useState } from 'react';
import { GraphContext } from '@/contexts/GraphContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Define interfaces for better type safety
interface GraphNode {
  id: string;
  label: string;
}

interface CytoscapeNode {
  id: () => string;
  data: (key: string) => any;
}

// List of available algorithms
const ALGORITHMS = [
  { id: 'bfs', name: 'Breadth-First Search', category: 'traversal' },
  { id: 'dfs', name: 'Depth-First Search', category: 'traversal' },
  { id: 'dijkstra', name: 'Dijkstra\'s Algorithm', category: 'pathfinding' },
  { id: 'bellmanFord', name: 'Bellman-Ford Algorithm', category: 'pathfinding' },
  { id: 'prim', name: 'Prim\'s Algorithm', category: 'spanning' },
  { id: 'kruskal', name: 'Kruskal\'s Algorithm', category: 'spanning' },
];

// The AlgorithmPanel component will allow selecting and running algorithms
export default function AlgorithmPanel() {
  const { mode, setStatusMessage } = useContext(GraphContext);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([50]); // Animation speed control
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  
  // Only render the panel when in algorithm mode
  if (mode !== 'algorithm') {
    return null;
  }
  
  // We already defined CytoscapeNode interface at the top of the file
  
  // Get all available nodes from Cytoscape
  const getNodes = (): GraphNode[] => {
    if (!window.cy) return [];
    return window.cy.nodes().map((node: CytoscapeNode) => ({
      id: node.id(),
      label: node.data('label')
    }));
  };
  
  const handleRun = () => {
    if (!selectedAlgorithm) {
      setStatusMessage('Please select an algorithm to run');
      return;
    }
    
    setIsRunning(true);
    setStatusMessage(`Running ${selectedAlgorithm} algorithm...`);
    
    // This is a placeholder for actual algorithm implementation
    // In a real implementation, we would call the specific algorithm function
    setTimeout(() => {
      setIsRunning(false);
      setStatusMessage(`${selectedAlgorithm} algorithm completed`);
    }, 2000);
  };
  
  const handleReset = () => {
    if (!window.cy) return;
    
    // Reset all node and edge styles to default
    window.cy.elements().removeClass('visited highlight path');
    window.cy.elements().removeStyle('background-color line-color');
    
    setStatusMessage('Algorithm visualization reset');
  };
  
  const nodes = getNodes();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Algorithm Visualization</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Algorithm
        </label>
        <Select 
          value={selectedAlgorithm} 
          onValueChange={setSelectedAlgorithm}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an algorithm" />
          </SelectTrigger>
          <SelectContent>
            {ALGORITHMS.map(algo => (
              <SelectItem key={algo.id} value={algo.id}>
                {algo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Node
        </label>
        <Select 
          value={startNode} 
          onValueChange={setStartNode}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select start node" />
          </SelectTrigger>
          <SelectContent>
            {nodes.map(node => (
              <SelectItem key={node.id} value={node.id}>
                {node.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Node
        </label>
        <Select 
          value={endNode} 
          onValueChange={setEndNode}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select end node" />
          </SelectTrigger>
          <SelectContent>
            {nodes.map(node => (
              <SelectItem key={node.id} value={node.id}>
                {node.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Animation Speed: {speed[0]}%
        </label>
        <Slider
          value={speed}
          onValueChange={setSpeed}
          min={10}
          max={100}
          step={5}
          disabled={isRunning}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button
          className="w-full"
          onClick={handleRun}
          disabled={isRunning || !selectedAlgorithm}
        >
          {isRunning ? 'Running...' : 'Run Algorithm'}
        </Button>
        
        <Button
          className="w-full" 
          variant="outline"
          onClick={handleReset}
          disabled={isRunning}
        >
          Reset
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p className="mb-1">Note: To exit Algorithm Mode, change the graph title to something other than "THIS IS NOT A DRILL"</p>
      </div>
    </div>
  );
}