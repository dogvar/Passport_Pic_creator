// Fix: Provide full content for PassportPhotoConverter.tsx
import React, { useState, useCallback } from 'react';
import { generateTwoImages, validateImage } from '../../services/geminiService';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { COUNTRY_SPECS, PASSPORT_BG_PROMPTS, PASSPORT_VALIDATION_PROMPT } from '../../constants';
import { CountrySpec } from '../../types';

const PassportPhotoConverter: React.FC = () => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountrySpec>(COUNTRY_SPECS[0]);

  const resetState = useCallback(() => {
    setBase64Image(null);
    setOriginalFile(null);
    setIsValidating(false);
    setValidationError(null);
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedImages([]);
    setSelectedCountry(COUNTRY_SPECS[0]);
  }, []);

  const handleImageUpload = useCallback(async (b64Image: string, file: File) => {
    resetState();
    setBase64Image(b64Image);
    setOriginalFile(file);
    setValidationError(null);
    setGenerationError(null);
    setIsValidating(true);

    try {
      const result = await validateImage(b64Image, PASSPORT_VALIDATION_PROMPT);
      if (!result.isValid) {
        setValidationError(result.feedback);
        setBase64Image(null); // Clear image if not valid
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
    if (!base64Image || !selectedCountry) return;

    setIsGenerating(true);
    setGenerationError(null);
    
    const backgroundPrompt = PASSPORT_BG_PROMPTS[selectedCountry.background];
    const fullPrompt = `Generate a high-resolution, regulation-compliant passport photo of the person in the image. 
    Crucially, replace the existing background with ${backgroundPrompt}.
    The person's facial features, hair, and clothing must remain COMPLETELY UNCHANGED. Do not alter their appearance.
    Ensure the lighting is even and there are no shadows on the face or background.
    The final image should be cropped to show the head and top of the shoulders, centered in the frame.`;

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
    link.download = `passport_photo_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const countryOptions = COUNTRY_SPECS.map(c => ({ label: c.name, value: c.name }));
  const handleCountryChange = (value: string) => {
      const country = COUNTRY_SPECS.find(c => c.name === value);
      if(country) setSelectedCountry(country);
  }

  const renderContent = () => {
    if (isGenerating) {
        return <LoadingSpinner message="Generating your passport photos..." />;
    }
    if (generatedImages.length > 0) {
        return <ResultDisplay images={generatedImages} onDownload={handleDownload} onReset={resetState} />;
    }
    if (isValidating) {
        return <LoadingSpinner message="Checking photo compliance..." />;
    }
    if (base64Image) {
      return (
        <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <img src={`data:image/jpeg;base64,${base64Image}`} alt="Uploaded preview" className="w-32 h-32 rounded-lg object-cover" />
                <div className="flex-1">
                    <p className="text-green-400 font-semibold mb-2 text-center sm:text-left">✓ Photo meets basic requirements!</p>
                    <p className="text-sm text-gray-400 text-center sm:text-left">Next, select your country to ensure the correct background color and format.</p>
                </div>
            </div>
            {generationError && (
                <div className="w-full p-3 bg-red-900/50 border border-red-500 rounded-lg text-center text-red-300 text-sm">
                    <p>{generationError}</p>
                </div>
            )}
            <OptionSelector 
                label="Select Country for Specifications"
                options={countryOptions}
                value={selectedCountry.name}
                onChange={handleCountryChange}
                valueKey="value"
                labelKey="label"
            />
            <button
                onClick={handleGenerate}
                className="w-full px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105"
            >
                Generate Passport Photo
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
            title="Passport Photo Checklist"
            items={[
                "Face forward with a neutral expression.",
                "Use a recent photo with a clear background.",
                "No glasses, hats, or headphones.",
                "Ensure your face is well-lit and in focus.",
            ]}
        />
        <ImageUploader 
            onImageUpload={handleImageUpload}
            message="Upload a photo to begin"
            error={validationError}
        />
        </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-center">Passport Photo Converter</h2>
      <p className="text-gray-400 mb-4 text-center">
        Upload your photo, and we'll automatically adjust the background and formatting to meet official requirements.
      </p>
      {renderContent()}
    </div>
  );
};

export default PassportPhotoConverter;
