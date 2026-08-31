// app/src/middleware/validate.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export type ValidationSource = 'body' | 'params' | 'query';

/**
 * Chain of Responsibility — Eslabón 3: Validación.
 * Valida `req[source]` con Zod y corta con 400 o pasa con `next()` y dato sanitizado.
 * Ubicación: `src/middleware` (pipeline HTTP), no `utils` (tiene efecto `res`).
 */
export const validate =
  (schema: ZodSchema, source: ValidationSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    // Sanitize: replace with coerced/trimmed data (ej. id string -> number)
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };

export default validate;
