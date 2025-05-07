import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import StyleMenu from '@/components/StyleMenu';
import { Paintbrush2 } from 'lucide-react';

export default function StylePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20">
      <div className="flex flex-col items-end">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full h-12 w-12 flex items-center justify-center shadow-lg ${
            isOpen ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Paintbrush2 className="h-5 w-5" />
        </Button>

        {isOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-lg w-72 p-4 border border-gray-200">
            <StyleMenu />
          </div>
        )}
      </div>
    </div>
  );
}