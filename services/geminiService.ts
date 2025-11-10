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
        
        const candidate = response.candidates?.[0];

        // Happy path: image is generated
        for (const part of candidate?.content?.parts || []) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }
        
        // Unhappy path: no image generated. Let's find out why.
        console.error("Gemini did not return an image. Full response:", JSON.stringify(response, null, 2));

        const finishReason = candidate?.finishReason;
        const blockReason = response.promptFeedback?.blockReason;

        if (finishReason === 'SAFETY' || blockReason === 'SAFETY') {
            throw new Error("The request was blocked due to safety policies. Please try a different photo, attire, or prompt.");
        }
        if (finishReason === 'RECITATION') {
            throw new Error("The request was blocked to prevent recitation of copyrighted material. Please adjust your prompt.");
        }
        if (finishReason) {
             throw new Error(`Generation failed with reason: ${finishReason}. Please try again or adjust your settings.`);
        }
        
        throw new Error("The model did not generate an image. This could be due to a refusal to process the request or a transient error.");

    } catch (error) {
        console.error("Error during image generation call:", error);
        // Re-throw the error, which might be a specific one from our checks above, or a network/API error.
        if (error instanceof Error) {
            throw error;
        }
        // Fallback for non-Error objects being thrown
        throw new Error("An unknown error occurred during image generation.");
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
        console.error("Error generating two images with Gemini:", error);
        if (error instanceof Error) {
            throw error; // Propagate the specific error
        }
        throw new Error("Failed to generate images. One of the generations may have failed.");
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
        console.error("Error generating two images from parts:", error);
        if (error instanceof Error) {
            throw error; // Propagate the specific error
        }
        throw new Error("Failed to generate images. One of the generations may have failed.");
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