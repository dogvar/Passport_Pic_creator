import React, { useState, useCallback } from 'react';
import { generateTwoImages, validateImage } from '../../services/geminiService';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import { PORTRAIT_SCENES, PORTRAIT_WARDROBE } from '../../constants';
import WardrobeSelector from '../../components/WardrobeSelector';
import DisclaimerNotice from '../../components/DisclaimerNotice';
import OptionSelector from '../../components/OptionSelector';

const PORTRAIT_VALIDATION_PROMPT = `
  Analyze the user-provided image to determine if it's suitable as a starting point for a professional portrait.
  Check for the following potential issues and provide a clear, user-friendly "feedback" message if any are found.
  The 'isValid' flag should be false if any critical issue is detected.

  Critical Issues (isValid: false):
  1.  **Face not visible or obstructed**: Is the face heavily shadowed, turned away, covered by hands/hair, or otherwise not clearly visible?
  2.  **Multiple people**: Are there multiple people in the photo?
  3.  **Non-human subject**: Is the subject an animal, cartoon, or object?
  4.  **Very low resolution/blurry**: Is the image extremely blurry or pixelated?

  If the image is good, set 'isValid' to true and provide positive feedback like "This photo is a great starting point!".
  Your response must be in JSON format.
`;

const PortraitGenerator: React.FC = () => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const [selectedScene, setSelectedScene] = useState<string>(PORTRAIT_SCENES[0].prompt);
  const [selectedWardrobe, setSelectedWardrobe] = useState<string>(PORTRAIT_WARDROBE[0].id);

  const resetState = useCallback(() => {
    setBase64Image(null);
    setOriginalFile(null);
    setIsValidating(false);
    setValidationError(null);
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedImages([]);
    setSelectedScene(PORTRAIT_SCENES[0].prompt);
    setSelectedWardrobe(PORTRAIT_WARDROBE[0].id);
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
        setOriginalFile(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown validation error occurred.";
      setValidationError(errorMessage);
      setBase64Image(null);
      setOriginalFile(null);
    } finally {
      setIsValidating(false);
    }
  }, [resetState]);
  
  const handleGenerate = async () => {
    if (!base64Image) return;

    setIsGenerating(true);
    setGenerationError(null);

    const wardrobeItem = PORTRAIT_WARDROBE.find(w => w.id === selectedWardrobe);
    const attirePrompt = wardrobeItem ? wardrobeItem.prompt : 'The person\'s clothing must remain completely unchanged.';
    
    const fullPrompt = `
      **Primary Goal: Create a high-quality, professional portrait.**

      **Critical Rule: The subject's face, hair, and head shape from the original photo MUST be preserved with 100% accuracy. DO NOT alter the person's identity or facial expression.**

      **Execution Steps:**
      1.  **Isolate Subject**: Isolate the person's upper body from the original image.
      2.  **Apply Attire**: ${attirePrompt} The clothing must look photorealistic.
      3.  **Set Scene**: Place the subject in the following scene: ${selectedScene}. The background must have a natural, artistic blur (bokeh) to keep the focus on the person.
      4.  **Apply Lighting**: Use professional portrait lighting to create a high-quality, flattering image.
      5.  **Final Composition:**
          -   The composition should be a head-and-shoulders or upper-bust portrait.
          -   The final image must be high-resolution, sharp, and photorealistic, resembling a professional photograph.
    `;

    try {
      const images = await generateTwoImages(base64Image, fullPrompt);
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
    link.download = `portrait_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderContent = () => {
    if (isGenerating) {
        return <LoadingSpinner message="Generating your portraits..." />;
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
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <img src={`data:image/jpeg;base64,${base64Image}`} alt="Uploaded preview" className="w-32 h-32 rounded-lg object-cover" />
                <div className="flex-1">
                    <p className="text-green-400 font-semibold mb-2 text-center sm:text-left">✓ Photo is ready!</p>
                    <p className="text-sm text-gray-400 text-center sm:text-left">Now, choose a style and wardrobe for your new portrait.</p>
                </div>
            </div>
            {generationError && (
                <div className="w-full p-3 bg-red-900/50 border border-red-500 rounded-lg text-center text-red-300 text-sm">
                    <p>{generationError}</p>
                </div>
            )}
            
            <OptionSelector
                label="Select a Scene / Background"
                options={PORTRAIT_SCENES}
                value={selectedScene}
                onChange={setSelectedScene}
                valueKey="prompt"
                labelKey="name"
            />

            <WardrobeSelector
                options={PORTRAIT_WARDROBE}
                value={selectedWardrobe}
                onChange={setSelectedWardrobe}
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
        <DisclaimerNotice />
        <div className="mb-6" />
        <ImageUploader 
            onImageUpload={handleImageUpload}
            message="Upload a clear, forward-facing photo"
            error={validationError}
        />
        </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-center">AI Portrait Generator</h2>
      <p className="text-gray-400 mb-4 text-center">
        Create professional-quality headshots and portraits in seconds.
      </p>
      {renderContent()}
    </div>
  );
};

export default PortraitGenerator;