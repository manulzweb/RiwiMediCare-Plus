// app/src/schemas/clinic.schema.ts
import { z } from 'zod';

/**
 * Zod schemas for Clinic module — Chain of Responsibility eslabón 3 (400).
 * Validación sintáctica; duplicado NIT (409) queda en Service (regla negocio).
 */

export const createClinicSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  nit: z.string().trim().min(1, 'NIT is required').max(50),
  address: z.string().trim().min(1, 'Address is required').max(255),
  phone: z.string().trim().min(1, 'Phone is required').max(30),
  responsibleName: z.string().trim().min(1, 'Responsible name is required').max(150),
  responsibleEmail: z.string().trim().email('Responsible email must be valid').max(150),
});

export const updateClinicSchema = createClinicSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const clinicIdParamSchema = z.object({
  id: z.coerce.number().int('ID must be an integer').positive('ID must be positive'),
});

export type CreateClinicDto = z.infer<typeof createClinicSchema>;
export type UpdateClinicDto = z.infer<typeof updateClinicSchema>;
export type ClinicIdParam = z.infer<typeof clinicIdParamSchema>;
