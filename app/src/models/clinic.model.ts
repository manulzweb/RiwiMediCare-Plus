import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface ClinicAttributes {
  id: number;
  name: string;
  nit: string;
  address: string;
  phone: string;
  responsibleName: string;
  responsibleEmail: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type ClinicCreationAttributes = Optional<ClinicAttributes, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Clinic extends Model<ClinicAttributes, ClinicCreationAttributes> implements ClinicAttributes {
  public id!: number;
  public name!: string;
  public nit!: string;
  public address!: string;
  public phone!: string;
  public responsibleName!: string;
  public responsibleEmail!: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Clinic.init(
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
    nit: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    responsibleName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    responsibleEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
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
    tableName: 'clinics',
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeDestroy: async (clinic: Clinic) => {
        clinic.isDeleted = true;
        await clinic.save();
      },
    },
  },
);

export default Clinic;
