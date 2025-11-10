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
        ? `Apply the following attire to the person: ${selectedAttire}. The clothing must look realistic and appropriate for an official photograph.`
        : 'Keep the person\'s original clothing completely unchanged.';

    const fullPrompt = `
      **Primary Goal: Create a regulation-compliant passport photo.**

      **Critical Rule: The subject's face, hair, and head shape from the original photo MUST be preserved with 100% accuracy. DO NOT alter the person's identity.**

      **Execution Steps:**
      1.  **Isolate Subject**: Isolate the person's head and upper shoulders from the original image.
      2.  **Correct Lighting**: Apply even, professional lighting to the subject's face. Remove all shadows from the face.
      3.  **Apply Attire**: ${attirePrompt}
      4.  **Set Background**: Place the subject on ${backgroundPrompt}. The background must be completely uniform with no shadows or textures.
      5.  **Final Composition (Strict Rules):**
          -   The final image's aspect ratio MUST BE exactly **${aspectRatio}**.
          -   The final image must be a close-up of the head and the very top of the shoulders.
          -   The head height (chin to top of hair) MUST be between **${headHeightPercentage.min}% and ${headHeightPercentage.max}%** of the total image height.
          -   The head MUST be centered horizontally.
          -   The final image MUST fill the entire frame. **There must be no padding, borders, or empty space.**
          -   The image must be high-resolution, sharp, and photorealistic.
          -   Adhere to these additional rules: ${otherRequirements.join(', ')}.
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