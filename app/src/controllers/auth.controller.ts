// app/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import { validateCredentials } from '../utils/auth.utils.js';
import { LoginUserRequestDto } from '../dto/request/login-user.dto.js';
import { RegisterUserRequestDto } from '../dto/request/register-user.dto.js';
import {
  AccountNotActivatedError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '../errors/domain-errors.js';

const success = (res: Response, status: number, message: string, data?: unknown) =>
  res.status(status).json({ success: true, message, data });
const failure = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, message });

function validateRegisterBody(dto: RegisterUserRequestDto): string | null {
  const name = (dto.name ?? dto.firstName) as string | undefined;
  if (!name || !String(name).trim()) return 'Name is required';
  if (dto.role && !['ADMIN', 'REQUEST_MANAGER'].includes(String(dto.role))) {
    return 'Invalid role. Allowed: ADMIN, REQUEST_MANAGER';
  }
  const credErr = validateCredentials(dto.email, dto.password);
  if (credErr) return credErr;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dto.email)) return 'Invalid email format';
  return null;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const dto: RegisterUserRequestDto = req.body ?? {};
  const validationError = validateRegisterBody(dto);
  if (validationError) {
    failure(res, 400, validationError);
    return;
  }
  try {
    const { userId } = await authService.register(dto);
    success(res, 201, 'User registered successfully', { userId });
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      failure(res, 409, 'Unable to register user with the provided email');
      return;
    }
    if (e instanceof Error && /Name|Email|Password|role|status|match/i.test(e.message)) {
      failure(res, 400, e.message);
      return;
    }
    console.error('Registration error:', e);
    failure(res, 500, 'Internal server error');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const dto: LoginUserRequestDto = req.body ?? {};
  const credError = validateCredentials(dto.email, dto.password);
  if (credError) {
    failure(res, 400, credError);
    return;
  }
  try {
    const { userId, accessToken } = await authService.login(dto);
    success(res, 200, 'Authentication successful', { userId, accessToken, tokenType: 'Bearer' });
  } catch (e) {
    if (e instanceof InvalidCredentialsError) {
      failure(res, 401, 'Invalid credentials');
      return;
    }
    if (e instanceof AccountNotActivatedError) {
      failure(res, 403, 'Account is not activated');
      return;
    }
    console.error('Authentication error:', e);
    failure(res, 500, 'Internal server error');
  }
};
