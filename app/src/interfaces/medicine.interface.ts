// app/src/interfaces/medicine.interface.ts
export interface Medicine {
  id: number;
  name: string;
  code: string;
  description?: string;
  stock: number;
  unitPrice: number;
  warehouseId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateMedicineParams {
  name: string;
  code: string;
  description?: string;
  stock: number;
  unitPrice: number;
  warehouseId: number;
}

export type UpdateMedicineParams = Partial<CreateMedicineParams>;
