import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Node, Edge } from './types';

interface EdgeEditModalProps {
  edge: Edge | null;
  nodes: Node[];
  onSave: (edge: Edge) => void;
  onDelete: (edge: Edge) => void;
  onCancel: () => void;
}

export default function EdgeEditModal({ edge, nodes, onSave, onDelete, onCancel }: EdgeEditModalProps) {
  const [weight, setWeight] = useState(edge?.weight || 1);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (edge) {
      setWeight(edge.weight);
    }
  }, [edge]);

  if (!edge) return null;

  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>Edit Edge</h2>
          <button 
            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            onClick={() => onDelete(edge)}
          >
            <Trash2 size={isMobile ? 16 : 18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Edge ID</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={edge.id} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">From</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={sourceNode?.label || edge.source} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">To</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={targetNode?.label || edge.target} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Weight</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded"
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))} 
            min={1}
            autoFocus
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => onSave({ ...edge, weight })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}