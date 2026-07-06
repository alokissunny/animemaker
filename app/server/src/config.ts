import 'dotenv/config';
import path from 'node:path';

export const config = {
  port: Number(process.env.PORT) || 8787,
  dataDir: process.env.DATA_DIR || path.join(process.cwd(), 'data'),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  openaiTextModel: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  veoModel: process.env.VEO_MODEL || 'veo-3.1-generate-preview',
  testLoginEmail: process.env.TEST_LOGIN_EMAIL || 'demo@nova.app',
  testLoginPassword: process.env.TEST_LOGIN_PASSWORD || 'anime123',
};

export const hasOpenAI = () => Boolean(config.openaiApiKey);
export const hasGoogle = () => Boolean(config.googleApiKey);
