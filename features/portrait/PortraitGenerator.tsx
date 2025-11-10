// Fix: Provide full content for PortraitGenerator.tsx
import React, { useState, useCallback } from 'react';
import { Part } from '@google/genai';
import { generateTwoImagesFromParts, validateImage } from '../../services/geminiService';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import WardrobeSelector from '../../components/WardrobeSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { 
    PORTRAIT_ATTIRE, 
    PORTRAIT_ASPECT_RATIOS,
    PORTRAIT_PROMPT_BUILDER_OPTIONS
} from '../../constants';

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
  
  // Prompt Builder states
  const [aspectRatio, setAspectRatio] = useState(PORTRAIT_ASPECT_RATIOS[0].value);
  const [setting, setSetting] = useState(PORTRAIT_PROMPT_BUILDER_OPTIONS[0].options[0].value);
  const [pose, setPose] = useState(PORTRAIT_PROMPT_BUILDER_OPTIONS[1].options[0].value);
  const [expression, setExpression] = useState(PORTRAIT_PROMPT_BUILDER_OPTIONS[2].options[0].value);
  
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
    
    let attirePrompt = '';
    if (customAttireImage) {
      parts.push({ inlineData: { data: customAttireImage, mimeType: 'image/png' }});
      attirePrompt = 'Dress them in the clothing shown in the second image. The style and fit should be adapted to their body.';
    } else {
      let clothingDescriptions = [];
      if(upperAttire) clothingDescriptions.push(upperAttire);
      if(lowerAttire) clothingDescriptions.push(lowerAttire);
      if(clothingDescriptions.length > 0) {
        attirePrompt = `The person should be ${clothingDescriptions.join(' and ')}.`;
      }
    }

    let prompt = `
      PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE. The user's facial features, hair, and head shape must be preserved with 100% accuracy.

      TASK: Create a photorealistic, high-quality portrait of the person from the first image based on the following creative direction.

      CREATIVE DIRECTION:
      1.  **Identity Lock**: The subject's face, hair, and head MUST be identical to the source image.
      2.  **Aspect Ratio**: The final image MUST have an aspect ratio of exactly ${aspectRatio}. Crop the scene, not the person, to fit this ratio.
      3.  **Scene**: The person should be ${setting}.
      4.  **Pose & Expression**: Their pose should be ${pose}, ${expression}.
      5.  **Attire**: ${attirePrompt}
      6.  **Overall Style**: The final image should look like a professional photograph with cinematic lighting. It must be photorealistic.
    `;

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
  
  const handleAttireCategoryChange = (category: string) => {
    setAttireCategory(category);
    setUpperAttire(PORTRAIT_ATTIRE[category].upper[0].prompt);
    setLowerAttire(PORTRAIT_ATTIRE[category].lower[0].prompt);
    setCustomAttireImage(null); 
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
            
            {/* Prompt Builder */}
             <div className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Portrait Prompt Builder</h3>
                <OptionSelector 
                    label="Aspect Ratio"
                    options={PORTRAIT_ASPECT_RATIOS}
                    value={aspectRatio}
                    onChange={setAspectRatio}
                />
                 {PORTRAIT_PROMPT_BUILDER_OPTIONS.map(group => (
                     <OptionSelector 
                        key={group.label}
                        label={group.label}
                        options={group.options}
                        value={group.label === 'Setting' ? setting : group.label === 'Pose / Action' ? pose : expression}
                        onChange={group.label === 'Setting' ? setSetting : group.label === 'Pose / Action' ? setPose : setExpression}
                    />
                 ))}
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
        <>
        <ComplianceChecklist 
            title="Portrait Photo Tips"
            items={[
                "Use a clear, well-lit photo of one person.",
                "Head and shoulders should be visible.",
                "A simple background works best.",
                "Avoid blurry photos or photos with harsh shadows."
            ]}
        />
        <ImageUploader 
            onImageUpload={handleImageUpload}
            message="Upload a portrait to get started"
            error={validationError}
        />
        </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-center">AI Portrait Generator</h2>
      <p className="text-gray-400 mb-4 text-center">
        Create professional or creative portraits. Use our prompt builder to design your perfect shot!
      </p>
      {renderContent()}
    </div>
  );
};

export default PortraitGenerator;
