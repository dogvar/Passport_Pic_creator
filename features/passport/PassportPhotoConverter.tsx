import React, { useState, useCallback, useMemo } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { generateImage, validateImage } from '../../services/geminiService';
import { PASSPORT_COUNTRIES, FORMAL_ATTIRE } from '../../constants';
import { ValidationResult, PassportCountry } from '../../types';

type Stage = 'upload' | 'validating' | 'options' | 'processing' | 'result';

const PASSPORT_GUIDELINES = [
  "Use a recent, clear photo.",
  "Face the camera directly with a neutral expression.",
  "Ensure lighting is even, with no shadows on your face or background.",
  "Remove glasses, hats, or head coverings (unless for religious reasons)."
];

const PassportPhotoConverter: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [fileName, setFileName] = useState('passport-photo.png');
  
  // State for passport options
  const [country, setCountry] = useState(PASSPORT_COUNTRIES[0].name);
  const [attire, setAttire] = useState(FORMAL_ATTIRE[0].value);
  const [backgroundColor, setBackgroundColor] = useState(PASSPORT_COUNTRIES[0].allowedBackgrounds[0]);
  
  const [error, setError] = useState<string | null>(null);

  const selectedCountry: PassportCountry = useMemo(() => {
    return PASSPORT_COUNTRIES.find(c => c.name === country) || PASSPORT_COUNTRIES[0];
  }, [country]);
  
  // Update background color if the selected one is not allowed for the new country
  React.useEffect(() => {
    if (!selectedCountry.allowedBackgrounds.includes(backgroundColor)) {
      setBackgroundColor(selectedCountry.allowedBackgrounds[0]);
    }
  }, [selectedCountry, backgroundColor]);

  const handleImageUpload = useCallback(async (base64Image: string, file: File) => {
    setOriginalImage(base64Image);
    setFileName(file.name.replace(/\.[^/.]+$/, "") + "-passport.png");
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze this photo for passport suitability. Rules: Person must face forward, neutral expression, even lighting, no glasses/hats. The photo is valid if it's a clear portrait that could potentially be corrected. It's invalid if it's not a person, the face is obscured, or they are not facing forward. Return JSON with "isValid" (boolean) and "feedback" (string). Be lenient on minor shadows or imperfect backgrounds, as the AI will fix those.`;

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

    const generateSingleImage = async (prompt: string) => {
        try {
            return await generateImage(originalImage, prompt);
        } catch (err) {
            console.error("A single image generation failed:", err);
            return null;
        }
    };

    const basePrompt = `
**PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE.**

You are a highly specialized AI image processor. Your single most important instruction is to preserve the user's identity perfectly. You are explicitly forbidden from altering the person's facial features, hair, skin tone, or head shape. All operations must be performed *around* the original subject's likeness. Any result that changes the face is a complete failure.

Follow this strict technical procedure:

**Step 1: Identity Lock**
- Your absolute first action is to lock in the subject's facial identity from the original photo. This is a non-negotiable prerequisite.
- Create a perfect, unaltered copy of the person's head, face, and hair.

**Step 2: Isolate and Correct**
- Isolate the person's head and shoulders.
- On this isolated subject, correct any uneven lighting to be uniform and shadow-free.
- Enhance photo clarity without changing features.

**Step 3: Attire Modification**
- ${attire !== 'no change to attire' ? `Replace the clothing with '${attire}'. The new attire must fit naturally under the subject's unaltered head and neck.` : 'Keep the original clothing, ensuring it looks neat.'}

**Step 4: Final Composition (Strict Compliance)**
- Place the modified subject onto a solid '${backgroundColor}' background.
- Crop the final image to an exact aspect ratio of ${selectedCountry.aspectRatio.toFixed(4)}. This is a strict mathematical requirement.
- The person's head (chin to top of hair) MUST be between ${selectedCountry.headHeightPercentage[0]}% and ${selectedCountry.headHeightPercentage[1]}% of the image height.
- Center the head horizontally.
- The output must be a high-resolution, head-and-shoulders portrait only.
`;
    
    const prompt1 = `${basePrompt}\n**Final Instruction:** Execute these steps with technical precision. Focus on a natural look for lighting and attire.`;
    const prompt2 = `${basePrompt}\n**Final Instruction:** Adhere strictly to the numerical constraints for the final output. Ensure the background is perfectly uniform.`;

    try {
        const results = await Promise.all([
            generateSingleImage(prompt1),
            generateSingleImage(prompt2)
        ]);
        
        const successfulResults = results.filter((img): img is string => img !== null);

        if (successfulResults.length > 0) {
            setResultImages(successfulResults);
            setStage('result');
        } else {
            throw new Error('Image generation failed for all attempts. The model may have refused the request. Please try a different photo.');
        }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('options');
    }
  }, [originalImage, attire, backgroundColor, selectedCountry]);
  
  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImages([]);
    setError(null);
    setCountry(PASSPORT_COUNTRIES[0].name);
    setAttire(FORMAL_ATTIRE[0].value);
    setBackgroundColor(PASSPORT_COUNTRIES[0].allowedBackgrounds[0]);
  }, []);

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
            <ComplianceChecklist title="Passport Photo Requirements" items={PASSPORT_GUIDELINES} />
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              message="Upload a photo for your passport"
              error={error}
            />
          </>
        );
      case 'validating':
        return <LoadingSpinner message="Checking photo compliance..." />;
      case 'options':
        return (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-100">Passport Photo Options</h3>
            <img src={`data:image/jpeg;base64,${originalImage}`} alt="Preview" className="max-h-40 w-auto rounded-lg shadow-lg" />
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OptionSelector label="Country" options={PASSPORT_COUNTRIES} value={country} onChange={setCountry} valueKey="name" labelKey="name" />
              <OptionSelector label="Attire" options={FORMAL_ATTIRE} value={attire} onChange={setAttire} />
              <OptionSelector 
                label="Background Color" 
                options={selectedCountry.allowedBackgrounds.map(c => ({label: c.charAt(0).toUpperCase() + c.slice(1), value: c}))} 
                value={backgroundColor} 
                onChange={setBackgroundColor} 
              />
               <div className="sm:col-span-2 text-center bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-300 font-semibold">Dimensions: {selectedCountry.dimensions}</p>
              </div>
            </div>
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <button onClick={handleGenerate} className="mt-4 px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105">
              Generate Photos
            </button>
          </div>
        );
      case 'processing':
        return <LoadingSpinner message="Generating your passport photos..." />;
      case 'result':
        return resultImages.length > 0 ? <ResultDisplay images={resultImages} onDownload={handleDownload} onReset={handleReset} fileName={fileName} /> : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PassportPhotoConverter;