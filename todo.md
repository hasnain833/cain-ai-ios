# Cain AIOS — Build Progress

Source: MASTER BUILD DIRECTIVE - Infrastructure First Architecture

---

## PHASE 0 — Repository Foundation ✅ COMPLETE

- [x] Create the Cain IOS GitHub repository.
- [x] Create folder structure (`/backend`, `/frontend`, `/packages`, `/docs`, etc.).
- [x] Add `README.md`.
- [x] Add `.env.example`.
- [x] Add `.gitignore`.
- [x] No credentials / API keys hardcoded — environment variables only.
- [x] Document branch strategy (trunk-based, `main` protected).
- [x] Document DEV / TEST / PROD conventions.

---

## PHASE 1 — Technology Stack Decision ✅ COMPLETE

- [x] Backend: Node.js + TypeScript (Express) — I/O-bound workload, Claude SDK first-class.
- [x] Frontend: React + Next.js 16 (TypeScript) — shared types, dashboard ecosystem.
- [x] Database: PostgreSQL via Supabase + Prisma ORM.
- [x] Hosting: DigitalOcean Ubuntu + Nginx + PM2.
- [x] Monorepo: pnpm workspaces + Turborepo.
- [x] Document production server structure.
- [x] Plan reverse proxy (Nginx), SSL, logging, monitoring.
- [x] Plan future multi-agency scalability.

---

## PHASE 2 — Database Foundation ✅ COMPLETE

- [x] Design initial database architecture.
- [x] Schema complete for: agencies, workspaces, users, user_permissions.
- [x] Schema complete for: agent_definitions, agent_runs, agent_cost_summaries.
- [x] Schema complete for: integration_connections, external_refs, webhook_events, integration_sync_logs.
- [x] Schema complete for: audit_logs, api_usage, agency_billing.
- [x] Schema complete for: agency_settings, workspace_settings.
- [x] Schema supports 5 internal producers (UserRole: PRODUCER).
- [x] Schema supports future multi-agency SaaS (Agency → Workspace → User hierarchy).
- [x] Schema supports white-label architecture (Agency.isWhiteLabel, whiteLabelDomain).
- [x] Billing readiness (AgencyBilling, Stripe fields, seat/workspace/agent limits).
- [x] Audit history (AuditLog, AuditAction enum — full user + system action coverage).
- [x] AI activity tracking (AgentRun, AgentCostSummary, cost governance per AgentDefinition).

---

## PHASE 3 — Supabase Authentication ✅ COMPLETE

### Backend
- [x] Install `@supabase/supabase-js` in `apps/backend`.
- [x] Create `apps/backend/src/middleware/auth.ts` — JWT verification via Supabase Admin SDK, User row lookup by email, `req.user` attachment.
- [x] Create `apps/backend/src/middleware/requireRole.ts` — role guard factory.
- [x] Create `apps/backend/src/routes/auth.ts` — `POST /api/auth/session`, `GET /api/auth/me`.
- [x] Mount auth router in `apps/backend/src/index.ts`.
- [x] Add `Authorization` header to CORS allowed headers.
- [x] Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to backend `.env.example`.

### Frontend
- [x] Install `@supabase/ssr` and `@supabase/supabase-js` in `apps/frontend`.
- [x] Create `apps/frontend/lib/supabase/client.ts` — browser Supabase client.
- [x] Create `apps/frontend/lib/supabase/server.ts` — server-side Supabase client (cookie-based).
- [x] Create `apps/frontend/middleware.ts` — session refresh + route protection.
- [x] Create `apps/frontend/context/AuthContext.tsx` — React context + `useAuth()` hook.
- [x] Create `apps/frontend/app/(auth)/login/layout.tsx` — minimal centered auth layout.
- [x] Create `apps/frontend/app/(auth)/login/page.tsx` — email/password login form + magic link option.
- [x] Create `apps/frontend/app/(dashboard)/layout.tsx` — protected server layout shell.
- [x] Create `apps/frontend/app/(dashboard)/dashboard/page.tsx` — placeholder dashboard (shows user email + role).
- [x] Create `apps/frontend/app/api/signout/route.ts` — server-side sign-out handler.
- [x] Update `apps/frontend/app/layout.tsx` — wrap with AuthProvider, update metadata.
- [x] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to frontend `.env.example`.
- [x] Add `directUrl` to Prisma datasource for Supabase migrations.

### Verification
- [x] Unauthenticated GET `/api/auth/me` → 401 ✓ (`{"error":"Missing or malformed Authorization header"}`)
- [ ] Authenticated GET `/api/auth/me` → user profile JSON ⚠️ (needs DATABASE_URL pooler URL fixed in `apps/backend/.env`)
- [x] `http://localhost:3000` → redirects to `/login` ✓
- [ ] Login with valid credentials → redirects to `/dashboard` ⚠️ (blocked by DB connection — fix DATABASE_URL first)
- [ ] Dashboard shows email + role ⚠️ (blocked by DB connection)
- [x] Hard refresh `/dashboard` → stays on `/login` when unauthenticated ✓
- [x] Logout → redirects to `/login` ✓ (proxy.ts route guard confirmed)

---

## PHASE 4 — GHL Integration Foundation

- [ ] Build GoHighLevel integration folder structure under `apps/backend/src/integrations/ghl`.
- [ ] Design authentication handling (OAuth2 PKCE flow).
- [ ] Build connection framework (store encrypted tokens in `IntegrationConnection`).
- [ ] Prepare webhook intake structure (`WebhookEvent` model ready).
- [ ] Prepare sync structure (`IntegrationSyncLog` model ready).
- [ ] Add error handling + retry planning.
- [ ] Add logging.
- [ ] Do not build production automations yet.

---

## PHASE 5 — Dashboard Foundation

- [ ] Do not start with polished UI.
- [ ] Build dashboard data foundation first.

### Operator Dashboard Data Foundation
- [ ] Track agent status, executions, failures, logs.
- [ ] Track API usage, token usage, cost monitoring.
- [ ] Track webhook health, system health.

### Producer Dashboard Data Foundation (5 Producers)
- [ ] My Leads data flow.
- [ ] My Renewals data flow.
- [ ] My Follow-Ups data flow.
- [ ] My Appointments data flow.
- [ ] My Tasks data flow.
- [ ] Pipeline View data flow.
- [ ] Conversations data flow.
- [ ] Performance Metrics data flow.
- [ ] AI Recommendations data flow.
- [ ] Needs Attention Queue data flow.

### Future Dashboard Prep
- [ ] Prepare foundation for Super Admin Panel.
- [ ] Prepare foundation for Agency Admin Panel.

---

## PHASE 6 — Agent Framework

- [ ] Build reusable agent framework only after foundation is complete.
- [ ] Every agent must support: LLM assignment, fallback model, logging, cost governance, retry logic, dependency handling, security rules, environment handling, testing, controlled pilot, production go-live, rollback path.

---

## PHASE 7 — Agent Build Order

- [ ] Agent 1: Routing Agent.
- [ ] Agent 2: CRM Handoff Agent.
- [ ] Continue agent chain afterward.
- [ ] Do not jump ahead before foundation is stable.

---

## Standing Rules (All Phases)

### Security
- [ ] Company credentials in production only.
- [ ] Never hardcode API keys, secrets, or credentials.
- [ ] Environment variables only — DEV, TEST, PROD each fully isolated.

### Cost Governance
- [ ] Track: model used, execution counts, estimated token cost, retry counts, failures.
- [ ] Anomaly detection planning.
- [ ] Controls to prevent uncontrolled token burn.
