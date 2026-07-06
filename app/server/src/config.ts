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

  // Vertex AI mode — lets Gemini/Veo billing draw from a GCP project's Cloud credits
  // instead of the Gemini Developer API's own (separately rate-limited) quota.
  googleUseVertexAI: /^true$/i.test(process.env.GOOGLE_GENAI_USE_VERTEXAI || ''),
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT || '',
  googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  // Optional: paste a service account key's JSON directly (handy on hosts where you
  // can't mount a credentials file). If unset, falls back to standard Application
  // Default Credentials resolution (GOOGLE_APPLICATION_CREDENTIALS file path, gcloud
  // ADC login, or the platform's metadata service).
  googleApplicationCredentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '',
};

export const hasOpenAI = () => Boolean(config.openaiApiKey);
export const hasGoogle = () =>
  config.googleUseVertexAI ? Boolean(config.googleCloudProject) : Boolean(config.googleApiKey);
