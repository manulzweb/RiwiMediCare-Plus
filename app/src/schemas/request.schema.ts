// app/src/schemas/request.schema.ts
import { z } from 'zod';
import { RequestStatus } from '../constants/request-status.enum.js';

/**
 * Zod schemas for Request module — Chain eslabón 3 (400).
 * Reglas sintácticas; reglas de negocio con DB (existencia 404, inventario 409) quedan en Service
 */

export const createRequestSchema = z.object({
  clinicId: z.coerce.number().int('clinicId must be integer').positive('clinicId must be positive'),
  warehouseId: z.coerce
    .number()
    .int('warehouseId must be integer')
    .positive('warehouseId must be positive'),
  medicineId: z.coerce
    .number()
    .int('medicineId must be integer')
    .positive('medicineId must be positive'),
  quantity: z.coerce
    .number()
    .int('quantity must be integer')
    .min(1, 'Quantity must be greater than 0'),
  notes: z.string().trim().max(500).optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .pipe(
      z.enum(RequestStatus, {
        message: `Invalid status. Allowed: ${Object.values(RequestStatus).join(', ')}`,
      }),
    ),
});

export type CreateRequestDto = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusDto = z.infer<typeof updateRequestStatusSchema>;
