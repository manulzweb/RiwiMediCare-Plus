import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface WarehouseAttributes {
  id: number;
  name: string;
  code: string;
  location: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type WarehouseCreationAttributes = Optional<WarehouseAttributes, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Warehouse extends Model<WarehouseAttributes, WarehouseCreationAttributes> implements WarehouseAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public location!: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Warehouse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'warehouses',
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeDestroy: async (warehouse: Warehouse) => {
        warehouse.isDeleted = true;
        await warehouse.save();
      },
    },
  },
);

export default Warehouse;
