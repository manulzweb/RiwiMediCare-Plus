# RiwiMediCare Plus — Prueba de Desempeño Módulo 5.2 Node.js

**Coder:** [Tu Nombre] — **Clan:** [Tu Clan] — **Be a codernnn**

API REST para gestión del ciclo de vida de solicitudes de abastecimiento de medicamentos (Clínicas, Almacenes, Medicamentos, Solicitudes) — distribución de insumos médicos.

## Stack

| Capa | Tecnología |
|------|------------|
| Runtime | Node.js 18+ (ESM `type:module`) |
| Framework | Express 5 |
| Lenguaje | TypeScript strict (`strict:true`, no `any`) |
| DB | PostgreSQL 15 + Sequelize 6 (`paranoid:true`, `underscored:true`) |
| Auth | JWT HS256 `HS256` payload `{id,email,role}`, bcryptjs (hooks `beforeCreate/beforeUpdate`) |
| Docs | Swagger `swagger-jsdoc` + `swagger-ui-express` en `/api/docs` |
| Upload | Multer `memoryStorage` (JSON seeder) |
| Infra | Docker 20-alpine + Compose, volumen `db_data`, red `backend` |
| Tests | Jest `ts-jest` ESM (`preset: default-esm`) |

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

## Seeders (Multer JSON)

Endpoint protegido `Administrador` que actúa como seeder dinámico:

```bash
# JSON ejemplo: seed.json
{
  "users": [{ "name": "Ana", "email": "ana@test.com", "password": "Secure123!@", "role": "Administrador" }],
  "clinics": [{ "name": "Clínica Central", "nit": "900123456-1", "responsibleName": "Dr. Pérez", "address": "Cra 10 #20-30" }],
  "warehouses": [{ "name": "Bodega Norte", "location": "Bogotá" }],
  "medicines": [{ "name": "Paracetamol", "code": "MED001", "stock": 100, "warehouseId": 1 }]
}

# Cargar
curl -X POST http://localhost:3000/api/v1/seed/upload \
  -H "Authorization: Bearer <JWT Administrador>" \
  -F "file=@seed.json"

# Respuesta: { success:true, data:{ users:1, clinics:1, warehouses:1, medicines:1 } }
```

Multer `memoryStorage`, `fileFilter` solo `.json`, `5MB` max, transacción `sequelize.transaction` para crear Users (hash vía hook), Clinics, Warehouses, Medicines.

## Autenticación y Roles

- `POST /api/v1/auth/register` **sin JWT** — body `name, email, password, confirmPassword, role (Administrador|Gestor de Solicitudes)` — valida campos y formato email, `409` si NIT/email duplicado.
- `POST /api/v1/auth/login` — retorna `200 { accessToken }` con payload `{id,email,role}`.
- `authMiddleware` verifica `Authorization: Bearer <token>`; `roleMiddleware(...roles)` restringe. `Administrador` = CRUD completo clínicas/almacenes/medicamentos/solicitudes + puede usar todo. `Gestor de Solicitudes` = crear solicitud, actualizar estado, consultar historial. Todos autenticados pueden `GET /requests/active` y `GET /requests/clinic/:clinicId`.

## Validaciones de Negocio

- **NIT duplicado** → `409` en `ClinicService.checkDuplicateNit`.
- **Cantidad** `quantity <=0` → `400`.
- **Existencia** clínica/medicamento/almacén → `404` antes de operar.
- **Inventario** `medicine.stock < quantity` o `medicine.warehouseId != warehouseId` → `409`.
- **Estados** solo `pending|approved|rejected|delivered|in_transit` → `400` si no permitido. Eliminación lógica vía `status` + `paranoid` (`deleted_at`).

## Endpoints Principales

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| POST | /api/v1/auth/register | No | — |
| POST | /api/v1/auth/login | No | — |
| GET/POST/PUT/DELETE | /api/v1/clinics | Sí | Admin (POST/PUT/DELETE), Auth (GET) |
| GET/POST/PUT/DELETE | /api/v1/warehouses | Sí | Admin |
| GET/POST/PUT/DELETE | /api/v1/medicines | Sí | Admin |
| POST | /api/v1/requests | Sí | Admin, Gestor |
| PATCH | /api/v1/requests/:id/status | Sí | Admin, Gestor |
| GET | /api/v1/requests, /active, /clinic/:clinicId, /:id | Sí | Auth |
| DELETE | /api/v1/requests/:id | Sí | Admin |
| POST | /api/v1/seed/upload | Sí | Admin |

Swagger: `http://localhost:3000/api/docs` (JSDoc en `src/routes/*.ts`).

## Gitflow y Commits

- Ramas `main`, `develop`, `feature/*`
- Conventional Commits `feat:`, `fix:`, `docs:`, `refactor:` (inglés, sin código comentado, DRY, JSDoc en métodos complejos, sin `any`).

## Entrega

- Zip sin `node_modules`, con código fuente + backup `.sql`.
- Repositorio público: `https://github.com/<tu-usuario>/RiwiMediCare-Plus`
- `AGENTS.md` con guía para agentes OpenCode.

## Principios Aplicados

DRY, KISS, YAGNI, Boy Scout, SOLID (SRP 30-40 líneas, guard clauses, param objects, DI via constructor, interfaces segregadas), Bouncer Pattern, Intentional Naming, SoC.
