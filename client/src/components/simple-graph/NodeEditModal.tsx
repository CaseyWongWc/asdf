import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Node } from '../simple-graph/types';

interface NodeEditModalProps {
  node: Node | null;
  onSave: (node: Node) => void;
  onDelete: (node: Node) => void;
  onCancel: () => void;
}

export default function NodeEditModal({ node, onSave, onDelete, onCancel }: NodeEditModalProps) {
  const [label, setLabel] = useState(node?.label || '');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (node) {
      setLabel(node.label);
    }
  }, [node]);

  if (!node) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>Edit Node</h2>
          <button 
            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            onClick={() => onDelete(node)}
          >
            <Trash2 size={isMobile ? 16 : 18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Node ID</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded bg-gray-100"
            value={node.id} 
            disabled 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Label</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
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
            onClick={() => onSave({ ...node, label })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}