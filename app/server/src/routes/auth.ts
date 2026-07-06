import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { config } from '../config.js';

export const authRouter = Router();

interface LoginBody {
  email: string;
  password: string;
}

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as LoginBody;
    const ok =
      typeof email === 'string' &&
      typeof password === 'string' &&
      email.trim().toLowerCase() === config.testLoginEmail.toLowerCase() &&
      password === config.testLoginPassword;

    if (!ok) {
      res.status(401).json({ error: 'Incorrect email or password.', code: 'invalid_credentials' });
      return;
    }
    res.json({ ok: true });
  })
);
