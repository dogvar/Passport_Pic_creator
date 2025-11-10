
import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
      <p className="mt-4 text-lg text-gray-300">{message}</p>
      <p className="mt-2 text-sm text-gray-500">This may take a moment...</p>
    </div>
  );
};

export default LoadingSpinner;
