import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ValidationResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getMimeType = (base64Data: string): string => {
    // This is a simplified check. A robust solution would inspect magic numbers.
    // For this app, we can assume JPEG/PNG from the uploader.
    // Let's default to PNG if we can't tell.
    const signatures: {[key: string]: string} = {
      '/9j/': 'image/jpeg',
      'iVBORw0KGgo': 'image/png',
      'R0lGODlh': 'image/gif',
      'UklGR': 'image/webp'
    };

    for (const sig in signatures) {
        if (base64Data.startsWith(sig)) {
            return signatures[sig];
        }
    }
    return 'image/png';
};

export const validateImage = async (base64Image: string, validationPrompt: string): Promise<ValidationResult> => {
  try {
    const mimeType = getMimeType(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: validationPrompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: 'Whether the image is valid.' },
            feedback: { type: Type.STRING, description: 'Feedback for the user if the image is not valid.' },
          },
          required: ["isValid", "feedback"],
        },
      },
    });

    const jsonString = response.text.trim();
    const result: ValidationResult = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error validating image with Gemini API:", error);
    // Fallback in case of API error, assume not valid to prevent bad generation
    return {
      isValid: false,
      feedback: "Could not analyze the image. Please try again with a different photo."
    };
  }
};


export const generateImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const mimeType = getMimeType(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    throw new Error("Failed to generate the image. Please try again.");
  }
};
