import { Modality, createUserContent, createPartFromBase64 } from '@google/genai';
import { config } from '../config.js';
import { ApiError } from '../apiError.js';
import { getGoogleClient } from './googleClient.js';

export interface GeneratedImage {
  imageBase64: string;
  mimeType: string;
}

export interface ImageReference {
  imageBase64: string;
  mimeType: string;
}

async function generateOneImage(prompt: string, references: ImageReference[]): Promise<GeneratedImage> {
  const ai = getGoogleClient();
  const parts = [
    ...references.map((ref) => createPartFromBase64(ref.imageBase64, ref.mimeType)),
    prompt,
  ];
  let response;
  try {
    response = await ai.models.generateContent({
      model: config.geminiImageModel,
      contents: [createUserContent(parts)],
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Gemini error';
    throw new ApiError(502, 'gemini_request_failed', `Nano Banana image request failed: ${message}`);
  }
  const imagePart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new ApiError(502, 'gemini_no_image', 'Nano Banana did not return an image for this prompt.');
  }
  return {
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}

export async function generateCharacterImage(prompt: string): Promise<GeneratedImage> {
  return generateOneImage(prompt, []);
}
