// app/src/config/database.ts

/**
 * Sequelize configuration for PostgreSQL
 * ---------------------------------------
 * This module initializes and exports a Sequelize instance
 * configured with environment variables defined in `.env` or `docker-compose`.
 *
 * Main usage:
 *  - Establish connection to PostgreSQL database.
 *  - Be imported by models and utilities that need to interact with Sequelize.
 *
 * Environment variables:
 *  - POSTGRES_DB: Database name.
 *  - POSTGRES_USER: Database user.
 *  - POSTGRES_PASSWORD: Database user password.
 *  - POSTGRES_HOST: Database host (default `db` for docker-compose).
 *  - POSTGRES_PORT: Connection port (default `5432`).
 */

import { Sequelize } from 'sequelize';
import { envConfig } from './env.js';

/**
 * Sequelize instance configured for PostgreSQL.
 * Connects using credentials and parameters defined in environment variables.
 */
const sequelize = new Sequelize(envConfig.DB.NAME, envConfig.DB.USER, envConfig.DB.PASSWORD, {
  host: envConfig.DB.HOST || 'db',
  port: Number.parseInt(envConfig.DB.PORT.toString() || '5432', 10),
  dialect: 'postgres',
  logging: envConfig.NODE_ENV === 'development' ? false : false,
  pool: {
    min: 0,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    // Global configuration for RiwiMediCare Plus
    timestamps: true, // createdAt, updatedAt -> DB: created_at, updated_at
    underscored: true, // snake_case in DB, camelCase in JSON
    paranoid: true, // Soft Delete -> deleted_at, no physical deletion
  },
  dialectOptions:
    envConfig.NODE_ENV === 'production'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

export default sequelize;
