import React, { useState, useCallback, useMemo } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import OptionSelector from '../../components/OptionSelector';
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { generateImage, validateImage } from '../../services/geminiService';
import { PASSPORT_COUNTRIES, FORMAL_ATTIRE } from '../../constants';
import { PassportCountry, ValidationResult } from '../../types';

type Stage = 'upload' | 'validating' | 'options' | 'processing' | 'result';

const PASSPORT_GUIDELINES = [
  "Face forward, looking directly at the camera.",
  "Use a neutral facial expression.",
  "Ensure your face is well-lit with no shadows.",
  "Remove glasses, hats, or head coverings (unless for religious reasons).",
  "A plain, light-colored background is best."
];

const PassportPhotoConverter: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('passport-photo.png');
  
  const [selectedCountryName, setSelectedCountryName] = useState(PASSPORT_COUNTRIES[0].name);
  const [attire, setAttire] = useState(FORMAL_ATTIRE[0].value);
  const [error, setError] = useState<string | null>(null);

  const selectedCountry = useMemo(
    () => PASSPORT_COUNTRIES.find(c => c.name === selectedCountryName)!,
    [selectedCountryName]
  );

  const [backgroundColor, setBackgroundColor] = useState(selectedCountry.allowedBackgrounds[0]);

  const handleCountryChange = (countryName: string) => {
    const newCountry = PASSPORT_COUNTRIES.find(c => c.name === countryName)!;
    setSelectedCountryName(countryName);
    setBackgroundColor(newCountry.allowedBackgrounds[0]);
  };

  const backgroundOptions = useMemo(() => {
    return selectedCountry.allowedBackgrounds.map(color => ({
      label: color.charAt(0).toUpperCase() + color.slice(1),
      value: color,
    }));
  }, [selectedCountry]);

  const handleImageUpload = useCallback(async (base64Image: string, file: File) => {
    setOriginalImage(base64Image);
    setFileName(file.name.replace(/\.[^/.]+$/, "") + "-passport.png");
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze this photo for passport suitability. Return a JSON object with "isValid" (boolean) and "feedback" (string). The photo is valid ONLY IF it meets ALL these criteria:
    1. A single person is in the frame.
    2. The person is facing forward, looking at the camera.
    3. The face is clearly visible and not obscured by hair, hands, or objects.
    4. The face is generally well-lit. It is OKAY to have some soft shadows, but reject the image if the shadows are very dark and obscure key facial features (like an eye or a large part of the cheek). The AI will attempt to correct minor lighting issues.
    If it fails, provide a concise, user-friendly reason in the feedback.`;
    
    const result: ValidationResult = await validateImage(base64Image, validationPrompt);
    
    if (result.isValid) {
      setStage('options');
    } else {
      setError(result.feedback);
      setStage('upload');
      setOriginalImage(null); // Clear the invalid image
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!originalImage) return;

    setStage('processing');
    setError(null);

    const prompt = `You are an expert passport photo generator. Your task is to convert the user's photo into a compliant passport photo for ${selectedCountry.name}. Follow these steps in order, treating them as strict, non-negotiable rules:
1.  **MOST IMPORTANT RULE**: You MUST preserve the person's facial features and identity from the original photo with 100% accuracy. Do not alter their face, hair, or head shape in any way. This is the highest priority.
2.  **Isolate and Prepare Subject**: First, focus only on the person's head and shoulders from the original image. Correct any uneven lighting or soft shadows on their face to create a bright, clear, and professional look suitable for an official document.
3.  **Apply Attire**: ${attire !== 'no change to attire' ? `Change their clothing to ${attire}. Ensure the new clothing looks realistic and natural, fitting their body shape.` : 'Keep their original clothing.'}
4.  **Set Background**: Place the modified person onto a completely plain, uniform, and solid ${backgroundColor} background. There must be no shadows or texture in the background.
5.  **Final Cropping and Framing**: This step is critical. The final image must be a high-resolution portrait cropped to a precise ${selectedCountry.dimensions} aspect ratio (${selectedCountry.aspectRatio.toFixed(4)} width/height). The person's head must be centered horizontally. The head height, from the bottom of the chin to the top of the hair/crown, MUST occupy between ${selectedCountry.headHeightPercentage[0]}% and ${selectedCountry.headHeightPercentage[1]}% of the photo's total height. Frame the image to show the top of the shoulders.`;
    
    try {
      const generated = await generateImage(originalImage, prompt);
      setResultImage(generated);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('options');
    }
  }, [originalImage, selectedCountry, attire, backgroundColor]);

  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    setSelectedCountryName(PASSPORT_COUNTRIES[0].name);
    setAttire(FORMAL_ATTIRE[0].value);
    setBackgroundColor(PASSPORT_COUNTRIES[0].allowedBackgrounds[0]);
  }, []);
  
  const handleDownload = useCallback(() => {
    if (!resultImage) return;
    const mimeType = resultImage.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${resultImage}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage, fileName]);

  const renderContent = () => {
    switch (stage) {
      case 'upload':
        return (
          <>
            <ComplianceChecklist title="Photo Requirements" items={PASSPORT_GUIDELINES} />
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              message="Upload a clear, well-lit photo of yourself"
              error={error}
            />
          </>
        );
      case 'validating':
        return <LoadingSpinner message="Analyzing your photo for compliance..." />;
      case 'options':
        return (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-100">Adjust Your Options</h3>
            <img src={`data:image/jpeg;base64,${originalImage}`} alt="Preview" className="max-h-48 w-auto rounded-lg shadow-lg" />
            <div className="w-full max-w-md space-y-4">
              <OptionSelector label="Country" options={PASSPORT_COUNTRIES} value={selectedCountryName} onChange={handleCountryChange} valueKey="name" labelKey="name"/>
              <div className="text-center p-2 bg-gray-700/50 rounded-md">
                <p className="text-sm text-gray-300">
                  Output Size: <span className="font-semibold text-white">{selectedCountry.dimensions}</span>
                </p>
              </div>
              <OptionSelector label="Background Color" options={backgroundOptions} value={backgroundColor} onChange={setBackgroundColor} />
              <OptionSelector label="Attire" options={FORMAL_ATTIRE} value={attire} onChange={setAttire} />
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <button onClick={handleGenerate} className="mt-4 px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105">
              Generate Passport Photo
            </button>
          </div>
        );
      case 'processing':
        return <LoadingSpinner message="Generating your passport photo..." />;
      case 'result':
        return resultImage ? <ResultDisplay image={resultImage} onDownload={handleDownload} onReset={handleReset} /> : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PassportPhotoConverter;
