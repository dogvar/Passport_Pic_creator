import React, { useState, useCallback } from 'react';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultDisplay from '../../components/ResultDisplay';
import { generateTwoImages, generateTwoImagesFromParts, validateImage } from '../../services/geminiService';
import { ValidationResult } from '../../types';
import WardrobeSelector from '../../components/WardrobeSelector';
// Fix: Imported the missing ComplianceChecklist component.
import ComplianceChecklist from '../../components/ComplianceChecklist';
import { Part } from '@google/genai';

type Stage = 'upload' | 'validating' | 'processing' | 'result';

const PORTRAIT_GUIDELINES = [
    "Use a clear, well-lit photo of a person.",
    "The person can be full-body or waist-up.",
    "Avoid blurry photos or photos where the face is obscured.",
    "The AI will preserve the person's face while changing clothing and background."
];

const PortraitGenerator: React.FC = () => {
  const [stage, setStage] = useState<Stage>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [fileName, setFileName] = useState('portrait.png');
  
  const [category, setCategory] = useState('Man');
  const [upperAttire, setUpperAttire] = useState('No Change');
  const [lowerAttire, setLowerAttire] = useState('No Change');
  const [customAttireImage, setCustomAttireImage] = useState<string | null>(null);

  const [background, setBackground] = useState('a blurred, modern office setting');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (base64Image: string) => {
    if (!base64Image) return;

    setStage('processing');
    setError(null);

    let attirePrompt = '';
    if (customAttireImage) {
        attirePrompt = 'Change the person\'s attire to match the style, color, and type of clothing shown in the provided attire image. Adapt it realistically to the person\'s body.'
    } else {
        const upperChanged = upperAttire && upperAttire !== 'No Change' && upperAttire !== 'Keep the original upper body clothing.';
        const lowerChanged = lowerAttire && lowerAttire !== 'No Change' && lowerAttire !== 'Keep the original lower body clothing.';

        if (upperChanged && lowerChanged) {
            attirePrompt = `Change the person's upper body clothing to ${upperAttire}, and their lower body clothing to ${lowerAttire}.`;
        } else if (upperChanged) {
            attirePrompt = `Change the person's upper body clothing to ${upperAttire}. Keep the lower body clothing as it is.`;
        } else if (lowerChanged) {
            attirePrompt = `Change the person's lower body clothing to ${lowerAttire}. Keep the upper body clothing as it is.`;
        } else {
            attirePrompt = 'Do not change the clothing.';
        }
    }

    const finalPrompt = `
**PRIMARY DIRECTIVE: DO NOT CHANGE THE FACE. The generated image must look like the same person.**

**Task**: Transform the user's photo into a high-quality, professional, and photorealistic full-body or waist-up portrait.

Follow these rules:
1.  **Identity Lock**: Preserve the person's exact facial features, hair, head shape, and skin tone from the original photo. This is the top priority.
2.  **Attire**: ${attirePrompt} The new clothing must look realistic and fit the person's body naturally.
3.  **Background**: Place the person in the following background: **${background}**. The background should be photorealistic and well-composed.
4.  **Pose & Composition**: The final pose should be natural and confident. The composition should be a professional portrait. The image aspect ratio should be 4:5 (portrait orientation).
5.  **Quality**: Produce a high-resolution, photorealistic, and aesthetically pleasing image with flattering lighting.
`;

    try {
      let generated: string[] = [];
      if (customAttireImage) {
          const parts: Part[] = [
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
              { text: finalPrompt },
              { inlineData: { data: customAttireImage, mimeType: 'image/jpeg' } },
          ];
          generated = await generateTwoImagesFromParts(parts);
      } else {
          generated = await generateTwoImages(base64Image, finalPrompt);
      }
      setResultImages(generated);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('upload');
      setOriginalImage(null);
    }
  }, [upperAttire, lowerAttire, background, customAttireImage]);

  const handleImageUpload = useCallback(async (base64Image: string, file: File) => {
    setOriginalImage(base64Image);
    const safeFileName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(`${safeFileName}-portrait.png`);
    setStage('validating');
    setError(null);

    const validationPrompt = `Analyze this photo. Is it a clear photo of a person's face, suitable for use as a base for a creative portrait? The photo is valid if a person's face is reasonably clear and visible. It is invalid if it's not a photo of a person or the face is completely obscured or blurry. Return a JSON object with "isValid" (boolean) and "feedback" (string). Provide a simple reason if invalid.`;

    try {
      const result: ValidationResult = await validateImage(base64Image, validationPrompt);
      if (result.isValid) {
        handleGenerate(base64Image);
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
  }, [handleGenerate]);

  const handleReset = useCallback(() => {
    setStage('upload');
    setOriginalImage(null);
    setResultImages([]);
    setError(null);
    setCategory('Man');
    setUpperAttire('No Change');
    setLowerAttire('No Change');
    setCustomAttireImage(null);
    setBackground('a blurred, modern office setting');
  }, []);

  const handleDownload = useCallback((selectedImage: string) => {
    if (!selectedImage) return;
    const mimeType = 'image/png';
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
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <WardrobeSelector 
              category={category}
              onCategoryChange={setCategory}
              upperAttire={upperAttire}
              onUpperAttireChange={setUpperAttire}
              lowerAttire={lowerAttire}
              onLowerAttireChange={setLowerAttire}
              onCustomAttireUpload={setCustomAttireImage}
            />
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-300 mb-1">Background Description</label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Describe the background (e.g., 'on a beach at sunset', 'in a futuristic city')..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 transition"
                rows={2}
              />
            </div>
            <ComplianceChecklist title="Photo Guidelines" items={PORTRAIT_GUIDELINES} />
            <ImageUploader
              onImageUpload={handleImageUpload}
              message="Upload a photo to create a portrait"
              error={error}
            />
          </div>
        );
      case 'validating':
        return <LoadingSpinner message="Checking your photo..." />;
      case 'processing':
        return <LoadingSpinner message={`Creating your professional portrait...`} />;
      case 'result':
        return resultImages.length > 0 ? (
          <ResultDisplay images={resultImages} onDownload={handleDownload} onReset={handleReset} fileName={fileName} />
        ) : null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default PortraitGenerator;