import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const convertDataUrlToGeminiPart = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1];
  const base64Data = parts[1];

  if (!mimeType || !base64Data) {
    throw new Error("Invalid data URL");
  }

  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const generateProductPlacementImage = async (
  characterImage: ImageFile,
  productImage: ImageFile
): Promise<string | null> => {
  try {
    const characterPart = convertDataUrlToGeminiPart(characterImage.base64Url);
    const productPart = convertDataUrlToGeminiPart(productImage.base64Url);

    const textPart = {
      text: `Analyze the first image (the character) and the second image (the product). Generate a new image where the character is naturally using or interacting with the product. The final output image MUST maintain the exact same aspect ratio and dimensions as the first (character) image. The art style should also match the character image.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [characterPart, productPart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
    
    // Check if the model responded with text explaining why it couldn't generate an image
    const textResponse = response.text?.trim();
    if(textResponse) {
        throw new Error(`Model response: ${textResponse}`);
    }

    return null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};
