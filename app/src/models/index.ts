// app/src/models/index.ts
import sequelize from '../config/database.js';
import User from './user.model.js';
import Clinic from './clinic.model.js';
import Warehouse from './warehouse.model.js';
import Medicine from './medicine.model.js';
import Request from './request.model.js';

// Clinic - Request
Clinic.hasMany(Request, { foreignKey: 'clinicId', as: 'requests' });
Request.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// Warehouse - Medicine (inventory per warehouse)
Warehouse.hasMany(Medicine, { foreignKey: 'warehouseId', as: 'medicines' });
Medicine.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

// Warehouse - Request
Warehouse.hasMany(Request, { foreignKey: 'warehouseId', as: 'warehouseRequests' });
Request.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

// Medicine - Request
Medicine.hasMany(Request, { foreignKey: 'medicineId', as: 'requests' });
Request.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });

// User - Request (requester)
User.hasMany(Request, { foreignKey: 'createdById', as: 'supplyRequests' });
Request.belongsTo(User, { foreignKey: 'createdById', as: 'requester' });

export { sequelize, User, Clinic, Warehouse, Medicine, Request };
