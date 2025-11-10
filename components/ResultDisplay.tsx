
import React from 'react';

interface ResultDisplayProps {
  image: string;
  onDownload: () => void;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, onDownload, onReset }) => {
  const mimeType = image.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
  const dataUrl = `data:${mimeType};base64,${image}`;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl font-bold text-gray-100 mb-4">Your Image is Ready!</h3>
      <div className="bg-gray-900 p-2 rounded-lg shadow-lg">
        <img src={dataUrl} alt="Generated result" className="max-h-80 w-auto rounded-md object-contain" />
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onDownload}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          Download Image
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
