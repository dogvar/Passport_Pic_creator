
import React, { useState, useCallback } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import { generateTwoImages, validateImage } from '../../services/geminiService';
import { PORTRAIT_STYLES } from '../../constants';
import { ValidationResult, PortraitStyle } from '../../types';
import WardrobeSelector from '../../components/WardrobeSelector';
import DisclaimerNotice from '../../components/DisclaimerNotice';

type Stage = 'upload' | 'validating' | 'processing' | 'result';

const PortraitGenerator: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [fileName, setFileName] = useState('portrait.png');
  const [selectedStyle, setSelectedStyle] = useState<PortraitStyle>(PORTRAIT_STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (base64Image: string, stylePrompt: string, userPrompt: string) => {
    if (!base64Image) return;

    setStage('processing');
    setError(null);

    const finalPrompt = `
**PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE. The generated image must look like the same person.**

**Task**: Transform the user's photo into a high-quality portrait based on the following style.

**Style**: ${stylePrompt}

**User's Additional Instructions**: ${userPrompt || 'None.'}

Follow these rules:
1.  **Identity Lock**: Preserve the person's exact facial features, skin tone, and core identity from the original photo.
2.  **Apply Style**: Creatively apply the requested style to the background, clothing, lighting, and overall mood.
3.  **Quality**: Produce a high-resolution, photorealistic, and aesthetically pleasing image.
`;

    try {
      const generated = await generateTwoImages(base64Image, finalPrompt);
      setResultImages(generated);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('upload');
      setOriginalImage(null);
    }
  }, []);

  const handleImageUpload = useCallback(async (base64Image: string, file: File) => {
    setOriginalImage(base64Image);
    const safeFileName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(`${safeFileName}-portrait-${selectedStyle.name.toLowerCase().replace(/ /g, '-')}.png`);
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze this photo. Is it a clear photo of a person's face, suitable for use as a base for a creative portrait? The photo is valid if a person's face is reasonably clear and visible. It is invalid if it's not a photo of a person or the face is completely obscured or blurry. Return a JSON object with "isValid" (boolean) and "feedback" (string). Provide a simple reason if invalid.`;

    try {
      const result: ValidationResult = await validateImage(base64Image, validationPrompt);
      if (result.isValid) {
        handleGenerate(base64Image, selectedStyle.prompt, customPrompt);
      } else {
        setError(result.feedback);
        setStage('upload');
        setOriginalImage(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during validation.');
      setStage('upload');
      setOriginalImage(null);
    }
  }, [selectedStyle, customPrompt, handleGenerate]);

  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImages([]);
    setError(null);
    setSelectedStyle(PORTRAIT_STYLES[0]);
    setCustomPrompt('');
  }, []);

  const handleDownload = useCallback((selectedImage: string) => {
    if (!selectedImage) return;
    const mimeType = 'image/png';
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${selectedImage}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileName]);

  const renderContent = () => {
    switch (stage) {
      case 'upload':
        return (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <WardrobeSelector
              styles={PORTRAIT_STYLES}
              selectedStyle={selectedStyle}
              onStyleSelect={setSelectedStyle}
            />
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add more details (e.g., 'wearing a silver crown', 'with a dramatic sunset in the background')..."
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 transition"
              rows={2}
            />
            <DisclaimerNotice />
            <ImageUploader
              onImageUpload={handleImageUpload}
              message="Upload a photo to create a portrait"
              error={error}
            />
          </div>
        );
      case 'validating':
        return <LoadingSpinner message="Checking your photo..." />;
      case 'processing':
        return <LoadingSpinner message={`Creating your ${selectedStyle.name} portrait...`} />;
      case 'result':
        return resultImages.length > 0 ? (
          <ResultDisplay images={resultImages} onDownload={handleDownload} onReset={handleReset} fileName={fileName} />
        ) : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PortraitGenerator;
