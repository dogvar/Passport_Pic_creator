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
    4. The lighting on the face is relatively even, without harsh shadows.
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

    const prompt = `Critically generate a compliant passport photo for ${selectedCountry.name} based on the user's photo, following these rules strictly:
1.  **Cropping and Aspect Ratio**: Crop the image to a precise aspect ratio of ${selectedCountry.aspectRatio.toFixed(4)} (width/height). The final image must be high resolution and sharp.
2.  **Head Position**: The person's head, measured from the bottom of the chin to the top of the crown, MUST occupy between ${selectedCountry.headHeightPercentage[0]}% and ${selectedCountry.headHeightPercentage[1]}% of the image's total height. The head must be centered horizontally.
3.  **Background**: Completely replace the original background with a solid, uniform, and plain ${backgroundColor} color. There must be no shadows or patterns in the background.
4.  **Attire**: ${attire !== 'no change to attire' ? `If the user is not wearing formal attire, realistically change their clothing to: ${attire}.` : 'The user\'s attire should remain unchanged.'}
5.  **Quality Checks**: The person must be facing forward with a neutral expression. Ensure the final image is clear, well-lit, and has no shadows on the face or background.`;
    
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
