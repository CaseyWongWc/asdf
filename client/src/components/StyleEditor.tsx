import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StyleProperty, StyleScope } from '@/contexts/StyleContext';
import { X as CloseIcon, Globe as GlobeIcon, Target as TargetIcon, Layers as LayersIcon } from 'lucide-react';

interface StyleEditorProps {
  properties: StyleProperty[];
  values: Record<string, any>;
  onChange: (property: string, value: any) => void;
  title: string;
  scope: StyleScope;
  onScopeChange: (scope: StyleScope) => void;
  elementCount?: number; // For displaying element count in 'all' scope
  selectedCount?: number; // For displaying selected element count
  onReset: () => void;
  onCancel: () => void;
  onApply: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function StyleEditor({
  properties,
  values,
  onChange,
  title,
  scope,
  onScopeChange,
  elementCount = 0,
  selectedCount = 0,
  onReset,
  onCancel,
  onApply,
  isOpen,
  onClose
}: StyleEditorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 bg-blue-500 text-white p-2 rounded-t-lg">
          <h3 className="text-lg font-semibold">{title} Style</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-white">
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Scope selector */}
        <div className="mb-4 border-b pb-2">
          <RadioGroup value={scope} onValueChange={(val) => onScopeChange(val as StyleScope)}>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="scope-selected" />
                <Label htmlFor="scope-selected">Selected Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all">All {title.toLowerCase()}s</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="global" id="scope-global" />
                <Label htmlFor="scope-global">Global Default</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {/* Current scope indicator */}
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm mb-4">
          {scope === 'selected' && (
            <div className="flex items-center">
              <TargetIcon className="w-4 h-4 mr-2 text-blue-500" />
              <span>
                Editing {selectedCount} selected {selectedCount === 1 ? title.toLowerCase() : title.toLowerCase() + 's'}
              </span>
            </div>
          )}
          
          {scope === 'all' && (
            <div className="flex items-center">
              <LayersIcon className="w-4 h-4 mr-2 text-purple-500" />
              <span>
                Editing all {title.toLowerCase()}s ({elementCount})
              </span>
            </div>
          )}
          
          {scope === 'global' && (
            <div className="flex items-center">
              <GlobeIcon className="w-4 h-4 mr-2 text-green-500" />
              <span>
                Setting default styles for new {title.toLowerCase()}s
              </span>
            </div>
          )}
        </div>
        
        {/* Style properties */}
        <div className="space-y-4">
          {properties.map(prop => (
            <div key={prop.id} className="flex justify-between items-center">
              <label className="text-sm font-medium">{prop.name}</label>
              
              {prop.type === 'color' && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-24 h-6 rounded border"
                    style={{ backgroundColor: values[prop.id] || prop.default }}
                  />
                  <input 
                    type="text"
                    value={values[prop.id] || prop.default}
                    onChange={(e) => onChange(prop.id, e.target.value)}
                    className="w-24 px-2 py-1 text-sm border rounded"
                  />
                </div>
              )}
              
              {prop.type === 'number' && (
                <input 
                  type="number"
                  value={values[prop.id] || prop.default}
                  min={prop.min}
                  max={prop.max}
                  step={prop.step}
                  onChange={(e) => onChange(prop.id, Number(e.target.value))}
                  className="w-24 px-2 py-1 text-sm border rounded"
                />
              )}
              
              {prop.type === 'select' && (
                <select
                  value={values[prop.id] || prop.default}
                  onChange={(e) => onChange(prop.id, e.target.value)}
                  className="w-24 px-2 py-1 text-sm border rounded"
                >
                  {prop.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              
              {prop.type === 'text' && (
                <input 
                  type="text"
                  value={values[prop.id] || prop.default}
                  onChange={(e) => onChange(prop.id, e.target.value)}
                  className="w-24 px-2 py-1 text-sm border rounded"
                />
              )}
              
              {prop.type === 'boolean' && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={values[prop.id] || prop.default}
                    onChange={(e) => onChange(prop.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              )}
            </div>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onReset}
          >
            Reset
          </Button>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={onApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}