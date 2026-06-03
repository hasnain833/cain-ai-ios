# Cain-AI-Operating-System
Claude Code native AI operating system for Cain Family Insurance, integrating multi-agent automation, GoHighLevel CRM workflows, routing, renewals, outreach, compliance, memory, logging, and growth operations.

---

## Repository structure

This is a **pnpm monorepo** managed with workspaces (and Turborepo for task orchestration). Frontend and backend live in one repository as separate applications; shared concerns live in their own packages.

```
Cain-AI-Operating-System/
├── apps/                       # Runnable applications (each starts its own process)
│   ├── frontend/               # Next.js dashboard (its own process, port 3000)
│   └── backend/                # Express API (its own process, port 4000)
│       └── src/
│           ├── routes/         # HTTP endpoints (/api/...)
│           ├── agents/         # AI / automation logic (routing, renewals, outreach…)
│           ├── integrations/
│           │   └── ghl/        # GoHighLevel client, OAuth, webhook handlers
│           └── index.ts        # Server entrypoint
│
├── packages/                   # Shared code that apps import (not runnable on its own)
│   ├── shared/                 # Framework-agnostic TypeScript types & utilities
│   └── database/               # Prisma schema, migrations, and generated client
│       ├── prisma/
│       │   ├── schema.prisma   # Single source of truth for the data model
│       │   └── migrations/     # Ordered schema-change history (run, not imported)
│       └── src/                # Exported Prisma client (@cain/database)
│
├── docs/                       # Architecture docs, ADRs, runbooks
├── tests/                      # Cross-cutting / integration tests
│
├── pnpm-workspace.yaml         # Declares where workspaces live (apps/*, packages/*)
├── turbo.json                  # Task pipeline (build/dev/lint ordering + caching)
├── tsconfig.base.json          # Shared compiler options every package extends
├── tsconfig.json               # Solution file: references only (build orchestration)
├── .env.example                # Documents required env keys (committed, dummy values)
└── .gitignore
```

---

## Why this structure

The organizing principle is simple and worth stating up front, because it resolves nearly every "where does this go?" question:

> **A folder is top-level for exactly one of two reasons: it runs as its own process (`apps/`), or it is code that a running process imports (`packages/`). Everything else is configuration or supporting material at the root.**

### Why a monorepo (frontend + backend in one repo)

One team ships one product. The frontend and backend constantly share the same data shapes — tenant models, GoHighLevel payloads, webhook structures. A monorepo lets those shapes live in one place (`packages/shared`) and be imported by both sides, so they can never silently drift out of sync. A single install, a single toolchain, and end-to-end TypeScript types catch integration bugs at compile time rather than in production. DigitalOcean handles a monorepo cleanly, so nothing about the deployment target argues against it.

### Why `apps/` and `packages/` instead of a flat layout

`frontend` and `backend` are **separate running processes** — they start independently and communicate over HTTP, never by importing each other. That is the only reason they are split. They sit under `apps/` because that is the dominant convention in the pnpm/Turborepo ecosystem: it means every tutorial, example, and new developer maps onto this repo with zero translation. A flat root layout works too, but matching the convention is worth more than the few minutes it costs, especially on a project that may outlive any one contributor.

### Why `agents/` and `integrations/` live inside `backend/`, not at the root

These are **not processes**. Nothing runs them. They are modules — the GoHighLevel client, the OAuth flow, webhook handlers, and the AI/automation logic — that execute *inside* the Express process. Placing them at the top level would make them look like standalone applications, which they are not. They are backend code, so they live in `apps/backend/src/`.

(If a separate background worker process is added later — for processing webhooks and agent jobs off the request path — and it needs this same code, that is the moment `agents`/`integrations` graduate into `packages/` so both the API and the worker can import them. Not before.)

### Why `packages/shared` and `packages/database` are separate

`shared` holds plain, framework-agnostic TypeScript types and utilities — things both the frontend and backend can safely import. `database` owns everything Prisma: the schema, the migrations, and the generated client, exported as `@cain/database`. They are kept apart because they are different kinds of thing. The client is **code you import**; migrations are an **operational history you run** against a database. Keeping Prisma in its own package means one place owns the data layer, the backend consumes it as a normal workspace dependency, and `shared` stays clean for types.

### Why `docs/` and `tests/` stay at the root

They are neither runnable apps nor importable code, so neither `apps/` nor `packages/` is their home. They are supporting material for the whole repository and belong at the top level.

### Why there is no `logs/` folder

Logs are runtime artifacts, not source. In production the apps log to stdout/stderr and the platform aggregates them; committing a `logs/` directory would mix runtime output into version control. It is intentionally absent and gitignored.

---

## Technology stack

| Layer | Choice | Reason (summary) |
|---|---|---|
| Backend | Node.js + TypeScript (Express) | One language across the stack; the workload is I/O-bound (CRM, webhooks, Claude, DB) which suits Node; first-class Claude SDK support |
| Frontend | React + Next.js (TypeScript) | Shares types with the backend; flexible rendering; large dashboard ecosystem |
| Database | PostgreSQL via Supabase, accessed with Prisma | Prisma is the typed data layer; Supabase provides managed Postgres. They stack — Prisma talks to Supabase's Postgres |
| Hosting | DigitalOcean (Ubuntu) + Nginx + PM2 | Nginx reverse-proxies one domain to both processes; PM2 supervises them |

Prisma uses two Supabase connection strings: a pooled `DATABASE_URL` for app runtime and a direct `DIRECT_URL` for migrations.

---

## Environment variables

**No hardcoded credentials. Environment variables only for infrastructure secrets; per-tenant GoHighLevel tokens are stored encrypted in the database, never in env.**

- `.env.example` is committed (keys + dummy values). Real `.env` files are gitignored.
- **Backend / database** env holds secrets: `DATABASE_URL`, `DIRECT_URL`, `GHL_CLIENT_ID`, `GHL_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `ANTHROPIC_API_KEY`. The database connection lives only here — never in the frontend.
- **Frontend** env (`.env.local`) holds only browser-safe, non-secret values, prefixed `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_API_URL`). The browser never talks to the database directly; it calls the Express API.
- Mental test for any value: *would I be comfortable seeing this in the browser's dev tools?* The API URL, yes. A database password, never.

---

## Getting started

```bash
pnpm install          # install all workspaces; generates the Prisma client
pnpm run dev          # run frontend and backend together
```

In development you run two processes (frontend on 3000, backend on 4000). The frontend calls the backend over HTTP. In production, Nginx puts both behind one domain so the browser sees a single origin.

---

## Branch strategy

Trunk-based development with short-lived branches:

- `main` — always deployable, protected, requires PR + passing CI.
- `feature/*`, `fix/*` — short-lived, merged via PR, deleted after merge.
- `staging` (optional) — only if a persistent pre-prod environment is wanted.

Heavier GitFlow (`develop` + `release/*` + `hotfix/*`) is intentionally avoided; it is overkill for a continuously-deployed SaaS platform with one team.

---

## Dev / test / prod conventions

**Same code, different config.** No environment branching in business logic — only configuration changes between environments. Each environment gets fully isolated databases and GoHighLevel credentials so a mistake in one cannot reach another.

| Environment | Database | GHL credentials | Deploys from |
|---|---|---|---|
| dev | Local / Supabase dev project | GHL sandbox / dev app | local `.env` |
| staging | Separate Supabase project | Separate GHL app | `main` (or `staging`) |
| prod | Separate Supabase project | Production GHL app | `main` after staging passes |