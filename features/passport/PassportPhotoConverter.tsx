import React, { useState, useCallback, useMemo } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { generateImage } from '../../services/geminiService';
import { validateImage } from '../../services/geminiService';
import { PASSPORT_COUNTRIES, PORTRAIT_ATTIRE } from '../../constants';
import { ValidationResult, PassportCountry, Option } from '../../types';

type Stage = 'upload' | 'validating' | 'processing' | 'result';

const PASSPORT_GUIDELINES = [
  "Use a recent, clear, in-focus photo.",
  "Face the camera directly with a neutral expression.",
  "Ensure your eyes are open and clearly visible.",
  "Avoid shadows on your face or in the background.",
  "We'll replace the background and adjust lighting for you."
];

// Fix: Rewrote FORMAL_ATTIRE_OPTIONS to be type-safe and resolve the union type error.
const FORMAL_ATTIRE_OPTIONS: Option[] = [
    { value: PORTRAIT_ATTIRE["Man"].upper[1].prompt, label: PORTRAIT_ATTIRE["Man"].upper[1].name }, // Dark Suit
    { value: 'a professional black blazer', label: 'Black Blazer' },
    { value: 'a simple collared shirt', label: 'Collared Shirt' },
    { value: 'no change to attire', label: 'No Change' },
];


const PassportPhotoConverter: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [fileName, setFileName] = useState('passport-photo.png');
  
  const [countryName, setCountryName] = useState(PASSPORT_COUNTRIES[0].name);
  const [attire, setAttire] = useState(FORMAL_ATTIRE_OPTIONS[FORMAL_ATTIRE_OPTIONS.length - 1].value); // Default to 'No Change'
  const [background, setBackground] = useState(PASSPORT_COUNTRIES[0].allowedBackgrounds[0]);

  const [error, setError] = useState<string | null>(null);

  const selectedCountry = useMemo(() => {
    const country = PASSPORT_COUNTRIES.find(c => c.name === countryName);
    if (country && !country.allowedBackgrounds.includes(background)) {
        setBackground(country.allowedBackgrounds[0]);
    }
    return country || PASSPORT_COUNTRIES[0];
  }, [countryName, background]);

  const handleGenerate = useCallback(async (base64Image: string, country: PassportCountry, selectedAttire: string, selectedBg: string) => {
    if (!base64Image) return;

    setStage('processing');
    setError(null);
    
    const headHeightTarget = (country.headHeightPercentage[0] + country.headHeightPercentage[1]) / 2;

    const createPrompt = (variation: number) => `
**PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE, HAIR, OR HEAD SHAPE. This is the most important rule.**

You are a technical expert passport photo generator. Your absolute priority is to preserve the person's identity perfectly. You are explicitly forbidden from altering the person's facial features, hair, skin tone, or head shape. The result must be the same person.

**Task**: Convert the user's photo into an official passport photo that meets the requirements for **${country.name}**.

Follow these technical specifications with extreme precision:

1.  **Identity Lock**: Before any other step, perfectly lock in the subject's exact facial likeness, hair, and head shape from the original photo. This is a non-negotiable constraint.

2.  **Background**: Replace the original background with a solid, perfectly uniform, and featureless **${selectedBg}** color.

3.  **Attire**: ${selectedAttire !== 'no change to attire' ? `Change the person's clothing to '${selectedAttire}'. The new clothing must look photorealistic, professional, simple, and not obscure their neck.` : 'Keep the original clothing.'}

4.  **Lighting**: Correct any uneven lighting and remove shadows on the face and background to be flattering but realistic. Do not alter skin tone.

5.  **Final Composition**:
    -   **CRITICAL**: The output image MUST have a precise aspect ratio of **${country.aspectRatio.toFixed(4)}** (width/height). Generate the image on a canvas of this exact proportion.
    -   **CRITICAL**: The final image MUST NOT contain any padding, borders, or letterboxing. The subject and background must fill the entire canvas, edge to edge.
    -   The person must be centered.
    -   The head height (from chin to top of hair) must be approximately **${headHeightTarget.toFixed(0)}%** of the total photo height.
    -   The person must be facing directly forward with a neutral expression.

6.  **Verification**: Before finalizing, verify that the face is 100% identical to the original and that all geometric constraints (aspect ratio, head height, no padding) have been met. This is a technical check for precision. For this variation (${variation}), interpret the lighting slightly differently but keep all other constraints identical.
`;

    try {
      const generationPromises = [
          generateImage(base64Image, createPrompt(1)),
          generateImage(base64Image, createPrompt(2))
      ];
      const generated = await Promise.all(generationPromises);
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
    setFileName(`${safeFileName}-passport-${selectedCountry.name.toLowerCase().replace(/ /g, '-')}.png`);
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze this photo for its suitability as a base for a passport photo. The photo is valid if a person's face is reasonably clear, visible, and facing generally forward. The lighting must be good enough to see their features. It is invalid if it's not a photo of a person, the face is completely obscured, blurry, or at a sharp angle. Return a JSON object with "isValid" (boolean) and "feedback" (string). Provide a simple reason if invalid.`;

    try {
      const result: ValidationResult = await validateImage(base64Image, validationPrompt);
      
      if (result.isValid) {
        handleGenerate(base64Image, selectedCountry, attire, background);
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
  }, [selectedCountry, attire, background, handleGenerate]);
  
  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImages([]);
    setError(null);
    setCountryName(PASSPORT_COUNTRIES[0].name);
    setAttire(FORMAL_ATTIRE_OPTIONS[FORMAL_ATTIRE_OPTIONS.length - 1].value);
    setBackground(PASSPORT_COUNTRIES[0].allowedBackgrounds[0]);
  }, []);

  const handleDownload = useCallback((selectedImage: string) => {
    if (!selectedImage) return;
    const mimeType = 'image/jpeg';
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${selectedImage}`;
    link.download = fileName.replace(/\.[^/.]+$/, ".jpg");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileName]);
  
  const renderContent = () => {
    switch (stage) {
      case 'upload':
        return (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
             <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionSelector
                  label="Select Country"
                  options={PASSPORT_COUNTRIES}
                  value={countryName}
                  onChange={setCountryName}
                  valueKey="name"
                  labelKey="name"
                />
                <OptionSelector
                  label="Background Color"
                  options={selectedCountry.allowedBackgrounds.map(bg => ({value: bg, label: bg.charAt(0).toUpperCase() + bg.slice(1)}))}
                  value={background}
                  onChange={setBackground}
                />
            </div>
             <div className="w-full max-w-lg">
                 <OptionSelector
                  label="Change Attire (Optional)"
                  options={FORMAL_ATTIRE_OPTIONS}
                  value={attire}
                  onChange={setAttire}
                />
            </div>
            <p className="text-sm text-center text-gray-400 max-w-lg">
                Selected Country: <span className="font-bold text-white">{selectedCountry.name}</span>. Dimensions: {selectedCountry.dimensions}.
            </p>
            <ComplianceChecklist title="Photo Requirements" items={PASSPORT_GUIDELINES} />
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              message="Upload a photo to convert"
              error={error}
            />
          </div>
        );
      case 'validating':
        return <LoadingSpinner message="Analyzing your photo..." />;
      case 'processing':
        return <LoadingSpinner message={`Generating ${selectedCountry.name} passport photo...`} />;
      case 'result':
        return resultImages.length > 0 ? <ResultDisplay images={resultImages} onDownload={handleDownload} onReset={handleReset} fileName={fileName} /> : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PassportPhotoConverter;