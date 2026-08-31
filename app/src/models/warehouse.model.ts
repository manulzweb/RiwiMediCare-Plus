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

export type WarehouseCreationAttributes = Optional<
  WarehouseAttributes,
  'id' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Warehouse
  extends Model<WarehouseAttributes, WarehouseCreationAttributes>
  implements WarehouseAttributes
{
  declare id: number;
  declare name: string;
  declare code: string;
  declare location: string;
  declare isDeleted: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
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
