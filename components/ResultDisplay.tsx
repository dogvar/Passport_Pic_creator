import React, { useState, useCallback } from 'react';

interface ResultDisplayProps {
  images: string[];
  onDownload: (selectedImage: string) => void;
  onReset: () => void;
  fileName?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ images, onDownload, onReset, fileName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleDownloadClick = useCallback(() => {
    if (images.length > 0) {
      onDownload(images[selectedIndex]);
    }
  }, [onDownload, images, selectedIndex]);
  
  const getImageUrl = (base64: string) => {
      const mimeType = base64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      return `data:${mimeType};base64,${base64}`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Your Results are Ready!</h2>
      {images.length > 1 && <p className="text-gray-400 mb-4 text-center">We've generated two options. Please select the one you like best.</p>}
      
      <div className={`grid ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full max-w-md mb-6`}>
        {images.map((image, index) => (
          <div 
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200
              ${selectedIndex === index ? 'ring-4 ring-purple-500 shadow-2xl' : 'ring-2 ring-transparent hover:ring-purple-500/50'}`}
          >
            <img 
                src={getImageUrl(image)}
                alt={`Generated result option ${index + 1}`} 
                className="w-full h-full object-contain" 
            />
             {selectedIndex === index && images.length > 1 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white font-bold bg-purple-600 px-3 py-1 rounded-full text-sm">
                  Selected
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <button
          onClick={handleDownloadClick}
          disabled={images.length === 0}
          className="w-full sm:w-auto flex-1 px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Download Selected Image
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex-1 px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;