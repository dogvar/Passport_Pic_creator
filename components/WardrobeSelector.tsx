import React, { useState, useCallback, useMemo, useRef } from 'react';
import { PORTRAIT_ATTIRE } from '../constants';
import { fileToBase64 } from '../utils/fileUtils';
import UploadIcon from './icons/UploadIcon';

interface WardrobeSelectorProps {
  category: string;
  onCategoryChange: (category: string) => void;
  upperAttire: string;
  onUpperAttireChange: (attire: string) => void;
  lowerAttire: string;
  onLowerAttireChange: (attire: string) => void;
  onCustomAttireUpload: (base64Image: string | null) => void;
}

const WardrobeSelector: React.FC<WardrobeSelectorProps> = ({
  category, onCategoryChange,
  upperAttire, onUpperAttireChange,
  lowerAttire, onLowerAttireChange,
  onCustomAttireUpload
}) => {
  const [customAttire, setCustomAttire] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = Object.keys(PORTRAIT_ATTIRE);
  const selectedWardrobe = PORTRAIT_ATTIRE[category];

  const handleUpperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpperAttireChange(e.target.value);
  };
  
  const handleLowerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLowerAttireChange(e.target.value);
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size should not exceed 4MB.");
        return;
      }
      try {
        setCustomAttire(file);
        const base64 = await fileToBase64(file);
        onCustomAttireUpload(base64);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading attire file.");
      }
    }
  }, [onCustomAttireUpload]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleClearCustom = () => {
    setCustomAttire(null);
    onCustomAttireUpload(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const isCustomAttireUsed = !!customAttire;

  return (
    <div className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-3 text-center">AI Wardrobe</h3>
      
      {/* Category Tabs */}
      <div className="flex justify-center mb-4 border-b border-gray-600">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200
              ${category === cat ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preset Attire */}
        <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isCustomAttireUsed ? 'opacity-40' : 'opacity-100'}`}>
          <select
            value={upperAttire}
            onChange={handleUpperChange}
            disabled={isCustomAttireUsed}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
          >
            <option disabled>-- Upper Body --</option>
            {selectedWardrobe.upper.map(opt => <option key={opt.name} value={opt.prompt}>{opt.name}</option>)}
          </select>

          <select
            value={lowerAttire}
            onChange={handleLowerChange}
            disabled={isCustomAttireUsed}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
          >
            <option disabled>-- Lower Body --</option>
            {selectedWardrobe.lower.map(opt => <option key={opt.name} value={opt.prompt}>{opt.name}</option>)}
          </select>
        </div>

        {/* Custom Attire Uploader */}
        <div className="flex flex-col items-center justify-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg"
            />
            {!customAttire ? (
                 <button
                    onClick={handleUploadClick}
                    className="w-full h-full flex items-center justify-center gap-2 p-2.5 bg-gray-700 text-sm text-gray-300 font-semibold rounded-lg shadow-sm border border-gray-600 hover:bg-gray-600 transition"
                 >
                    <UploadIcon className="w-5 h-5" />
                    Upload Attire Image
                </button>
            ) : (
                <div className="w-full flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                    <p className="flex-1 text-sm text-purple-300 truncate ml-2">{customAttire.name}</p>
                    <button onClick={handleClearCustom} className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700">Clear</button>
                </div>
            )}
        </div>
      </div>
       {isCustomAttireUsed && <p className="text-xs text-center text-yellow-400 mt-3">Custom attire selected. Preset options are disabled.</p>}
    </div>
  );
};

export default WardrobeSelector;
