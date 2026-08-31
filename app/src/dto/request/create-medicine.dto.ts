export interface CreateMedicineDto {
  name: string;
  code: string;
  description?: string;
  stock: number;
  unitPrice: number;
  warehouseId: number;
}
