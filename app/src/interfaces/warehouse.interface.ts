// app/src/interfaces/warehouse.interface.ts
export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateWarehouseParams {
  name: string;
  code: string;
  location: string;
}

export type UpdateWarehouseParams = Partial<CreateWarehouseParams>;
