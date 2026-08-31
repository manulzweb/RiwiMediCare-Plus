# AGENTS.md

## Setup

- Tooling lives in `app/` — root only has `docker-compose.yml` + `.env`. Always `cd app && npm install`.
- Env file is **repo root `.env`** (not `app/.env`). `docker-compose.yml:11` loads it via `env_file: - ./.env`. Copy `cp .env.example .env` before any run.
- Required env (throws in `src/config/env.ts:5`): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. `POSTGRES_HOST` defaults to `db` (docker) via `env.ts:51`; `APP_PORT`, `JWT_*_EXPIRES_IN`, `BCRYPT_ROUNDS` have defaults.
- DB not reachable locally without Docker: use `docker-compose up -d` or set `POSTGRES_HOST=localhost` + local Postgres.

## Commands (run in `app/`)

- `npm run dev` — `ts-node-dev --respawn --transpile-only src/index.ts` (no typecheck on save).
- `npm run build` — `tsc` (`rootDir: src`, `outDir: dist`, `module: nodenext`). No `npm run typecheck` script — use `build`.
- `npm run lint` / `npm run lint:fix` — ESLint flat (`eslint.config.mjs` + `typescript-eslint` + `eslint-config-prettier`). Ignores `dist/**, coverage/**`.
- `npm run format` / `format:check` — Prettier (`semi:true, singleQuote:true, printWidth:100` in `.prettierrc`).
- `npm test` — `jest` with `preset: ts-jest`, `rootDir: src`, `testMatch: **/__tests__/**/*.test.ts` (`jest.config.ts:7`). `setupFiles: src/__tests__/setup/env.setup.ts` — file does **not exist yet**; creating tests requires adding it or removing the entry or tests will fail to run.
- Single test: `npm test -- src/__tests__/path/to.test.ts` or `npx jest src/__tests__/foo.test.ts`.
- `npm run test:coverage` writes to `app/coverage/`.

## Project Context — RiwiMediCare Plus

- Domain: API REST for **medical supply request management** (Clínicas, Almacenes, Medicamentos, Solicitudes). All code in `app/src`.
- **Stack (strict)**: Node >=18, Express, TypeScript strict (`strict:true` in `tsconfig.json:4`, no `any`), PostgreSQL + Sequelize, JWT, Swagger (`swagger-jsdoc`/`swagger-ui-express`), Multer (JSON seed upload), Jest (>40% coverage optional), Docker/Compose optional.
- **Clean-code rules**: layered `routes → controllers → services → repositories → models`; no commented/dead code, no unresolved TODOs, DRY, JSDoc required on complex methods, Conventional Commits + Gitflow (`main`/`develop`/`feature/*`).
- **Short & modular functions (SRP, anti-monolith) — strictly enforced**: no function/controller/service `>30-40` lines; if it grows, extract to `private` methods, `src/utils/helpers`, or independent services. Use guard clauses / early returns instead of deep `if/else` nesting; validate errors at top and `return` immediately. If `>3` params, group into `interface`/`type` DTO (e.g. `CreateRequestParams`). Every extracted function must have explicit input/output types (no `any`).

## Architecture

- Entrypoints: `src/server.ts:14` exports testable Express app (no DB, uses `express.json()`); `src/index.ts:12` is the bootstrapper (`authenticate` → `sync({alter:true})` → `listen`). Import `server.ts` for tests. Also re-exported as `src/app.ts:3`.
- Layers: `routes` → `controllers` → `services` → `repositories` → `models` → `sequelize`/`pg`. DTOs in `src/dto/request|response`, domain errors in `src/errors/domain-errors.ts`, shared types in `src/types/`.
- Models: `User` (`src/models/user.model.ts:26`) has `name, email, passwordHash, role: 'Administrador'|'Gestor de Solicitudes', status: 'activo'|'inactivo'`, `paranoid:true` (global `define.paranoid` in `src/config/database.ts:39`). `Role` seeded via `role.repository.findOrCreateDefault`. All models use `underscored:true`, `timestamps:true`, `deleted_at` soft-delete. DB sync is `sequelize.sync({alter:true})` dev-only — no migrations.
- **Missing domain models**: `Clinic`, `Warehouse`, `Medicine`, `Request` do NOT exist yet — must be created with `paranoid:true`, relations `Clinic 1—N Request`, `Medicine 1—N Request`, `Warehouse 1—N Request`, and validations below.
- Auth: JWT `HS256` with `id, email, role, sub, type:'access'` (`src/services/auth-token.service.ts:17`). `authMiddleware` (`src/middleware/auth.middleware.ts:6`) verifies `Authorization: Bearer <token>`; `roleMiddleware(...rolesAllowed)` (`src/middleware/role.middleware.ts:14`) checks `req.user.role` — must be chained **after** `authMiddleware`.Register is rate-limited (`src/routes/auth.routes.ts:17`) + `verifyCaptcha` stub (passes when `RECAPTCHA_ENABLED=false`).
- API prefix: `app.use('/api/v1', router)` (`server.ts:43`); Swagger at `/api/docs` (`server.ts:47`) — spec requires `/api-docs` (checklist), current impl is `/api/docs` — reconcile or expose both. Spec generated from JSDoc in `src/routes/*.ts` via `src/docs/swagger.ts`.

## Roles & Auth

- `POST /api/v1/auth/register` — **no JWT**, allows `role` freely (`Administrador`|`Gestor de Solicitudes`). Validates required fields + email format.
- `POST /api/v1/auth/login` — returns JWT with `{id,email,role}`. All other routes require `authMiddleware` (`verifyToken`); admin routes require `roleMiddleware('Administrador')`.
- Gestor allowed: `create`/`updateStatus`/`list` Requests, list history; `Administrador` full CRUD on Clinics, Warehouses, Medicines, Requests. Authenticated users can list active requests + history by clinic.

## Business Rules (must enforce via middleware/service, return proper HTTP)

- Inventory: reject `POST /requests` if warehouse lacks medicine quantity (`409` or `400`).
- Duplicate NIT: reject duplicate `Clinic.nit` (`409`).
- Quantity: `quantity > 0` else `400`.
- Existence: Clinic and Medicine must exist before any request operation (`404`).
- Status transitions: only allowed states (define enum, e.g. `pendiente|aprobada|rechazada|entregada`); unknown → `400`.

## Seeders (Multer — still TODO)

- Must add `POST /api/v1/seed/upload` (or similar) using `multer` `memoryStorage`, accept `.json` file, parse and bulk-create Users, Clinics, Warehouses, Medicines inside a transaction. Not implemented yet — agent must create `src/routes/seed.routes.ts`, `src/services/seed.service.ts`, and wire `multer` (`npm i multer @types/multer` needed).

## Success Checklist

- [ ] `register` no JWT + role in body; `login` returns JWT; `authMiddleware` on all other routes; `roleMiddleware` on admin routes
- [ ] Models with `paranoid:true` and status/soft-delete, correct relations
- [ ] Multer JSON seeder endpoint
- [ ] Swagger at `/api-docs` (or `/api/docs`) functional

## Principles

- **DRY**: single representation per logic — abstract duplicated code to function/service/util.
- **KISS**: avoid overengineering/needless complexity — simplest solution that works.
- **YAGNI**: no speculative abstractions — implement only current requirements.
- **Boy Scout Rule**: leave files cleaner than found — fix naming/mess when you touch a file.
- **SOLID**:
  - **S** Single Responsibility — one reason to change; no 1000-line functions (`Project Context` 30-40 line limit).
  - **O** Open/Closed — extend via new class/plugin, don't modify working code.
  - **L** Liskov — subtype must be substitutable for parent without breaking behavior.
  - **I** Interface Segregation — many small specific `interface`s over one fat interface (TS: don't force unused methods).
  - **D** Dependency Inversion — high-level business logic depends on abstractions (`interface`s), not low-level PG/Sequelize; enables mocks/testing.
- **Bouncer Pattern (Fail Fast)**: validate & `return` errors at top of function — avoid `if/else` arrow/Hadouken nesting.
- **Intentional Naming**: name must answer why it exists, what it does, how it's used — if it needs a comment, rename (`let d` → `let elapsedDays`).
- **Separation of Concerns**: controller = HTTP only, service = business logic, repository/model = DB.

## Conventions

- **English-only code**: property names must be `name, role, status` — not `nombre, rol, estado` (previous sessions aliased both; now strictly English). JSDoc/Swagger also English.
- Strong typing: `src/types/user.types.ts:8` defines `UserRole`/`UserStatus` with `isValidUserRole/status` guards; use them in service validation. DTOs are extensible via `[key:string]: unknown`.
- Responses normalized: `src/controllers/auth.controller.ts:24` helpers `successResponse`/`errorResponse` → `{success, message, data}`.
- Passwords: hashed via `bcryptjs` in Sequelize hooks (`user.model.ts:186` `beforeCreate/beforeUpdate` checks `$2a$` prefix to avoid double-hash). Service also hashes via `password.service.ts` — safe due to prefix check.
- Mailer is mock when `SMTP_HOST/USER/PASS` empty (`src/config/mailer.ts:6` logs to console).

## Gotchas

- `jest.config.ts:9` `clearMocks:true`, `coverageDirectory: '../coverage'` (outside `src`).
- No `.opencode/opencode.json`, no CI/workflows, no `.github` — no hidden checks.
- `Dockerfile:16` `CMD ["npx","ts-node-dev",...]` (dev server in container, not compiled `dist`).
- `skills-lock.json` tracks optional skills (`express-typescript`, `nodejs-backend-patterns`) — not required for build.
