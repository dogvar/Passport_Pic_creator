
import React from 'react';

const DisclaimerNotice: React.FC = () => {
  return (
    <div className="w-full text-center text-xs text-yellow-400 bg-yellow-900/50 border border-yellow-700 rounded-lg p-3">
      <p>
        <span className="font-bold">Disclaimer:</span> AI-generated portraits are artistic interpretations and may not perfectly resemble the original photo. Facial features are preserved, but style, clothing, and background are altered.
      </p>
    </div>
  );
};

export default DisclaimerNotice;
