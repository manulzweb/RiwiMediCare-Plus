// app/src/docs/swagger.ts

/**
 * Swagger Configuration
 * ---------------------
 * This file configures automatic API documentation
 * using `swagger-jsdoc` and `swagger-ui-express`.
 *
 * - Generates an OpenAPI schema (3.0.0).
 * - Extracts documentation from JSDoc annotations located in `src/routes/*.ts`.
 *
 * Documentation access:
 *  - The generated spec is consumed by `swagger-ui-express`.
 *  - Available at `/api/docs` (see `server.ts`).
 */

import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Configuration options for swagger-jsdoc.
 *
 * `definition`:
 *  - Defines OpenAPI version.
 *  - Contains basic API info (title, version, description).
 *
 * `apis`:
 *  - Indicates the path where files with JSDoc annotations
 *    describing endpoints are located (route files).
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RiwiMediCare Plus',
      version: '1.0.0',
      description:
        'API REST RiwiMediCare Plus — medical supply request management (Clinics, Warehouses, Medicines, Requests). Chain of Responsibility: Auth JWT → RoleGuard → Zod Validation → Controller. Soft delete via Sequelize paranoid + isDeleted.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

/**
 * Dynamically generated Swagger/OpenAPI specification schema.
 * This object is exported and used by `swagger-ui-express`.
 */
export const swaggerSpec = swaggerJSDoc(options);
