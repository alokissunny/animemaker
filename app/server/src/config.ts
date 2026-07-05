import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 8787,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  openaiTextModel: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  veoModel: process.env.VEO_MODEL || 'veo-3.0-generate-001',
};

export const hasOpenAI = () => Boolean(config.openaiApiKey);
export const hasGoogle = () => Boolean(config.googleApiKey);
