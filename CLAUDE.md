# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mina's Kitchen is a **multi-tenant (white-label) food ordering platform** for West African cuisine, built on Next.js 16 (App Router), React 19, TypeScript, Prisma 7, and PostgreSQL. A single deployment serves many restaurant brands, each isolated by `tenantId` and resolved from the request hostname.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`).

```bash
pnpm dev                 # Start dev server (http://localhost:3000)
pnpm build               # prisma generate + next build
pnpm lint                # ESLint
pnpm lint:fix            # ESLint with --fix
pnpm format              # Prettier write
pnpm type-check          # tsc --noEmit

pnpm test                # Jest (jsdom)
pnpm test:watch          # Jest watch mode
pnpm test:coverage       # Jest with coverage
pnpm test -- path/to/file.test.ts          # Run a single test file
pnpm test -- -t "name of test"             # Run tests matching a name

pnpm db:seed             # Seed DB (tsx prisma/seed.ts)
pnpm db:push             # prisma db push (no migration)
pnpm db:reset            # prisma migrate reset --force (drops + reseeds)
pnpm db:studio           # Prisma Studio
```

After changing `prisma/schema.prisma`, run `npx prisma migrate dev --name <desc>` then `npx prisma generate`. The build runs `prisma generate` automatically via the `build` and `postinstall` scripts.

## Architecture

### Multi-tenancy (the core architectural concern)

Tenancy is resolved per-request and threaded through almost every data access path. Every tenant-scoped model (`User`, `MenuCategory`, `MenuItem`, `Package`, `Order`, `Cart`) carries a `tenantId` FK to `Tenant`, with uniqueness constraints scoped per tenant (e.g. `@@unique([tenantId, email])`).

Request flow:

1. **`middleware.ts`** runs on all non-static routes. It parses the hostname, extracts the subdomain (or `default` for `localhost`), and injects `x-tenant-subdomain` + `x-tenant-hostname` request headers.
2. **`src/lib/tenant.ts`** — pure resolution helpers: `extractSubdomain`, `getTenantBySubdomain`, `getTenantByDomain`, `getTenantFromHostname` (custom domain first, then subdomain), `isTenantActive`.
3. **`src/lib/tenant-context.ts`** — server-side accessors that read the middleware headers via `next/headers`: `getCurrentTenant()`, **`getCurrentTenantId()`**, `requireTenant()`, `getTenantSubdomain()`. Use these in Server Components and API routes.
4. **`src/hooks/use-tenant.ts`** + **`src/components/tenant/`** — client-side branding (colors/logo) via `/api/tenant/current`; `TenantProvider` is mounted in `src/app/layout.tsx`.

**When writing any API route or query that touches tenant data, you MUST scope it by `tenantId`.** The standard pattern (see `src/app/api/admin/menu/items/route.ts`):

```ts
const tenantId = await getCurrentTenantId();
if (!tenantId)
  return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
const where = { tenantId /* ...other filters */ };
```

`SUPER_ADMIN` is the platform-level role that manages all tenants (see `src/app/admin/super-admin/`, `src/app/api/admin/tenants/`); it operates across tenants rather than within one.

### Auth

JWT-based, in `src/lib/auth.ts`, using `jose` (Edge-compatible) for verification. Token comes from the `auth-token` cookie or `Authorization: Bearer` header. Wrap route handlers with:

- `requireAuth(handler)` — requires any authenticated user.
- `requireAdmin(handler)` — requires `ADMIN` or `SUPER_ADMIN`.
- `requireSuperAdmin(handler)` — requires `SUPER_ADMIN` (cross-tenant platform endpoints).

Auth is **tenant-bound**: the JWT carries `tenantId`, and `getAuthUser` rejects a token presented against a different tenant. `SUPER_ADMIN` is exempt (operates across tenants). `getJwtSecret()` throws if `JWT_SECRET` is missing/<32 chars — there is no insecure fallback. `AuthUser` includes `tenantId`. Roles are `CUSTOMER | ADMIN | SUPER_ADMIN` (`UserRole` enum).

### Database access

- `src/lib/db.ts` exports a singleton `db` (PrismaClient) using the `@prisma/adapter-pg` driver adapter over a `pg` Pool. Always import `{ db }` from `@/lib/db`; do not instantiate PrismaClient elsewhere.
- Postgres provider. Some fields are JSON-encoded **strings** in the DB and parsed in app code (e.g. `Tenant.settings`, `MenuItem.tags`, `Package.features`) — `allergens` is a real `String[]`. Be careful which is which when reading/writing.
- Money columns are `Decimal(10,2)`. `db.ts` patches `Prisma.Decimal.toJSON` to emit a **number**, so API responses stay numeric — but in server-side arithmetic a Decimal read from the DB must be wrapped with `Number(...)` (it is not a JS number), and Decimal values must be converted before crossing the server→client component boundary.

### Data layer on the client

State and server-cache are split:

- **TanStack Query** is the source of truth for server data. Hooks live in `src/hooks/queries/` (reads) and `src/hooks/mutations/` (writes); query key factories in `src/lib/query-keys.ts`; client config in `src/lib/query-client.ts` and `src/components/providers/query-provider.tsx`.
- **Zustand** stores in `src/stores/` hold UI/client state: `cart-store.ts` (persisted, with server sync), `user-store.ts`, `admin-store.ts`, `subscription-store.ts`.
- The cart is the trickiest piece: `cart-store` persists to localStorage and syncs to the server for authenticated users (`use-cart-sync.ts`, `use-integrated-cart.ts`, `/api/cart`).

### Routing layout

`src/app/` (App Router). Public storefront routes (`/menu`, `/packages`, `/checkout`, etc.), customer auth under `/auth`, admin dashboard under `/admin` (with `/admin/super-admin` for platform admins), and API routes under `/app/api/**` (`route.ts` handlers). Branding/metadata is tenant-aware (`src/lib/tenant-metadata.ts`).

### Validation

Request bodies are validated with **Zod** schemas defined inline in route files (and shared ones in `src/lib/validations.ts`). Follow the existing pattern: define the schema, `parse`, then build the tenant-scoped Prisma query.

## Conventions

- Path alias `@/*` → `./src/*`.
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`).
- Testing: Jest + React Testing Library (jsdom). Tests live in `__tests__/` dirs or `*.test.ts(x)`. `jest.setup.js` mocks the router and polyfills `fetch`/`TextEncoder`; `@/` is mapped in `jest.config.js`. Focused auth/tenant tests live in `src/lib/__tests__/`. (`fast-check` is a dependency but not currently used.)
- `prisma/seed.ts` is excluded from `tsconfig` and run via `tsx`.

## Reference docs

Deeper design notes live in `docs/` (multi-tenant implementation, branding system, super-admin dashboard) and `.kiro/specs/` (original feature specs). `DEPLOYMENT.md` covers Vercel deployment; required env vars are in `.env.example` (`DATABASE_URL`, `JWT_SECRET`, etc.).
