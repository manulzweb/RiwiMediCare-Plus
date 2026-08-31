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
      description: [
        'API para gestión de solicitudes de insumos médicos.',
        '',
        '**Arquitectura — Chain of Responsibility**',
        '- Auth JWT → 401',
        '- RoleGuard → 403',
        '- Validate (Zod) → 400',
        '- Service → 409 / 404',
        '- Controller → 200 / 201',
        '',
        'Soft delete con Sequelize `paranoid: true` + `isDeleted`.',
        '',
        '**Guía rápida — Clinics**',
        '1. `POST /api/v1/auth/register` con `ADMIN`',
        '2. `POST /api/v1/auth/login` → copia `accessToken`',
        '3. **Authorize** → pega `Bearer <token>`',
        '4. `POST /api/v1/clinics` (ejemplo NIT `900123456-10` libre)',
        '5. `GET /api/v1/clinics` y `PUT /api/v1/clinics/{id}` (ejemplo NIT `900123456-11`)',
      ].join('\n'),
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev (docker-compose)' }],
    tags: [
      { name: 'Auth', description: 'Registro sin JWT, login retorna JWT' },
      {
        name: 'Clinics',
        description: 'CRUD clínicas — NIT único (409) vía `checkDuplicateNitMiddleware`',
      },
      { name: 'Warehouses', description: 'Almacenes' },
      { name: 'Medicines', description: 'Medicamentos por almacén' },
      {
        name: 'Requests',
        description: 'Solicitudes — quantity>0 (400), inventario (409), status enum (400)',
      },
    ],
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
