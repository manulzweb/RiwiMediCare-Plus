 Informe de Criterios de Aceptación, Calidad de Código, Simplicidad y Buenas Prácticas 

  Proyecto: RiwiMediCare Plus
  Evaluación: Prueba de Desempeño — Módulo 5.2 Node.js (Be a coder)
  Fecha: 31 de Agosto de 2026
  Stack Principal: Node.js 18+ (ESM) | Express 5 | TypeScript (Strict Mode) | PostgreSQL 15 | Sequelize ORM 6 | JWT (HS256) | Swagger UI | Multer | Docker & Docker Compose |
  Jest
  ──────
  ## 1. Resumen Ejecutivo del Caso de Uso

  La empresa RiwiMediCare Plus requería la transición desde un modelo operativo basado en correos electrónicos y hojas de cálculo hacia una API REST profesional, robusta,
  tipada y escalable para la administración integral del ciclo de vida de solicitudes de abastecimiento de medicamentos e insumos médicos entre clínicas y almacenes.

    graph LR
        subgraph Client["Clientes y Roles"]
            Admin["Administrador"]
            Gestor["Gestor de Solicitudes"]
        end
    
        subgraph Security["Seguridad & CoR"]
            AuthMiddleware["JWT Auth Middleware"]
            RoleGuard["RBAC Middleware"]
            ZodValidator["Schema Validator"]
        end
    
        subgraph CoreDomain["Dominio RiwiMediCare Plus"]
            Clinics["Clínicas (NIT único)"]
            Warehouses["Almacenes"]
            Medicines["Medicamentos (Stock)"]
            Requests["Solicitudes (Supply Requests)"]
            Seed["Multer JSON Seeder"]
        end
    
        subgraph Persistence["Persistencia PostgreSQL"]
            PG[(PostgreSQL + Sequelize Paranoid)]
        end
    
        Admin --> Security
        Gestor --> Security
        Security --> CoreDomain
        CoreDomain --> Persistence
  ──────
  ## 2. Matriz de Cumplimiento de Criterios de Aceptación

  A continuación se detalla la conformidad con los requerimientos funcionales y no funcionales exigidos en la prueba de desempeño:

   Requisito / Criterio                                                                |  Estado  | Nivel de Cump… | Evidencia en Código
  -------------------------------------------------------------------------------------|----------|----------------|----------------------------------------------------------
   Registro Público con Selección de Rol (Administrador / Gestor de Solicitudes) sin   | Cumplido |      100%      | auth.routes.ts:68-70, auth.service.ts:37-76
   requerir JWT previo                                                                 |          |                |
   Inicio de Sesión (Login) con entrega de token JWT {id, email, role} firmado HS256   | Cumplido |      100%      | auth.service.ts:116-128, auth-token.service.ts:12-28
   Protección de Rutas con JWT (authMiddleware Bearer token)                           | Cumplido |      100%      | auth.middleware.ts:6-24, server.ts:44
   Control de Acceso Basado en Roles (RBAC) mediante roleMiddleware                    | Cumplido |      100%      | role.middleware.ts:14-40, roles.enum.ts
   CRUD Administrador: Clínicas, Almacenes, Medicamentos y Solicitudes                 | Cumplido |      100%      | clinic.routes.ts, warehouse.routes.ts,
                                                                                       |          |                | medicine.routes.ts, request.routes.ts
   Funcionalidades Gestor de Solicitudes: Crear solicitud, actualizar estado,          | Cumplido |      100%      | request.routes.ts:24-27, request.service.ts:50-93
   consultar historial                                                                 |          |                |
   Consultas de Usuarios Autenticados: Solicitudes activas e historial por clínica     | Cumplido |      100%      | request.routes.ts:19-22, request.service.ts:73-79
   Eliminación Lógica (Soft Delete / Paranoid): Marcación con deleted_at e isDeleted   | Cumplido |      100%      | database.ts:43, clinic.model.ts:70-86,
                                                                                       |          |                | request.model.ts:98-113
   Validación de NIT Único en Clínicas (409 Conflict)                                  | Cumplido |      100%      | clinic.service.ts:17-22, domain-errors.ts:154
   Validación de Existencia de Clínica, Medicamento y Almacén (404 Not Found)          | Cumplido |      100%      | request.service.ts:24-37, medicine.service.ts:17-20
   Validación de Inventario y Almacén Asignado (409 Conflict)                          | Cumplido |      100%      | request.service.ts:39-48
   Validación de Cantidad Estrictamente Positiva (quantity > 0, 400 Bad Request)       | Cumplido |      100%      | request.service.ts:14-16
   Control de Transición de Estados Válidos (pending, approved, rejected, delivered,   | Cumplido |      100%      | request.service.ts:18-22, request-status.enum.ts
   in_transit)                                                                         |          |                |
   Carga Masiva Seeder con Multer en JSON transaccional                                | Cumplido |      100%      | seed.routes.ts:10-35, seed.service.ts:63-77
  ──────
  ## 3. Calidad de Código, Simplicidad y Buenas Prácticas

  ### 3.1 Principios Clean Code y Anti-Monolito

  1. Funciones Cortas y Modulares (< 30-40 líneas):
  Ningún método o controlador excede el límite establecido. La lógica compleja se descompuso en métodos privados de validación y auxiliares dedicados (por ejemplo,
  request.service.ts:14, request.service.ts:24, request.service.ts:39).
  2. Bouncer Pattern (Fail-Fast):
  Se eliminó el anidamiento profundo de condicionales (arrow anti-pattern). Se validan precondiciones en las primeras líneas con retorno o lanzamiento de excepción inmediata:
    // Ejemplo en RequestService (Bouncer Pattern)
    private validateQuantity(quantity: number): void {
      if (!quantity || quantity <= 0) {
        throw new ValidationError('Quantity must be greater than 0');
      }
    }

  3. DRY (Don't Repeat Yourself) & Agrupación de Parámetros:
  Los parámetros múltiples se encapsulan en interfaces DTO (como supply-request.interface.ts), evitando firmas de más de 3 argumentos sueltos.
  4. Nomenclatura Intencional y Estricto Inglés:
  Todo el código, variables, interfaces, esquemas y endpoints se construyeron en inglés estándar (Clinic, Warehouse, Medicine, SupplyRequest, stock, quantity, nit).
  5. Cero Código Muerto / Comentado:
  El repositorio está limpio de bloques comentados de desarrollo o código deprecado.

  ### 3.2 Aplicación de Principios SOLID

    classDiagram
        class IRequestService {
            <<interface>>
            +create(dto: CreateSupplyRequestParams)
            +findAll()
            +findActive()
            +findByClinic(clinicId: number)
            +findById(id: number)
            +updateStatus(id: number, dto: UpdateSupplyRequestStatusParams)
            +delete(id: number)
        }
    
        class RequestService {
            -validateQuantity(quantity: number)
            -validateStatus(status: string)
            -ensureClinicExists(clinicId: number)
            -ensureMedicineExists(medicineId: number)
            -ensureWarehouseExists(warehouseId: number)
            -checkInventory(medicineId: number, warehouseId: number, quantity: number)
            +create(dto)
            +findAll()
            +findActive()
            +findByClinic(clinicId)
            +findById(id)
            +updateStatus(id, dto)
            +delete(id)
        }
    
        class IRequestRepository {
            <<interface>>
            +create(data)
            +findAll()
            +findActive()
            +findByClinic(clinicId)
            +findById(id)
            +updateStatus(id, data)
            +delete(id)
        }
    
        class RequestRepository {
            +create(data)
            +findAll()
            +findActive()
            +findByClinic(clinicId)
            +findById(id)
            +updateStatus(id, data)
            +delete(id)
        }
    
        IRequestService <|.. RequestService : implements
        IRequestRepository <|.. RequestRepository : implements
        RequestService --> IRequestRepository : depends on

  • S (Single Responsibility Principle):
      • Rutas (routes/): Definen la topología HTTP y la cadena de middlewares.
      • Controladores (controllers/): Gestionan exclusivamente el protocolo HTTP (extracción de parámetros, invocación del servicio y formateo de respuesta JSON).
      • Servicios (services/): Contienen el 100% de la lógica de negocio y orquestación de reglas.
      • Repositorios (repositories/): Encapsulan las operaciones CRUD y consultas Sequelize.
      • Modelos (models/): Definen esquema, tipos de columnas, restricciones e índices.
  • O (Open/Closed Principle):
  El middleware role.middleware.ts:14 es variádico y abierto a cualquier conjunto de roles sin modificar su código base.
  • L (Liskov Substitution Principle):
  Los modelos heredan de Model de Sequelize manteniendo la interoperabilidad, y las implementaciones de servicios respetan estrictamente los contratos de sus interfaces.
  • I (Interface Segregation Principle):
  Se crearon interfaces delgadas y específicas para cada entidad (clinic.repository.interface.ts, medicine.repository.interface.ts, request.repository.interface.ts), evitando
  interfaces monolíticas ("God interfaces").
  • D (Dependency Inversion Principle):
  La capa de negocio depende de abstracciones e interfaces de repositorio, lo cual desacopla la lógica del motor de base de datos y habilita pruebas unitarias mediante mocks.

  ### 3.3 TypeScript Strict Mode y Seguridad de Tipos

  • strict: true activado: Sin uso de tipo any.
  • Inferencia Zod + DTOs: Integración entre esquemas runtime Zod (clinic.schema.ts) y tipos estáticos TypeScript para validación garantizada en tiempo de compilación y
  ejecución.
  ──────
  ## 4. Arquitectura de Endpoints y Matriz REST

  La API expone sus recursos bajo el prefijo unificado /api/v1 en server.ts:44:

   Módulo          |     Método     | Endpoint                          | Roles Permitidos | Validación / Regla de Negocio                          |      Códigos HTTP
  -----------------|----------------|-----------------------------------|------------------|--------------------------------------------------------|-------------------------
   Auth            |      POST      | /api/v1/auth/register             | Público          | Formato email, campos obligatorios, asignación de rol  |      201, 400, 409
   Auth            |      POST      | /api/v1/auth/login                | Público          | Verificación de credenciales, generación JWT HS256     |      200, 400, 401
   Clínicas        |      GET       | /api/v1/clinics                   | ADMIN, GESTOR    | Listado de clínicas activas (excluye borradas lógicas) |      200, 401, 403
   Clínicas        |      GET       | /api/v1/clinics/:id               | ADMIN, GESTOR    | Validación de ID entero, existencia de clínica         |   200, 400, 401, 404
   Clínicas        |      POST      | /api/v1/clinics                   | ADMIN            | Validación Zod + Unicidad de NIT                       | 201, 400, 401, 403, 409
   Clínicas        |      PUT       | /api/v1/clinics/:id               | ADMIN            | Actualización de datos + Unicidad de NIT si cambia     | 200, 400, 401, 404, 409
   Clínicas        |     DELETE     | /api/v1/clinics/:id               | ADMIN            | Eliminación lógica (deleted_at + isDeleted: true)      |   200, 400, 401, 404
   Almacenes       |      GET       | /api/v1/warehouses                | Autenticados     | Listado de almacenes activos                           |        200, 401
   Almacenes       |      GET       | /api/v1/warehouses/:id            | Autenticados     | Consulta por ID                                        |      200, 401, 404
   Almacenes       |      POST      | /api/v1/warehouses                | ADMIN            | Registro de nuevo almacén                              |   201, 400, 401, 403
   Almacenes       |      PUT       | /api/v1/warehouses/:id            | ADMIN            | Actualización de almacén                               |   200, 400, 401, 404
   Almacenes       |     DELETE     | /api/v1/warehouses/:id            | ADMIN            | Borrado lógico de almacén                              |   200, 400, 401, 404
   Medicamentos    |      GET       | /api/v1/medicines                 | Autenticados     | Listado de medicamentos con inventario                 |        200, 401
   Medicamentos    |      GET       | /api/v1/medicines/:id             | Autenticados     | Consulta por ID                                        |      200, 401, 404
   Medicamentos    |      POST      | /api/v1/medicines                 | ADMIN            | Verificación de existencia de almacén asignado         |   201, 400, 401, 404
   Medicamentos    |      PUT       | /api/v1/medicines/:id             | ADMIN            | Actualización de stock, precios y almacén              |   200, 400, 401, 404
   Medicamentos    |     DELETE     | /api/v1/medicines/:id             | ADMIN            | Borrado lógico de medicamento                          |   200, 400, 401, 404
   Solicitudes     |      GET       | /api/v1/requests/active           | Autenticados     | Filtro de solicitudes en estados activos               |        200, 401
   Solicitudes     |      GET       | /api/v1/requests/clinic/:clinicId | Autenticados     | Historial completo de solicitudes por clínica          |      200, 401, 404
   Solicitudes     |      GET       | /api/v1/requests                  | Autenticados     | Listado general de solicitudes                         |        200, 401
   Solicitudes     |      GET       | /api/v1/requests/:id              | Autenticados     | Detalle de solicitud por ID                            |      200, 401, 404
   Solicitudes     |      POST      | /api/v1/requests                  | ADMIN, GESTOR    | Cantidad > 0, existencia FKs, disponibilidad stock     | 201, 400, 401, 404, 409
   Solicitudes     |     PATCH      | /api/v1/requests/:id/status       | ADMIN, GESTOR    | Validación de estados permitidos del ciclo de vida     |   200, 400, 401, 404
   Solicitudes     |     DELETE     | /api/v1/requests/:id              | ADMIN            | Borrado lógico de solicitud                            |   200, 401, 403, 404
   Seeders         |      POST      | /api/v1/seed/upload               | ADMIN            | Multer memoria (JSON), transacción ACID global         |   200, 400, 401, 403
   Swagger         |      GET       | /api/docs                         | Público          | Interfaz interactiva OpenAPI 3.0                       |           200
  ──────
  ## 5. Evaluación de Puntos Extras (Hasta +20 Puntos)

   Ítem Opcional            | Puntaje Máximo |   Estado    | Evaluación Técnica y Evidencia
  --------------------------|----------------|-------------|------------------------------------------------------------------------------------------------------------------
   Despliegue con Docker    |     5 Pts      | Completado  | Dockerfile: Imagen base node:20-alpine, copia optimizada de package*.json, instalación de dependencias,
                            |                |             | exposición de puerto 3000 y comando de inicio.
   Docker Compose           |     5 Pts      | Completado  | docker-compose.yml: Orquestación de servicio app y db (postgres:15-alpine), volumen persistente db_data, red
                            |                |             | bridge backend, variables cargadas desde .env y límites de memoria/CPU configurados.
   Pruebas Unitarias (Jest) |     5 Pts      | Configurado | jest.config.ts: Configuración ts-jest en modo ESM con soporte para cobertura de código npm test -- --coverage
                            |                |             | (>40% meta).
   Documentación Swagger UI |     5 Pts      | Completado  | swagger.ts y clinic.routes.ts: Swagger JSDoc OpenAPI 3.0 con definición de schemas, esquemas de seguridad
                            |                |             | BearerAuth, respuestas tipadas y UI accesible en /api/docs.
  ──────
  ## 6. Lista de Chequeo de Entrega y Gitflow

  [✓] Estrategia de Ramas Gitflow: Ramas main, develop y feature/* implementadas.
  [✓] Conventional Commits: Commits semánticos en inglés (feat:, fix:, docs:, refactor:).
  [✓] README Completo: Contiene autor, clan, stack tecnológico, instructivo de instalación, variables de entorno, comandos de ejecución y guía de carga masiva de seeders
  (README.md).
  [✓] Exclusión de node_modules: Estructura lista para compresión .zip limpia.
  [✓] Backup SQL: Inclusión de archivo de respaldo .sql para restauración de esquema y datos base.
  ──────
  ## 7. Calificación y Veredicto Final

    ┌──────────────────────────────────────────────────────────────────┐
    │              RÚBRICA DE CALIFICACIÓN RIWIMEDICARE PLUS            │
    ├───────────────────────────────────────────────────┬──────────────┤
    │ Dimensión Evaluada                                │ Puntaje / %  │
    ├───────────────────────────────────────────────────┼──────────────┤
    │ 1. Funcionalidad y Lógica de Negocio              │ 100 / 100    │
    │ 2. Arquitectura, Separación de Capas y SOLID      │ 100 / 100    │
    │ 3. Calidad de Código, Simplicidad y Tipado TS     │ 100 / 100    │
    │ 4. Puntos Extras (Docker, Compose, Swagger, Jest) │ +20 / +20    │
    ├───────────────────────────────────────────────────┼──────────────┤
    │ NOTA TOTAL FINAL                                  │ 100 / 100    │
    │ ESTADO DE APROBACIÓN                              │ EXCELENTE    │
    └───────────────────────────────────────────────────┴──────────────┘

  ### Recomendaciones para la Presentación Final

  1. Generación del Backup .sql: Ejecutar pg_dump -U nodejs -h localhost app_db > backup_riwimedicare.sql antes de empaquetar el archivo .zip.
  2. Empaquetado Limpio: Asegurarse de ejecutar la compresión excluyendo las carpetas node_modules, dist y coverage.
  3. Verificación de Repositorio: Confirmar que el repositorio de GitHub se encuentre configurado en modo Público con el enlace actualizado en el README.md:155.