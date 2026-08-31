// app/src/interfaces/clinic.interface.ts
export interface Clinic {
  id: number;
  name: string;
  nit: string;
  address: string;
  phone: string;
  responsibleName: string;
  responsibleEmail: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateClinicParams {
  name: string;
  nit: string;
  address: string;
  phone: string;
  responsibleName: string;
  responsibleEmail: string;
}

export type UpdateClinicParams = Partial<CreateClinicParams>;
