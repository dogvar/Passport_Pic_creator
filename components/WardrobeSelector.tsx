import React from 'react';
import { WardrobeItem } from '../types';

interface WardrobeSelectorProps {
  options: WardrobeItem[];
  value: string;
  onChange: (id: string) => void;
}

const WardrobeSelector: React.FC<WardrobeSelectorProps> = ({ options, value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">Change Wardrobe (Optional)</label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {options.map((item) => (
          <div
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`relative rounded-lg cursor-pointer transition-all duration-200 aspect-square flex flex-col items-center justify-center p-1 text-center bg-gray-700 hover:bg-gray-600
              ${value === item.id ? 'ring-4 ring-purple-500 shadow-lg' : 'ring-2 ring-transparent hover:ring-purple-500/50'}`}
          >
            {/* In a real app, you would use item.thumbnail here */}
            <span className="text-xs font-semibold p-1 rounded">{item.name}</span>
            {value === item.id && (
              <div className="absolute top-1 right-1 bg-purple-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardrobeSelector;
