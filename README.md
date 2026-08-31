# RiwiMediCare Plus — Prueba de Desempeño Módulo 5.2 Node.js

**Coder:** [Tu Nombre Completo] — **Clan:** [Tu Clan - Ej: Clan Gates] — **Be a codernnn**
**Repositorio:** `https://github.com/<tu-usuario>/RiwiMediCare-Plus` (público, ramas `main`/`develop`/`feature/*`, Conventional Commits)

API REST para gestión del ciclo de vida de solicitudes de abastecimiento de medicamentos (Clínicas, Almacenes, Medicamentos, Solicitudes) — distribución de insumos médicos.

## Stack

| Capa      | Tecnología                                                                                |
| --------- | ----------------------------------------------------------------------------------------- |
| Runtime   | Node.js 18+ (ESM `type:module`)                                                           |
| Framework | Express 5                                                                                 |
| Lenguaje  | TypeScript strict (`strict:true`, no `any`)                                               |
| DB        | PostgreSQL 15 + Sequelize 6 (`paranoid:true`, `underscored:true`)                         |
| Auth      | JWT HS256 `HS256` payload `{id,email,role}`, bcryptjs (hooks `beforeCreate/beforeUpdate`) |
| Docs      | Swagger `swagger-jsdoc` + `swagger-ui-express` en `/api/docs`                             |
| Upload    | Multer `memoryStorage` (JSON seeder)                                                      |
| Infra     | Docker 20-alpine + Compose, volumen `db_data`, red `backend`                              |
| Tests     | Jest `ts-jest` ESM (`preset: default-esm`)                                                |

## Estructura

```
app/src/
├── config/       database.ts (define paranoid), env.ts, cors.ts
├── models/       user, role, clinic, warehouse, medicine, request (relations 1-N)
├── repositories/ clinic, warehouse, medicine, request, user, role
├── services/     auth (register/login), clinic, warehouse, medicine, request, seed, auth-token, password
├── controllers/  auth, clinic, warehouse, medicine, request
├── routes/       auth, clinic, warehouse, medicine, request, seed
├── middleware/   auth (Bearer), role (Administrador|Gestor de Solicitudes)
├── dto/request/  login-user, register-user, create-clinic|warehouse|medicine|request
├── types/        user (UserRole, UserStatus), auth, express
├── docs/         swagger.ts
├── server.ts     app Express (express.json())
└── index.ts      bootstrap: authenticate → sync({alter:true}) → listen
```

## Instalación

```bash
git clone <repo-url> RiwiMediCare-Plus
cd RiwiMediCare-Plus
cp .env.example .env
# editar JWT secrets si es necesario
cd app && npm install
```

## Variables de Entorno (.env.example)

```ini
POSTGRES_HOST=db
POSTGRES_USER=nodejs
POSTGRES_PASSWORD=123456
POSTGRES_DB=app_db
POSTGRES_PORT=5432
APP_PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

JWT_ACCESS_SECRET=cambia-esto-por-un-secreto-largo-y-aleatorio
JWT_REFRESH_SECRET=otro-secreto-distinto-igual-de-largo
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=express-auth-template
JWT_AUDIENCE=auth-client
BCRYPT_ROUNDS=12

# Seed / Frontend
FRONTEND_URL=http://localhost:5173
```

## Ejecución

```bash
# Desarrollo con Docker (recomendado)
docker-compose up -d --build
docker-compose logs -f app
# http://localhost:3000/api/docs

# Desarrollo local sin Docker (requiere Postgres local)
# en .env: POSTGRES_HOST=localhost
cd app
npm run dev      # ts-node-dev --esm src/index.ts (respawn)
npm run build    # tsc -> dist/ (ESM)
npm start        # node dist/index.js
npm run lint     # eslint flat + prettier
npm run format   # prettier --write
npm test         # jest --passWithNoTests
npm run test:coverage
```

## Seeders (Multer JSON) — `POST /api/v1/seed/upload` (sin JWT, carga inicial)

Endpoint **sin autenticación** (útil para primer deploy). Multer `memoryStorage`, `fileFilter` solo `.json`, `5MB` max, transacción `sequelize.transaction` orden `warehouses → clinics → medicines` + hash `bcrypt` para usuarios.

**Archivo real incluido:** `app/seed-real.json` (3 users, 3 clinics, 2 warehouses, 4 medicines — datos reales probados)

```json
{
  "users": [
    {
      "name": "Admin RiwiMediCare",
      "email": "admin@riwimedicare.com",
      "password": "Admin123!@",
      "role": "ADMIN"
    },
    {
      "name": "Gestor Solicitudes",
      "email": "gestor@riwimedicare.com",
      "password": "Gestor123!@",
      "role": "REQUEST_MANAGER"
    }
  ],
  "warehouses": [
    {
      "name": "Bodega Central",
      "code": "BOG-001",
      "location": "Bogotá D.C. - Fontibón, Calle 17 # 69-02"
    },
    {
      "name": "Bodega Norte",
      "code": "BOG-002",
      "location": "Bogotá - Suba, Carrera 55 # 152-20"
    }
  ],
  "clinics": [
    {
      "name": "Clínica Central",
      "nit": "900123456-10",
      "address": "Carrera 15 #85-20, Bogotá",
      "phone": "+57 300 4567890",
      "responsibleName": "Laura Méndez",
      "responsibleEmail": "laura.mendez@clinic.com"
    }
  ],
  "medicines": [
    {
      "name": "Paracetamol 500mg",
      "code": "MED-001",
      "description": "Analgésico",
      "stock": 120,
      "unitPrice": 2500.5,
      "warehouseId": 1
    }
  ]
}
```

```bash
# Sin JWT (actual)
curl -X POST http://localhost:3000/api/v1/seed/upload -F file=@app/seed-real.json
# Respuesta: { success:true, message:"Seed completed", data:{users:3, clinics:3, warehouses:2, medicines:4} }

# Swagger: POST /api/v1/seed/upload → Choose File → seed-real.json → Execute
```

## Autenticación y Rutas (Chain: Auth 401 → Role 403 → Validate 400 → Service 409/404 → Controller 200)

- `POST /api/v1/auth/register` **sin JWT** — body `name, email, password, role: ADMIN|REQUEST_MANAGER` — `400` si validación, `409` si email duplicado.
- `POST /api/v1/auth/login` — `200 {accessToken, tokenType:"Bearer"}` payload `{id,email,role,sub,type:"access"}`.
- `authMiddleware.ts:8` verifica `Bearer`, `role.middleware.ts:14` restringe. **Administrador** = CRUD completo clínicas/almacenes/medicamentos/solicitudes. **Gestor** = `POST /requests` + `PATCH /requests/:id/status` + `GET /requests*`. Todos autenticados `GET /requests/*`. Sin JWT → `401`, rol insuficiente → `403`.

## Validaciones de Negocio (4 Middlewares dedicados + Zod)

- **NIT duplicado** → `409` `middleware/checkNit.middleware.ts:7` (excluye `id` propio en `PUT`).
- **Cantidad ≤0** → `400` `middleware/checkQuantity.middleware.ts:7` + `schemas/request.schema.ts:20` `z.coerce.number().min(1)`.
- **Existencia** clínica/medicamento/almacén → `404` `services/request.service.ts:15` `ensure*Exists`.
- **Inventario** `stock < qty` o `warehouseId mismatch` → `409` `middleware/checkInventory.middleware.ts:10` (`Medicine.findByPk`).
- **Estado** solo `PENDING,APPROVED,REJECTED,DISPATCHED,DELIVERED,CANCELLED` (case-insensitive: `approved`→`APPROVED`) → `400` `middleware/checkStatus.middleware.ts:11` + `schemas/request.schema.ts:27` `transform toUpperCase`.
- Eliminación lógica `paranoid:true` + `isDeleted` + `deleted_at` (no `DELETE FROM`).

## Endpoints Principales

| Método              | Ruta                                               | Auth   | Rol                                                         |
| ------------------- | -------------------------------------------------- | ------ | ----------------------------------------------------------- |
| POST                | /api/v1/auth/register                              | No     | —                                                           |
| POST                | /api/v1/auth/login                                 | No     | —                                                           |
| GET/POST/PUT/DELETE | /api/v1/clinics                                    | Sí     | Admin (POST/PUT/DELETE), Auth (GET)                         |
| GET/POST/PUT/DELETE | /api/v1/warehouses                                 | Sí     | Admin                                                       |
| GET/POST/PUT/DELETE | /api/v1/medicines                                  | Sí     | Admin                                                       |
| POST                | /api/v1/requests                                   | Sí     | Admin, Gestor                                               |
| PATCH               | /api/v1/requests/:id/status                        | Sí     | Admin, Gestor                                               |
| GET                 | /api/v1/requests, /active, /clinic/:clinicId, /:id | Sí     | Auth                                                        |
| DELETE              | /api/v1/requests/:id                               | Sí     | Admin                                                       |
| POST                | /api/v1/seed/upload                                | **No** | — (carga inicial Multer JSON sin JWT, ver `seed-real.json`) |

Swagger: `http://localhost:3000/api/docs` (JSDoc en `src/routes/*.ts`, `src/docs/swagger.ts` con `servers` y `bearerAuth`).

## Backup y Entrega Moodle

```bash
# Backup incluido: ./backup.sql (123K, pg_dump --clean --if-exists, 4 users, 3 clinics, 2 warehouses, 4 medicines, 1 request)
docker exec app-db pg_dump -U nodejs -d app_db --no-owner --no-privileges --clean --if-exists > backup.sql
# Restaurar: docker exec -i app-db psql -U nodejs -d app_db < backup.sql

# Zip sin node_modules (obligatorio)
zip -r ../RiwiMediCare-Plus.zip . -x "app/node_modules/*" "app/dist/*" "app/coverage/*" ".git/*"
# Verificar: unzip -l ../RiwiMediCare-Plus.zip | head
```

Coverage: `npm run test:coverage` → `6 suites, 51 tests, 43% Stmts / 44% Lines` (`jest.config.cjs` `collectCoverageFrom` services/middleware). Cumple `>40%`.

## Gitflow y Commits

- Ramas `main`, `develop`, `feature/*`
- Conventional Commits `feat:`, `fix:`, `docs:`, `refactor:` (inglés, sin código comentado, DRY, JSDoc en métodos complejos, sin `any`).

## Entrega

- Zip sin `node_modules`, con código fuente + backup `.sql`.
- Repositorio público: `https://github.com/<tu-usuario>/RiwiMediCare-Plus`
- `AGENTS.md` con guía para agentes OpenCode.

## Principios Aplicados

DRY, KISS, YAGNI, Boy Scout, SOLID (SRP 30-40 líneas, guard clauses, param objects, DI via constructor, interfaces segregadas), Bouncer Pattern, Intentional Naming, SoC.
