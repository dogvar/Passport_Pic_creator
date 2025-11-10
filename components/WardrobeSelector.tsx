import React from 'react';
import { WardrobeCollection, WardrobeCategory, AttireOption } from '../types';

interface WardrobeSelectorProps {
  collection: WardrobeCollection;
  selectedCategory: WardrobeCategory;
  onCategoryChange: (category: WardrobeCategory) => void;
  selectedAttire: string;
  onAttireChange: (attireValue: string) => void;
}

const CATEGORIES: { label: string; value: WardrobeCategory }[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
  { label: 'Boy', value: 'boy' },
  { label: 'Girl', value: 'girl' },
];

const WardrobeSelector: React.FC<WardrobeSelectorProps> = ({
  collection,
  selectedCategory,
  onCategoryChange,
  selectedAttire,
  onAttireChange,
}) => {
  const attireOptions = collection[selectedCategory];

  const handleCategoryChange = (category: WardrobeCategory) => {
    onCategoryChange(category);
    // Reset to 'No Change' when category switches to avoid mismatches
    onAttireChange('no change to attire'); 
  };

  return (
    <div className="w-full max-w-2xl p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
      <h4 className="text-lg font-semibold text-white mb-3 text-center">AI Wardrobe</h4>
      
      {/* Category Selection */}
      <div className="flex justify-center mb-4 p-1 bg-gray-900/50 rounded-full">
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleCategoryChange(value)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 w-full
              ${selectedCategory === value ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Attire Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 text-center">
        <button
          onClick={() => onAttireChange('no change to attire')}
          className={`p-2 text-sm rounded-md transition-all duration-200 border-2 
            ${selectedAttire === 'no change to attire' 
              ? 'bg-purple-600 border-purple-400 text-white font-bold' 
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-500'}`}
        >
          No Change
        </button>
        {attireOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onAttireChange(option.value)}
            className={`p-2 text-sm rounded-md transition-all duration-200 border-2
              ${selectedAttire === option.value
                ? 'bg-purple-600 border-purple-400 text-white font-bold'
                : 'bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-500'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WardrobeSelector;
