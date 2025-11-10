import React, { useState, useCallback } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import WardrobeSelector from '../../components/WardrobeSelector';
import { generateImage, validateImage } from '../../services/geminiService';
import { PORTRAIT_BACKGROUNDS, PORTRAIT_POSES, PORTRAIT_EXPRESSIONS, PORTRAIT_STYLES, PORTRAIT_ATTIRE } from '../../constants';
import { ValidationResult, WardrobeCategory } from '../../types';

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
  
  // State for portrait options
  const [background, setBackground] = useState(PORTRAIT_BACKGROUNDS[0].value);
  const [pose, setPose] = useState(PORTRAIT_POSES[0].value);
  const [expression, setExpression] = useState(PORTRAIT_EXPRESSIONS[0].value);
  const [style, setStyle] = useState(PORTRAIT_STYLES[0].value);
  const [attireCategory, setAttireCategory] = useState<WardrobeCategory>('man');
  const [attire, setAttire] = useState('no change to attire');

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

    const prompt = `
**PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE.**

You are a creative AI portrait artist, but your creativity has one absolute rule: you must preserve the user's identity perfectly. You are explicitly forbidden from altering the person's facial features, hair, skin tone, or head shape. Your task is to enhance the photo *around* the person, not change who they are. Any result that changes the face is a complete failure.

Follow this procedure:

1.  **Identity Lock**: Before any creative work, lock in the subject's exact facial likeness, hair, and head shape from the original photo. This is your foundational constraint.

2.  **Lighting and Quality**: Correct uneven lighting and harsh shadows on the subject to create a flattering, professional look. Enhance the overall photo clarity without altering features.

3.  **Attire**: ${attire !== 'no change to attire' ? `Change the person's clothing to '${attire}'. The new clothing must look realistic and fit their body shape and pose naturally, integrated with their unaltered head and neck.` : 'Keep their original clothing.'}

4.  **Pose and Expression**: Subtly and realistically adjust the person's pose to be a '${pose}' and refine their expression to be '${expression}'. These changes must be extremely minor and maintain the core identity.

5.  **Background**: Replace the original background with a high-quality, realistic scene of '${background}'. Ensure the lighting on the person is consistent with the new environment.

6.  **Final Touches**: The final image must be a high-resolution portrait with a standard portrait aspect ratio (e.g., 4:5). Apply a '${style}' stylistic filter to complete the look. The result should be professional and authentic to the original person.`;

    try {
      const generated = await generateImage(originalImage, prompt);
      setResultImage(generated);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('options');
    }
  }, [originalImage, background, pose, expression, style, attire]);
  
  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    setBackground(PORTRAIT_BACKGROUNDS[0].value);
    setPose(PORTRAIT_POSES[0].value);
    setExpression(PORTRAIT_EXPRESSIONS[0].value);
    setStyle(PORTRAIT_STYLES[0].value);
    setAttireCategory('man');
    setAttire('no change to attire');
  }, []);

  // FIX: Update handleDownload to accept the selected image string.
  const handleDownload = useCallback((selectedImage: string) => {
    if (!selectedImage) return;
    const mimeType = selectedImage.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
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
            <img src={`data:image/jpeg;base64,${originalImage}`} alt="Preview" className="max-h-40 w-auto rounded-lg shadow-lg" />
            
            <WardrobeSelector
              collection={PORTRAIT_ATTIRE}
              selectedCategory={attireCategory}
              onCategoryChange={setAttireCategory}
              selectedAttire={attire}
              onAttireChange={setAttire}
            />

            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
        // FIX: Pass resultImage as an array to the 'images' prop instead of 'image'.
        return resultImage ? <ResultDisplay images={[resultImage]} onDownload={handleDownload} onReset={handleReset} /> : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PortraitGenerator;