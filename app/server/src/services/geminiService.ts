import { GoogleGenAI, Modality, createUserContent, createPartFromBase64 } from '@google/genai';
import { config, hasGoogle } from '../config.js';
import { ApiError, missingKeyError } from '../apiError.js';

let client: GoogleGenAI | null = null;
const getClient = () => {
  if (!hasGoogle()) throw missingKeyError('GOOGLE_API_KEY');
  if (!client) client = new GoogleGenAI({ apiKey: config.googleApiKey });
  return client;
};

export interface GeneratedImage {
  imageBase64: string;
  mimeType: string;
}

export interface ImageReference {
  imageBase64: string;
  mimeType: string;
}

export interface SceneCharacterRef extends ImageReference {
  name: string;
  ageGroup: string;
  gender: string;
}

async function generateOneImage(prompt: string, references: ImageReference[]): Promise<GeneratedImage> {
  const ai = getClient();
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

export async function generateSceneImageVariants(
  prompt: string,
  references: ImageReference[],
  variantCount = 2
): Promise<GeneratedImage[]> {
  const attempts = await Promise.allSettled(
    Array.from({ length: variantCount }, () => generateOneImage(prompt, references))
  );
  const variants = attempts
    .filter((r): r is PromiseFulfilledResult<GeneratedImage> => r.status === 'fulfilled')
    .map((r) => r.value);
  if (variants.length === 0) {
    const firstError = attempts.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    const message = firstError?.reason instanceof Error ? firstError.reason.message : 'All image variants failed to generate.';
    throw new ApiError(502, 'gemini_all_variants_failed', message);
  }
  return variants;
}
