
import React from 'react';
import { FeatureMode } from '../types';

interface ToggleProps {
  currentMode: FeatureMode;
  onModeChange: (mode: FeatureMode) => void;
}

const Toggle: React.FC<ToggleProps> = ({ currentMode, onModeChange }) => {
  const isPassport = currentMode === 'passport';

  return (
    <div className="flex justify-center items-center">
      <div className="relative flex w-full max-w-sm p-1 bg-gray-700 rounded-full">
        <span
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-purple-600 rounded-full shadow-md transition-transform duration-300 ease-in-out ${
            isPassport ? 'translate-x-0' : 'translate-x-full'
          }`}
        />
        <button
          onClick={() => onModeChange('passport')}
          className={`relative z-10 w-1/2 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${
            isPassport ? 'text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Passport Photo
        </button>
        <button
          onClick={() => onModeChange('portrait')}
          className={`relative z-10 w-1/2 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${
            !isPassport ? 'text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Portrait Picture
        </button>
      </div>
    </div>
  );
};

export default Toggle;
