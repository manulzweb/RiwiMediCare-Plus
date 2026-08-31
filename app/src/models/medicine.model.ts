import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface MedicineAttributes {
  id: number;
  warehouseId: number;
  name: string;
  code: string;
  description?: string;
  stock: number;
  unitPrice: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type MedicineCreationAttributes = Optional<
  MedicineAttributes,
  'id' | 'description' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Medicine
  extends Model<MedicineAttributes, MedicineCreationAttributes>
  implements MedicineAttributes
{
  declare id: number;
  declare warehouseId: number;
  declare name: string;
  declare code: string;
  declare description?: string;
  declare stock: number;
  declare unitPrice: number;
  declare isDeleted: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

Medicine.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'warehouse_id',
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'medicines',
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeDestroy: async (medicine: Medicine) => {
        medicine.isDeleted = true;
        await medicine.save();
      },
    },
  },
);

export default Medicine;
