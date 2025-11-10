// Fix: Provide full content for PassportPhotoConverter.tsx
import React, { useState, useCallback } from 'react';
import { generateTwoImages, validateImage } from '../../services/geminiService';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { COUNTRY_SPECS, PASSPORT_BG_PROMPTS, PASSPORT_VALIDATION_PROMPT, PASSPORT_FORMAL_ATTIRE } from '../../constants';
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
  const [selectedBackground, setSelectedBackground] = useState<string>(COUNTRY_SPECS[0].allowedBackgrounds[0]);
  const [selectedAttire, setSelectedAttire] = useState<string>(PASSPORT_FORMAL_ATTIRE[0].value);

  const resetState = useCallback(() => {
    setBase64Image(null);
    setOriginalFile(null);
    setIsValidating(false);
    setValidationError(null);
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedImages([]);
    setSelectedCountry(COUNTRY_SPECS[0]);
    setSelectedBackground(COUNTRY_SPECS[0].allowedBackgrounds[0]);
    setSelectedAttire(PASSPORT_FORMAL_ATTIRE[0].value);
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
    if (!base64Image || !selectedCountry) return;

    setIsGenerating(true);
    setGenerationError(null);
    
    const { photoSizeMM, headHeightPercentage, otherRequirements } = selectedCountry;
    const aspectRatio = `${photoSizeMM.width}:${photoSizeMM.height}`;
    const backgroundPrompt = PASSPORT_BG_PROMPTS[selectedBackground];
    
    const attirePrompt = selectedAttire !== 'no change' 
        ? `The person should be dressed in ${selectedAttire}. The new attire must look realistic and appropriate for a passport photo.`
        : 'The person\'s clothing must remain completely unchanged from the original photo.';

    const fullPrompt = `
      PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE. The user's facial features, hair, and head shape must be preserved with 100% accuracy. This is a technical conversion, not an artistic interpretation.

      TASK: Convert the user's photo into a regulation-compliant passport photo according to the following strict technical specifications.

      SPECIFICATIONS:
      1.  **Image Geometry**:
          -   Final Aspect Ratio: ${aspectRatio}. The final image MUST conform to this exact ratio with no distortion.
          -   Composition: The image must be a close-up of the head and top of the shoulders.
          -   Head Size: The height of the head (from the bottom of the chin to the top of the hair) MUST occupy between ${headHeightPercentage.min}% and ${headHeightPercentage.max}% of the total image height.
          -   Centering: The head must be centered horizontally within the frame.
          -   No Padding: The generated image MUST fill the entire canvas of the specified aspect ratio. There must be absolutely no borders, letterboxing, or padding of any kind.

      2.  **Subject & Attire**:
          -   Identity Lock: The subject's face, hair, and head MUST be identical to the source image.
          -   Attire: ${attirePrompt}

      3.  **Background**:
          -   Replace the original background completely with ${backgroundPrompt}. The background must be featureless and uniform.

      4.  **Lighting & Quality**:
          -   Correct any uneven lighting on the subject's face to be uniform and clear.
          -   Remove any shadows on the face or in the background.
          -   The final image must be high-resolution, sharp, and in focus.

      5.  **Other Official Requirements**:
          -   ${otherRequirements.join('\n          -   ')}

      FINAL VERIFICATION CHECKLIST (Internal):
      Before outputting the image, verify it meets these non-negotiable criteria:
      - Is the user's face identical to the source image? -> Must be YES.
      - Does the image aspect ratio exactly match ${aspectRatio}? -> Must be YES.
      - Is the head height between ${headHeightPercentage.min}% and ${headHeightPercentage.max}% of the total height? -> Must be YES.
      - Does the image fill the entire frame with no padding? -> Must be YES.

      Generate two distinct options that both strictly adhere to all of the above specifications.
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
    link.download = `passport_photo_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCountryChange = (value: string) => {
      const country = COUNTRY_SPECS.find(c => c.name === value);
      if(country) {
          setSelectedCountry(country);
          setSelectedBackground(country.allowedBackgrounds[0]);
      }
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
                    <p className="text-sm text-gray-400 text-center sm:text-left">Next, configure the output settings for your passport photo.</p>
                </div>
            </div>
            {generationError && (
                <div className="w-full p-3 bg-red-900/50 border border-red-500 rounded-lg text-center text-red-300 text-sm">
                    <p>{generationError}</p>
                </div>
            )}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionSelector 
                    label="Country"
                    options={COUNTRY_SPECS}
                    value={selectedCountry.name}
                    onChange={handleCountryChange}
                    valueKey="name"
                    labelKey="name"
                />
                 <div className="text-center sm:text-left bg-gray-700/50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Photo Dimensions</label>
                    <p className="text-white font-mono">{selectedCountry.photoSizeMM.width}mm x {selectedCountry.photoSizeMM.height}mm</p>
                </div>
            </div>
             <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionSelector 
                    label="Background Color"
                    options={selectedCountry.allowedBackgrounds.map(bg => ({ label: bg.charAt(0).toUpperCase() + bg.slice(1), value: bg }))}
                    value={selectedBackground}
                    onChange={setSelectedBackground}
                />
                 <OptionSelector 
                    label="Formal Attire (Optional)"
                    options={PASSPORT_FORMAL_ATTIRE}
                    value={selectedAttire}
                    onChange={setSelectedAttire}
                />
            </div>

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
        Upload your photo, and we'll automatically adjust it to meet official requirements.
      </p>
      {renderContent()}
    </div>
  );
};

export default PassportPhotoConverter;
