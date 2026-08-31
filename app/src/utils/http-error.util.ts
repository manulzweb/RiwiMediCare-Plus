import { Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { DomainError } from '../errors/domain-errors.js';

export const handleHttpError = (res: Response, error: unknown): void => {
  if (error instanceof DomainError) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof UniqueConstraintError) {
    const detail =
      (error.errors[0]?.message as string | undefined) ||
      'Duplicate key value violates unique constraint';
    res.status(409).json({ success: false, message: detail });
    return;
  }

  console.error('[Unhandled Error]', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
