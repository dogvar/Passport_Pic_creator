
import React from 'react';
import { PortraitStyle } from '../types';

interface WardrobeSelectorProps {
  styles: PortraitStyle[];
  selectedStyle: PortraitStyle;
  onStyleSelect: (style: PortraitStyle) => void;
}

const WardrobeSelector: React.FC<WardrobeSelectorProps> = ({ styles, selectedStyle, onStyleSelect }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-3 text-center">Choose a Portrait Style</h3>
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {styles.map((style) => (
          <button
            key={style.name}
            onClick={() => onStyleSelect(style)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none 
              ${selectedStyle.name === style.name ? 'border-purple-500 ring-2 ring-purple-500' : 'border-transparent hover:border-purple-500/50'}`}
          >
            <img src={style.thumbnail} alt={style.name} className="w-full h-24 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <p className="absolute bottom-1 left-2 right-2 text-xs font-bold text-white text-center truncate">
              {style.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WardrobeSelector;
