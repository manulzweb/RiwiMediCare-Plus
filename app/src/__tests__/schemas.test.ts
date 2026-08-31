import { createClinicSchema, clinicIdParamSchema } from '../schemas/clinic.schema.js';
import { createRequestSchema, updateRequestStatusSchema } from '../schemas/request.schema.js';
import { RequestStatus } from '../constants/request-status.enum.js';

describe('Schemas', () => {
  it('clinic schema valida datos correctos', () => {
    const result = createClinicSchema.safeParse({
      name: 'Clínica Central',
      nit: '900123456-10',
      address: 'Calle 10',
      phone: '300',
      responsibleName: 'Ana',
      responsibleEmail: 'ana@clinic.com',
    });
    expect(result.success).toBe(true);
  });

  it('clinic schema falla sin nit', () => {
    const result = createClinicSchema.safeParse({ name: 'C' } as never);
    expect(result.success).toBe(false);
  });

  it('clinicIdParamSchema coerce string a number', () => {
    const result = clinicIdParamSchema.safeParse({ id: '1' });
    expect(result.success).toBe(true);
  });

  it('createRequestSchema valida quantity >0', () => {
    const result = createRequestSchema.safeParse({
      clinicId: 1,
      warehouseId: 1,
      medicineId: 1,
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it('updateRequestStatusSchema valida enum', () => {
    expect(updateRequestStatusSchema.safeParse({ status: RequestStatus.APPROVED }).success).toBe(true);
    expect(updateRequestStatusSchema.safeParse({ status: 'INVALID' } as never).success).toBe(false);
  });
});
