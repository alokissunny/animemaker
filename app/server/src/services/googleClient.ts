import { GoogleGenAI } from '@google/genai';
import { config, hasGoogle } from '../config.js';
import { ApiError } from '../apiError.js';

let client: GoogleGenAI | null = null;

export function getGoogleClient(): GoogleGenAI {
  if (!hasGoogle()) {
    throw config.googleUseVertexAI
      ? new ApiError(
          412,
          'missing_vertex_config',
          'GOOGLE_GENAI_USE_VERTEXAI is enabled but GOOGLE_CLOUD_PROJECT is not set. Add it to app/server/.env and restart the server.'
        )
      : new ApiError(
          412,
          'missing_api_key',
          'GOOGLE_API_KEY is not configured on the server. Add it to app/server/.env and restart the server.'
        );
  }
  if (client) return client;

  if (config.googleUseVertexAI) {
    let credentials: object | undefined;
    if (config.googleApplicationCredentialsJson) {
      try {
        credentials = JSON.parse(config.googleApplicationCredentialsJson);
      } catch {
        throw new ApiError(
          500,
          'invalid_google_credentials_json',
          'GOOGLE_APPLICATION_CREDENTIALS_JSON is set but is not valid JSON.'
        );
      }
    }
    client = new GoogleGenAI({
      vertexai: true,
      project: config.googleCloudProject,
      location: config.googleCloudLocation,
      ...(credentials ? { googleAuthOptions: { credentials, projectId: config.googleCloudProject } } : {}),
    });
  } else {
    client = new GoogleGenAI({ apiKey: config.googleApiKey });
  }
  return client;
}
