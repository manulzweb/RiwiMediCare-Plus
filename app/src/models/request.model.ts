import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { RequestStatus } from '../constants/request-status.enum.js';

export interface SupplyRequestAttributes {
  id: number;
  clinicId: number;
  warehouseId: number;
  medicineId: number;
  createdById: number;
  quantity: number;
  status: RequestStatus;
  notes?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type SupplyRequestCreationAttributes = Optional<
  SupplyRequestAttributes,
  'id' | 'status' | 'notes' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class SupplyRequest extends Model<SupplyRequestAttributes, SupplyRequestCreationAttributes> implements SupplyRequestAttributes {
  public id!: number;
  public clinicId!: number;
  public warehouseId!: number;
  public medicineId!: number;
  public createdById!: number;
  public quantity!: number;
  public status!: RequestStatus;
  public notes?: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

SupplyRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clinics',
        key: 'id',
      },
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    medicineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'id',
      },
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      allowNull: false,
      defaultValue: RequestStatus.PENDING,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'supply_requests',
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeDestroy: async (request: SupplyRequest) => {
        request.isDeleted = true;
        await request.save();
      },
    },
  },
);

export default SupplyRequest;
export { SupplyRequest as Request };
