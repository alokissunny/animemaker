export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const missingKeyError = (provider: 'OPENAI_API_KEY' | 'GOOGLE_API_KEY') =>
  new ApiError(
    412,
    'missing_api_key',
    `${provider} is not configured on the server. Add it to app/server/.env and restart the server.`
  );
