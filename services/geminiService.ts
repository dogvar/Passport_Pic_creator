
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { ValidationResult } from "../types";

// FIX: Correctly instantiate GoogleGenAI with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const imageModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';

/**
 * Generates an image based on a prompt and an input image.
 * @param base64Image The base64 encoded input image.
 * @param prompt The text prompt for image generation.
 * @returns A promise that resolves to the base64 encoded generated image.
 */
export const generateImage = async (base64Image: string, prompt: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: imageModel,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: 'image/jpeg', // Assuming JPEG, could be dynamic
                        },
                    },
                    { text: prompt },
                ],
            },
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
 * Generates two images for portrait mode.
 * @param base64Image The base64 encoded input image.
 * @param prompt The text prompt for image generation.
 * @returns A promise that resolves to an array of two base64 encoded generated images.
 */
export const generateTwoImages = async (base64Image: string, prompt: string): Promise<string[]> => {
    const generationPromises = [
        generateImage(base64Image, prompt),
        generateImage(base64Image, prompt)
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
 * Validates an image based on a prompt.
 * @param base64Image The base64 encoded input image.
 * @param prompt The validation prompt.
 * @returns A promise that resolves to a ValidationResult object.
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
