// Fix: Provide full content for PortraitGenerator.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Part } from '@google/genai';
import { generateTwoImagesFromParts, validateImage } from '../../services/geminiService';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import WardrobeSelector from '../../components/WardrobeSelector';
import DisclaimerNotice from '../../components/DisclaimerNotice';
import { PORTRAIT_SCENES, PORTRAIT_ATTIRE } from '../../constants';

const PORTRAIT_VALIDATION_PROMPT = `
You are a photo analyzer. Your task is to determine if the uploaded image contains a clearly visible person suitable for a portrait.
The image is suitable if it shows at least the head and shoulders of one person. The face should be reasonably clear.
Return your response as a JSON object with two keys: "isValid" (boolean) and "feedback" (string).
If the image is not suitable, the "feedback" should explain why (e.g., "No person was detected in the image.", "The face is too blurry or obscured.").
If it is suitable, the feedback should be simple: "The photo is suitable for generating a portrait."`;

const PortraitGenerator: React.FC = () => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  // Style states
  const [sceneCategory, setSceneCategory] = useState(Object.keys(PORTRAIT_SCENES)[0]);
  const [selectedScene, setSelectedScene] = useState(PORTRAIT_SCENES[sceneCategory][0].prompt);
  
  // Wardrobe states
  const [attireCategory, setAttireCategory] = useState(Object.keys(PORTRAIT_ATTIRE)[0]);
  const [upperAttire, setUpperAttire] = useState(PORTRAIT_ATTIRE[attireCategory].upper[0].prompt);
  const [lowerAttire, setLowerAttire] = useState(PORTRAIT_ATTIRE[attireCategory].lower[0].prompt);
  const [customAttireImage, setCustomAttireImage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setBase64Image(null);
    setOriginalFile(null);
    setIsValidating(false);
    setValidationError(null);
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedImages([]);
    // Don't reset style options
  }, []);

  const handleImageUpload = useCallback(async (b64Image: string, file: File) => {
    resetState();
    setBase64Image(b64Image);
    setOriginalFile(file);
    setValidationError(null);
    setGenerationError(null);
    setIsValidating(true);

    try {
      const result = await validateImage(b64Image, PORTRAIT_VALIDATION_PROMPT);
      if (!result.isValid) {
        setValidationError(result.feedback);
        setBase64Image(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown validation error occurred.";
      setValidationError(errorMessage);
      setBase64Image(null);
    } finally {
      setIsValidating(false);
    }
  }, [resetState]);

  const handleGenerate = async () => {
    if (!base64Image) return;

    setIsGenerating(true);
    setGenerationError(null);

    const parts: Part[] = [
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
    ];
    
    let prompt = `Create a photorealistic portrait of the person from the first image.
    Preserve their facial features, hair, and identity perfectly.
    The final image should look like a real photograph.
    Place them in this scene: ${selectedScene}.`;

    if (customAttireImage) {
      parts.push({ inlineData: { data: customAttireImage, mimeType: 'image/png' }}); // assuming png or jpeg
      prompt += `\nDress them in the clothing shown in the second image. The style and fit should be adapted to their body.`;
    } else {
      prompt += `\nThey should be ${upperAttire}.`;
    }

    parts.push({ text: prompt });

    try {
      const images = await generateTwoImagesFromParts(parts);
      setGeneratedImages(images);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown generation error occurred.";
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (selectedImage: string) => {
    const link = document.createElement('a');
    const mimeType = selectedImage.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    link.href = `data:${mimeType};base64,${selectedImage}`;
    link.download = `ai_portrait_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Memoize options to prevent re-renders
  const sceneOptions = useMemo(() => PORTRAIT_SCENES[sceneCategory].map(s => ({label: s.name, value: s.prompt})), [sceneCategory]);

  const handleSceneCategoryChange = (category: string) => {
      setSceneCategory(category);
      setSelectedScene(PORTRAIT_SCENES[category][0].prompt);
  };
  
  const handleAttireCategoryChange = (category: string) => {
    setAttireCategory(category);
    setUpperAttire(PORTRAIT_ATTIRE[category].upper[0].prompt);
    setLowerAttire(PORTRAIT_ATTIRE[category].lower[0].prompt);
    setCustomAttireImage(null); // Clear custom attire when changing category
  };

  const renderContent = () => {
    if (isGenerating) {
        return <LoadingSpinner message="Generating your AI portraits..." />;
    }
    if (generatedImages.length > 0) {
        return <ResultDisplay images={generatedImages} onDownload={handleDownload} onReset={resetState} />;
    }
    if (isValidating) {
        return <LoadingSpinner message="Analyzing your photo..." />;
    }
    if (base64Image) {
      return (
        <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
             <img src={`data:image/jpeg;base64,${base64Image}`} alt="Uploaded preview" className="w-40 h-40 rounded-lg object-cover shadow-lg" />
            
             {generationError && (
                <div className="w-full p-3 bg-red-900/50 border border-red-500 rounded-lg text-center text-red-300 text-sm">
                    <p>{generationError}</p>
                </div>
            )}
            
            <DisclaimerNotice />

            {/* Scene Selection */}
             <div className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3 text-center">Choose a Scene</h3>
                <div className="flex justify-center mb-4 border-b border-gray-600">
                    {Object.keys(PORTRAIT_SCENES).map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleSceneCategoryChange(cat)}
                        className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200
                        ${sceneCategory === cat ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
                 <OptionSelector 
                    label="Scene"
                    options={sceneOptions}
                    value={selectedScene}
                    onChange={setSelectedScene}
                    valueKey='value'
                    labelKey='label'
                />
            </div>
            
            {/* Wardrobe Selection */}
            <WardrobeSelector
              category={attireCategory}
              onCategoryChange={handleAttireCategoryChange}
              upperAttire={upperAttire}
              onUpperAttireChange={setUpperAttire}
              lowerAttire={lowerAttire}
              onLowerAttireChange={setLowerAttire}
              onCustomAttireUpload={setCustomAttireImage}
            />

            <button
                onClick={handleGenerate}
                className="w-full px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105"
            >
                Generate Portrait
            </button>
             <button onClick={resetState} className="text-sm text-gray-400 hover:text-white transition">
                Use a different photo
             </button>
        </div>
      );
    }
    
    return (
        <ImageUploader 
            onImageUpload={handleImageUpload}
            message="Upload a portrait to get started"
            error={validationError}
        />
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-center">AI Portrait Generator</h2>
      <p className="text-gray-400 mb-4 text-center">
        Create professional or creative portraits from a single photo. Choose your scene and wardrobe!
      </p>
      {renderContent()}
    </div>
  );
};

export default PortraitGenerator;
