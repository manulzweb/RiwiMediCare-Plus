// app/src/models/index.ts
import sequelize from '../config/database.js';
import User from './user.model.js';
import Clinic from './clinic.model.js';
import Warehouse from './warehouse.model.js';
import Medicine from './medicine.model.js';
import Request from './request.model.js';

// Clinic - Request
Clinic.hasMany(Request, { foreignKey: 'clinic_id', as: 'requests' });
Request.belongsTo(Clinic, { foreignKey: 'clinic_id', as: 'clinic' });

// Warehouse - Medicine (inventory per warehouse)
Warehouse.hasMany(Medicine, { foreignKey: 'warehouse_id', as: 'medicines' });
Medicine.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

// Warehouse - Request
Warehouse.hasMany(Request, { foreignKey: 'warehouse_id', as: 'warehouseRequests' });
Request.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

// Medicine - Request
Medicine.hasMany(Request, { foreignKey: 'medicine_id', as: 'requests' });
Request.belongsTo(Medicine, { foreignKey: 'medicine_id', as: 'medicine' });

// User - Request (requester)
User.hasMany(Request, { foreignKey: 'requested_by', as: 'supplyRequests' });
Request.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });

export { sequelize, User, Clinic, Warehouse, Medicine, Request };
