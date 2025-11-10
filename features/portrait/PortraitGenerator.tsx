import React, { useState, useCallback } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { generateImage, validateImage } from '../../services/geminiService';
import { PORTRAIT_BACKGROUNDS, PORTRAIT_POSES, PORTRAIT_EXPRESSIONS, PORTRAIT_STYLES } from '../../constants';
import { ValidationResult } from '../../types';

type Stage = 'upload' | 'validating' | 'options' | 'processing' | 'result';

const PORTRAIT_GUIDELINES = [
  "Ensure your face is in focus and well-lit.",
  "A photo from the chest up usually works best.",
  "You can smile or use any expression you like.",
  "The background will be replaced, so don't worry about it."
];

const PortraitGenerator: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('portrait.png');
  const [background, setBackground] = useState(PORTRAIT_BACKGROUNDS[0].value);
  const [pose, setPose] = useState(PORTRAIT_POSES[0].value);
  const [expression, setExpression] = useState(PORTRAIT_EXPRESSIONS[0].value);
  const [style, setStyle] = useState(PORTRAIT_STYLES[0].value);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (base64Image: string, file: File) => {
    setOriginalImage(base64Image);
    setFileName(file.name.replace(/\.[^/.]+$/, "") + "-portrait.png");
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze if this is a suitable photo for creating a professional portrait. Return a JSON object with "isValid" (boolean) and "feedback" (string). The photo is valid if a person's face is reasonably clear and visible. It's okay if they are not looking at the camera. It is invalid if it's not a photo of a person or the face is completely obscured or very blurry. Provide a simple reason if invalid.`;

    const result: ValidationResult = await validateImage(base64Image, validationPrompt);
    
    if (result.isValid) {
      setStage('options');
    } else {
      setError(result.feedback);
      setStage('upload');
      setOriginalImage(null);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!originalImage) return;

    setStage('processing');
    setError(null);

    const prompt = `Using the user's photo, create a professional portrait with a standard portrait aspect ratio (e.g., 4:5 or 3:4), making it larger and more suitable for a profile picture than a square passport photo.
- Background: Replace the background with a realistic scene of ${background}.
- Pose: Subtly adjust the person's pose to be a ${pose}.
- Expression: Refine their facial expression to be a ${expression}.
- Style: Apply a ${style} stylistic filter to the image.
- The final result should be high-quality and suitable for a professional profile like LinkedIn.`;

    try {
      const generated = await generateImage(originalImage, prompt);
      setResultImage(generated);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('options');
    }
  }, [originalImage, background, pose, expression, style]);
  
  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    setBackground(PORTRAIT_BACKGROUNDS[0].value);
    setPose(PORTRAIT_POSES[0].value);
    setExpression(PORTRAIT_EXPRESSIONS[0].value);
    setStyle(PORTRAIT_STYLES[0].value);
  }, []);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;
    const mimeType = resultImage.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${resultImage}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage, fileName]);

  const renderContent = () => {
    switch (stage) {
      case 'upload':
        return (
          <>
            <ComplianceChecklist title="Photo Tips for Best Results" items={PORTRAIT_GUIDELINES} />
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              message="Upload a photo for your new portrait"
              error={error}
            />
          </>
        );
      case 'validating':
        return <LoadingSpinner message="Analyzing your photo..." />;
      case 'options':
        return (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-100">Create Your Perfect Portrait</h3>
            <img src={`data:image/jpeg;base64,${originalImage}`} alt="Preview" className="max-h-48 w-auto rounded-lg shadow-lg" />
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OptionSelector label="Background" options={PORTRAIT_BACKGROUNDS} value={background} onChange={setBackground} />
              <OptionSelector label="Pose" options={PORTRAIT_POSES} value={pose} onChange={setPose} />
              <OptionSelector label="Expression" options={PORTRAIT_EXPRESSIONS} value={expression} onChange={setExpression} />
              <OptionSelector label="Style" options={PORTRAIT_STYLES} value={style} onChange={setStyle} />
            </div>
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <button onClick={handleGenerate} className="mt-4 px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105">
              Generate Portrait
            </button>
          </div>
        );
      case 'processing':
        return <LoadingSpinner message="Crafting your professional portrait..." />;
      case 'result':
        return resultImage ? <ResultDisplay image={resultImage} onDownload={handleDownload} onReset={handleReset} /> : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PortraitGenerator;
