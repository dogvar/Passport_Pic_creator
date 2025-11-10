import { GoogleGenAI, GenerateContentResponse, Modality, Type, Part } from "@google/genai";
import { ValidationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const imageModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';

/**
 * The core image generation function that takes an array of parts.
 */
const generateImageFromParts = async (parts: Part[]): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: imageModel,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              return part.inlineData.data;
            }
        }
        throw new Error("No image was generated in the response.");
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Failed to generate image. The model may have refused the request due to safety policies. Please try a different photo or prompt.");
    }
};

/**
 * Generates a single image from a base image and a text prompt.
 */
export const generateImage = async (base64Image: string, prompt: string): Promise<string> => {
    const parts: Part[] = [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: prompt },
    ];
    return generateImageFromParts(parts);
};

/**
 * Generates two images in parallel from a base image and a text prompt.
 */
export const generateTwoImages = async (base64Image: string, prompt: string): Promise<string[]> => {
    const parts: Part[] = [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: prompt },
    ];
    const generationPromises = [
        generateImageFromParts(parts),
        generateImageFromParts(parts) // Calling with the same parts is fine; model has inherent variability.
    ];
    try {
        const results = await Promise.all(generationPromises);
        return results;
    } catch (error) {
        console.error("Error generating portrait images with Gemini:", error);
        throw new Error("Failed to generate portrait images. One or more generations may have failed.");
    }
};


/**
 * Generates two images in parallel from multiple image/text parts.
 */
export const generateTwoImagesFromParts = async (parts: Part[]): Promise<string[]> => {
     const generationPromises = [
        generateImageFromParts(parts),
        generateImageFromParts(parts)
    ];
    try {
        const results = await Promise.all(generationPromises);
        return results;
    } catch (error) {
        console.error("Error generating portrait images from parts:", error);
        throw new Error("Failed to generate portrait images. One or more generations may have failed.");
    }
}


/**
 * Validates an image based on a prompt.
 */
export const validateImage = async (base64Image: string, prompt: string): Promise<ValidationResult> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: 'image/jpeg',
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING },
                    },
                    required: ['isValid', 'feedback'],
                }
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (typeof result.isValid === 'boolean' && typeof result.feedback === 'string') {
            return result;
        } else {
            throw new Error("Invalid JSON structure in validation response.");
        }
    } catch (error) {
        console.error("Error validating image with Gemini:", error);
        throw new Error("Failed to validate image. The model returned an unexpected response.");
    }
};