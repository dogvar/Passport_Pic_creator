import React, { useState, useCallback, useRef, useEffect } from 'react';
import UploadIcon from './icons/UploadIcon';
import CameraIcon from './icons/CameraIcon';
import { fileToBase64, dataUrlToFile } from '../utils/fileUtils';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string, file: File) => void;
  message: string;
  error?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, message, error }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size should not exceed 4MB.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        onImageUpload(base64, file);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file.");
      }
    }
  }, [onImageUpload]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const openCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(stream);
        setIsCameraOpen(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure permissions are granted in your browser settings.");
      }
    } else {
      alert("Your browser does not support camera access.");
    }
  };

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    setStream(null);
  }, [stream]);

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleUsePhoto = async () => {
    if (capturedImage) {
      const base64 = capturedImage.split(',')[1];
      const file = await dataUrlToFile(capturedImage, `capture-${Date.now()}.jpg`);
      onImageUpload(base64, file);
      closeCamera();
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (isCameraOpen) {
    return (
      <div className="w-full flex flex-col items-center animate-fade-in">
        <div className="relative w-full max-w-md bg-gray-900 rounded-lg overflow-hidden shadow-lg">
           <div style={{paddingTop: '100%', position: 'relative'}}>
             <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured photo" className="w-full h-full object-cover" />
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                )}
             </div>
           </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4">
          {!capturedImage ? (
            <>
              <button onClick={capturePhoto} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-full shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105">
                Capture
              </button>
              <button onClick={closeCamera} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-full shadow-md hover:bg-gray-700">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={handleUsePhoto} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105">
                Use Photo
              </button>
              <button onClick={handleRetake} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
                Retake
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      {error && (
        <div className="w-full mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center text-red-300 text-sm animate-fade-in">
          <p className="font-bold">Please try another photo</p>
          <p>{error}</p>
        </div>
      )}
      <div
        onClick={handleUploadClick}
        className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-700/50 transition-colors"
      >
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-2 text-sm text-gray-400">{message}</p>
          <p className="text-xs text-gray-500">PNG or JPG up to 4MB</p>
        </div>
      </div>

      <div className="my-4 flex items-center w-full max-w-xs">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <button
        onClick={openCamera}
        className="w-full max-w-xs flex items-center justify-center gap-3 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition"
      >
        <CameraIcon className="w-5 h-5" />
        Take Photo with Camera
      </button>
    </div>
  );
};

export default ImageUploader;
