
import React, { useState, useCallback, useMemo } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { generateImage, validateImage } from '../../services/geminiService';
import { PASSPORT_COUNTRIES, FORMAL_ATTIRE } from '../../constants';
import { ValidationResult, PassportCountry } from '../../types';

type Stage = 'upload' | 'validating' | 'processing' | 'result';

const PASSPORT_GUIDELINES = [
  "Use a recent, clear, in-focus photo.",
  "Face the camera directly with a neutral expression.",
  "Ensure your eyes are open and clearly visible.",
  "Avoid shadows on your face or in the background.",
  "We'll replace the background and adjust lighting for you."
];

const PassportPhotoConverter: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('passport-photo.png');
  
  const [countryName, setCountryName] = useState(PASSPORT_COUNTRIES[0].name);
  const [attire, setAttire] = useState(FORMAL_ATTIRE[FORMAL_ATTIRE.length - 1].value); // Default to 'No Change'

  const [error, setError] = useState<string | null>(null);

  const selectedCountry = useMemo(() => {
    return PASSPORT_COUNTRIES.find(c => c.name === countryName) || PASSPORT_COUNTRIES[0];
  }, [countryName]);

  const handleGenerate = useCallback(async (base64Image: string, country: PassportCountry, selectedAttire: string) => {
    if (!base64Image) return;

    setStage('processing');
    setError(null);

    const prompt = `
**PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE, HAIR, OR HEAD SHAPE.**

You are an expert passport photo generator. Your absolute priority is to preserve the person's identity perfectly. You are explicitly forbidden from altering the person's facial features, hair, skin tone, or head shape. The result must be the same person. Any change to the person's face is a complete failure.

**Task**: Convert the user's photo into an official passport photo that meets the requirements for **${country.name}**.

Follow these specifications precisely:

1.  **Identity Lock**: Before any creative work, lock in the subject's exact facial likeness, hair, and head shape from the original photo. This is your foundational constraint.

2.  **Background**: Replace the original background with a solid, uniform, and featureless **${country.allowedBackgrounds[0]}** color.

3.  **Head Position & Size**: The head must be centered. The head height (from chin to top of hair) must be between **${country.headHeightPercentage[0]}% and ${country.headHeightPercentage[1]}%** of the total photo height.

4.  **Attire**: ${selectedAttire !== 'no change to attire' ? `Change the person's clothing to '${selectedAttire}'. The new clothing must be professional, simple, and not obscure their neck.` : 'Keep the original clothing, but ensure it is simple and doesn\\\'t resemble a uniform. Remove any distracting jewelry.'}

5.  **Expression & Pose**: Adjust the pose so the person is facing directly forward. Their expression must be neutral with both eyes open and mouth closed.

6.  **Lighting & Quality**: Correct any uneven lighting and remove shadows on the face and background. The final photo must be clear, in focus, and have natural, unaltered skin tones. Do not apply any artistic filters.

7.  **Final Output**: The final image must have an aspect ratio of **${country.aspectRatio.toFixed(3)}** (width/height). It must be a high-resolution, photorealistic image suitable for official use.
`;

    try {
      const generated = await generateImage(base64Image, prompt);
      setResultImage(generated);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('upload'); // Go back to upload on failure
      setOriginalImage(null);
    }
  }, []);

  const handleImageUpload = useCallback(async (base64Image: string, file: File) => {
    setOriginalImage(base64Image);
    const safeFileName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(`${safeFileName}-passport-${selectedCountry.name.toLowerCase().replace(/ /g, '-')}.png`);
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze this photo for its suitability as a base for a passport photo for ${selectedCountry.name}. The photo is valid if a person's face is reasonably clear, visible, and facing forward. It is invalid if it's not a photo of a person, the face is completely obscured, blurry, or at a sharp angle. Return a JSON object with "isValid" (boolean) and "feedback" (string). Provide a simple reason if invalid.`;

    try {
      const result: ValidationResult = await validateImage(base64Image, validationPrompt);
      
      if (result.isValid) {
        // Automatically proceed to generate the image
        handleGenerate(base64Image, selectedCountry, attire);
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
  }, [selectedCountry, attire, handleGenerate]);
  
  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    setCountryName(PASSPORT_COUNTRIES[0].name);
    setAttire(FORMAL_ATTIRE[FORMAL_ATTIRE.length - 1].value);
  }, []);

  const handleDownload = useCallback((selectedImage: string) => {
    if (!selectedImage) return;
    // Assuming JPEG for passport photos as it's common
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
                  label="Change Attire (Optional)"
                  options={FORMAL_ATTIRE}
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
        return resultImage ? <ResultDisplay images={[resultImage]} onDownload={handleDownload} onReset={handleReset} fileName={fileName} /> : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PassportPhotoConverter;
