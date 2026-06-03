
Claude finished the response
Please treat this as the active Cain AIOS infrastructure direction and replacement for earlier fragmented updates.
Locked stack: - Node.js + TypeScript backend - Next.js frontend - Supabase/PostgreSQL - DigitalOcean Ubuntu deployment
Platform direction: Cain AIOS = operating platform. GHL = CRM, marketing, nurture, demo booking, communications engine.
Required infrastructure planning: - DEV / STAGING / PROD - secure environment handling - monitoring / logging - backups / rollback planning - CI/CD workflow - RBAC / permissions - multi‑tenant architecture - dashboard foundation - GHL integration layer - deployment controls - documentation standards - question protocol (do not silently guess)
Required role support: - Super Admin - Agency Admin - Producer - Staff / Service User - Support / Internal Ops - Read‑Only / Analyst - System Operator / Cain Core Admin
Cain Front: Customer‑facing AI assistant. Website → Cain → qualification → demo interest → GHL → Cain AIOS. Prepare architecture readiness now, not full build.
Cain Core: Backend intelligence / operator layer. Prepare architecture support for: - audits - workflow analysis - logic gap detection - reporting - recommendations - controlled corrective actions
Security requirements: No unrestricted cloning, unrestricted replication, unrestricted self‑deployment, or unrestricted protected export behavior. Use permissions, approvals, protected configuration boundaries, audit logging, and deployment controls.
Dashboard foundation: Operator Dashboard + Producer Dashboard required foundation. Prepare future support for Super Admin and Agency Admin panels.
35‑agent registry awareness required at infrastructure level.
Build order: Repo → Stack → Database → GHL Foundation → Dashboard Foundation → Agent Framework → Agent Builds.
If a structural decision is unclear, state assumption, give recommendation, and ask rather than silently guessing.

Verify that what client intends to do here?

Show more
Jun 2
I want to make sure I understand this correctly before we go any further.

What I'm reading:

You've shared what appears to be a foundational infrastructure directive for a platform called Cain AIOS — essentially a locked specification document covering stack, architecture, roles, security, build order, and integration requirements (primarily with GoHighLevel).

My verification questions:

1. What are you asking me to do with this?

A few possible interpretations:

Option A — You want me to acknowledge and store this as active context for an ongoing architecture/build conversation, and you're about to start asking specific questions
Option B — You want me to review and critique this specification (gaps, risks, missing pieces)
Option C — You want me to produce a deliverable from this — e.g., a repo structure, infrastructure diagram, database schema, CI/CD plan, etc.
Option D — You're handing me this as a reference and want me to start producing the Build Order (Repo → Stack → Database → ...) step by step
2. Where are you in the build?

Is this greenfield (nothing exists yet), or are there partial pieces already in place that this is consolidating/replacing?

3. Who is the audience for outputs?

Are deliverables for your own development team, a client handoff, a contractor briefing, or internal planning?

Once I know what you actually need from me right now, I can engage properly rather than assume.

I want to verify how ghl fits in this structure?

Jun 2
Good question. Based on what you've shared, here's how GHL (GoHighLevel) fits into the Cain AIOS structure:

GHL's Role in the Architecture
GHL is not the platform — it's a service layer.

Cain AIOS is the operating platform. GHL plugs into it as a specialized engine for specific functions.

What GHL Owns
Function	GHL Handles
CRM	Contact records, pipelines, deal stages
Marketing	Email/SMS campaigns, sequences
Nurture	Automated follow-up workflows
Demo Booking	Calendar, appointment scheduling
Communications	2-way SMS, email, calls
What Cain AIOS Owns
Function	Cain AIOS Handles
Platform logic	Workflows, rules, agent orchestration
Operator control	Dashboards, RBAC, audit logs
Intelligence layer	Cain Core — analysis, recommendations
Customer entry point	Cain Front — qualification flow
Multi-tenant management	Agency/Producer separation
Data sovereignty	Supabase/PostgreSQL as source of truth
The Integration Flow
Website Visitor
      ↓
  Cain Front (AI qualification)
      ↓
  Demo interest confirmed?
      ↓
  GHL ← Cain AIOS pushes contact + intent data
      ↓
  GHL handles: booking, nurture, comms
      ↓
  GHL events/updates → back to Cain AIOS via webhook/API
The Integration Layer (from your spec)
Your spec calls out a GHL Integration Layer — this sits inside Cain AIOS and is responsible for:

Pushing qualified leads from Cain Front → GHL
Pulling status updates, booking confirmations, pipeline changes back into Cain AIOS
Mapping GHL contacts/pipelines to Cain AIOS tenant/producer structure
Webhooks — GHL fires events → Cain AIOS listens and acts
Authentication — API key or OAuth management for GHL connection, stored securely per tenant
Key Architectural Boundary
Cain AIOS is the source of truth. GHL is not.

This means:

Contacts originate or are mirrored in Supabase
GHL holds operational/comms data
Decisions and logic live in Cain AIOS, not inside GHL workflows
If GHL were ever replaced, Cain AIOS continues operating
One Clarifying Question
Your spec says "GHL = CRM, marketing, nurture, demo booking, communications engine" — but I want to confirm:

Are producers/agencies bringing their own GHL accounts (multi-tenant GHL), or is there one master GHL account that Cain AIOS manages centrally?

This significantly affects how the integration layer is architected.

PHASE 2 — DATABASE FOUNDATION ━━━━━━━━━━━━━━━━━━━━━━
Design initial database architecture.
Required entities:
agencies users producers leads tasks renewals appointments pipelines conversations agent_runs logs api_usage settings
Prepare for:

5 internal producers
future multi‑agency SaaS
white‑label architecture
billing readiness
audit history
AI activity tracking
Provide schema recommendation and reasoning.
━━━━━━━━━━━━━━━━━━━━━━ PHASE 3 — GHL INTEGRATION FOUNDATION ━━━━━━━━━━━━━━━━━━━━━━
Build GoHighLevel integration foundation.
Requirements:

auth handling
connection framework
webhook intake preparation
sync preparation
error handling
retry planning
logging preparation
No production automations yet.
Foundation only.
━━━━━━━━━━━━━━━━━━━━━━ PHASE 4 — DASHBOARD FOUNDATION ━━━━━━━━━━━━━━━━━━━━━━
Do NOT build polished UI first.
Build data foundation supporting dashboards.
Required dashboard architecture:

Operator Dashboard
Track:

agent status
executions
failures
logs
API usage
token usage
cost monitoring
webhook health
system health

Producer Dashboard (REQUIRED NOW)
We have 5 producers.
Required functionality:

My Leads
My Renewals
My Follow‑Ups
My Appointments
My Tasks
Pipeline View
Conversations
Performance Metrics
AI Recommendations
Needs Attention Queue

Future Architecture Preparation
Prepare support for:
Super Admin Panel Agency Admin Panel
Do NOT fully build these yet.
Design foundation correctly.
━━━━━━━━━━━━━━━━━━━━━━ PHASE 5 — AGENT FRAMEWORK ━━━━━━━━━━━━━━━━━━━━━━
After foundation layer is complete:
Build reusable agent framework.
Every future agent must support:

LLM assignment
fallback model rules
logging
cost governance
retry logic
dependency handling
security rules
environment handling
testing
controlled pilot
production go‑live
rollback path Mandatory. ━━━━━━━━━━━━━━━━━━━━━━ PHASE 6 — AGENT BUILD ORDER ━━━━━━━━━━━━━━━━━━━━━━ After infrastructure completion: Agent 1 — Routing Agent Agent 2 — CRM Handoff Agent Continue chain afterward. Do NOT jump ahead before foundation is stable.
I have to start work on phase 2 database layer. For that I have to understand ghl api  correctly and also for the future integrations to make solid architecture decision.

Show more
Jun 2
Smart move. Before locking the database schema, understanding GHL's data model is the right call — because how GHL structures its objects directly affects your foreign keys, sync strategy, and integration layer design.

Let me pull current GHL API documentation for you.


Searched the web
Searched the web
Good. I now have a solid picture of GHL's actual API structure. Here's everything you need to make solid Phase 2 database decisions.

GHL API — What You Need to Know for Architecture
1. GHL's Tenant Model (Critical for Your Schema)
GHL has two levels: Company ID (the agency — top-level account that owns sub-accounts) and Location ID (a single sub-account — one per business the agency manages). They are not interchangeable. 
Auto-Respond

What this means for Cain AIOS:

GHL Structure          →    Cain AIOS Mapping
─────────────────────────────────────────────
Company (Agency)       →    agencies table
Location (Sub-account) →    locations or tenants table
Contact                →    leads table
Opportunity            →    pipelines / pipeline_stages
Conversation           →    conversations table
Appointment            →    appointments table
You need both ghl_company_id and ghl_location_id stored at the right levels in your schema.

2. GHL's Core Data Objects
GHL's model is contact-centric. The standard entities are Contacts, Companies, Opportunities (inside Pipelines), and as of October 2025, Custom Objects. Each opportunity must be linked to a Contact — you cannot have orphan opportunities. 
ClonePartner

The primary API objects relevant to your build are: Contacts, Calendars/Appointments, Campaigns, Opportunities, and Pipelines. They support CRUD, client-side validation, idempotency keys, and deduplication. 
Dammy Ade

3. Authentication Model (Critical for Multi-Tenant)
GHL OAuth API offers two access types: Location Level Access (Sub-Account) and Agency Level Access (Company). Location Level Access performs operations specific to a sub-account, while Agency Level Access manages data across the entire agency. 
gohighlevel

Current limitation you must know:

There is currently no true unified agency-level API key that accesses sub-account data directly. You are currently forced to create and manage per-location tokens, which means your integration layer must store and rotate tokens per location/sub-account. 
HighLevel

This directly impacts your api_credentials or settings table design — you cannot just store one GHL token globally.

4. Rate Limits
GHL enforces 100 requests per 10 seconds and 200,000 requests per day per app per Location. Contacts are returned in pages of up to 100 records via cursor-based pagination. 
LobeHub

This means your api_usage table needs to track per-location usage, not just global usage.

5. Webhooks
GHL v2 supports granular webhook and lifecycle events at the sub-account level. It provides richer scheduling endpoints and agency-level patterns for multi-tenant auth. 
Elite Voice Agents

Your webhook intake table needs a location_id column to route incoming events to the correct tenant context.

6. V1 is Dead
V1 APIs have reached end-of-support. Existing connections will continue to work but no support is provided. Going forward, the ability to generate new API keys is being removed from both Agency and Sub-account settings. 
gohighlevel

Build V2 OAuth only. No V1 dependencies anywhere in the schema or integration layer.

Schema Impact Summary — Phase 2 Decisions
Decision	Driven By
agencies table needs ghl_company_id	GHL Company = Agency mapping
locations or tenant-level table needs ghl_location_id	Every API call is location-scoped
leads table needs ghl_contact_id	Contact-centric model
pipelines needs ghl_pipeline_id + ghl_stage_id	Opportunity sync
api_credentials must be per-location	No unified agency token exists
api_usage must track per-location rate limits	200k/day per location limit
webhooks intake needs ghl_location_id routing	Events are location-scoped
conversations needs ghl_conversation_id	Conversation sync
appointments needs ghl_appointment_id	Calendar sync
One Clarifying Question Before Schema Design
This is the most important architectural question for Phase 2:

Does each producer operate inside their own GHL Location (sub-account), or do all 5 producers share one GHL Location with contact ownership tracked by tags/custom fields?

This single answer determines whether your schema needs a locations table between agencies and users, or whether producer-to-lead mapping is handled entirely inside Cain AIOS with a single GHL location token.

Suggest database models in prisma for this architecture. Remember in the future their could be more integrations other then ghl like hubspot.

12:06 AM
Smart constraint to build for now. Let me design this properly before writing a single line of Prisma.


Check for any relevant skills
Check for any relevant skills
Good. No Prisma-specific skill needed — let me design this from architecture principles. Let me think through the full model before writing.


Created a file, read a file
Created a file, read a file
Here's the architecture reasoning behind the key decisions:

Key Design Decisions Explained
1. Integration-Agnostic Layer (Most Important)
Two tables do all the heavy lifting for multi-provider support:

IntegrationConnection — one row per provider per location. The externalIds field is Json so GHL stores { companyId, locationId } and HubSpot stores { portalId, accountId } without any schema change.

ExternalRef — maps every Cain AIOS record to its external counterpart. A lead can have a GHL ref AND a HubSpot ref simultaneously. When you swap providers, you delete refs and create new ones. Your core leads table never changes.

leads.id → ExternalRef(provider: GHL,     externalId: "ghl_contact_xxx")
leads.id → ExternalRef(provider: HUBSPOT, externalId: "hs_contact_yyy")
2. Tenant Hierarchy
Agency → Location → User
This maps to GHL today (Company → Sub-account) and any future CRM. The locationId is nullable on User — Agency Admins and Super Admins sit above any location.

3. No GHL IDs in Core Tables
There are zero ghl_* columns on leads, appointments, pipelines, etc. All external IDs live in ExternalRef. This is what makes the schema portable.

4. Agent Framework Ready
AgentDefinition holds the 35-agent registry with LLM assignment, fallback model, cost governance, retry config, and deployment environment per agent. AgentRun tracks every execution with full cost, token, and duration data. parentRunId supports chained agent workflows.

5. API Usage Per Connection
ApiUsage tracks usage per IntegrationConnection, not globally. This correctly enforces GHL's 200k/day per location limit and will work the same way for HubSpot's per-portal limits or Salesforce API call limits.

One Open Question
Before Phase 3 (GHL Integration Foundation), I need your answer to the question from earlier:

Do your 5 producers each operate in their own GHL Location (sub-account), or do all 5 share one GHL Location?

This determines whether IntegrationConnection has 1 row or 5 rows for GHL, and how the ExternalRef location scoping works in the sync layer.


Cain ios schema
PRISMA 
Do we need to design every table from start. Their could be some unexpected changes later like when building webhook_tracking. We could add that table later. Or do we need copy leads from go high level? We can use its api just to populate data in the dashboard.

12:21 AM
This is exactly the right question to ask before writing more schema. You're identifying a core architectural philosophy decision.

The Real Question
Are you building a data warehouse or an operational layer?

These are two very different things with very different schema implications.

Option A — Full Mirror (What the schema currently leans toward)
Copy everything from GHL into Supabase. Leads, conversations, appointments — all replicated locally.

Pros: Fast dashboards, works offline, full query control, no GHL rate limits on reads Cons: Sync complexity, data drift, stale data problems, more tables to maintain, you're now responsible for GHL's data integrity

Option B — Thin Operational Layer (Likely what you actually need right now)
Supabase holds only what Cain AIOS owns. GHL data is fetched via API when needed and cached lightly.

Pros: Far simpler schema, no sync headaches, GHL is always the source of truth for CRM data, faster to build Cons: Dashboard depends on GHL API being up, rate limits matter more, slower cold loads

My Honest Recommendation
Start thin. Own only what you must own.

Here is what Cain AIOS genuinely needs to own in the database:

Table	Own It?	Reason
agencies	Yes	Your tenant structure
locations	Yes	Your tenant structure
users	Yes	Auth and RBAC is yours
agent_definitions	Yes	Your AI framework
agent_runs	Yes	You need full AI audit trail
audit_logs	Yes	Security and compliance
integration_connections	Yes	Auth tokens live here
settings	Yes	Config is yours
billing	Yes	Stripe is yours
pipelines	Lightweight	Just enough for dashboard routing
tasks	Yes	Tasks may be Cain-native, not GHL
renewals	Yes	Likely not in GHL at all
leads	Thin ref only	GHL owns the contact, you store assignment + status
conversations	API fetch	GHL owns this entirely
appointments	API fetch	GHL owns this entirely
webhook_logs	Add later	Only needed when webhooks are live
external_refs	Yes but simpler	Just the ID mapping
api_usage	Add later	Only needed when rate limits become a real problem
What This Means Practically
For the Producer Dashboard you listed — My Leads, My Appointments, My Renewals, My Tasks — the data strategy becomes:

My Leads        → fetch from GHL API, cache in memory or Redis
My Appointments → fetch from GHL API directly
My Renewals     → live in Supabase (Cain owns this)
My Tasks        → live in Supabase (Cain owns this)
My Pipeline     → GHL API with local stage config
Conversations   → GHL API directly
You only replicate to Supabase when you need to enrich, relate, or own data that GHL cannot hold — like AI recommendations, renewal tracking, agent outputs, and producer-specific metadata.

Revised Build Order for Schema
Phase 2a — Build now (foundation is stable):

agencies, locations, users, user_permissions
integration_connections, external_refs
agent_definitions, agent_runs
audit_logs, settings, billing
tasks, renewals
Phase 2b — Build when GHL integration is live:

webhook_logs — once webhooks are actually receiving events
api_usage — once rate limits need active management
pipelines / pipeline_stages — only if you need local pipeline config
Phase 2c — Decide with data:

leads local mirror — only if dashboard performance requires it
conversations — almost certainly never, GHL owns this permanently
appointments — only if you need cross-location calendar logic GHL can't provide
Bottom Line
You do not need to design every table from the start. The schema I gave you is the complete future-state picture — useful as a reference map. But the build order should be thin-first, add tables only when a real requirement forces it, not in anticipation of one.

Do you want me to produce a revised lean schema with only Phase 2a tables, so what goes into your repo now is exactly what you need and nothing more?

Design Cain AIOS as the operational intelligence layer with a platform-agnostic integration architecture. GHL is V1 and first-class supported. Future connectors may include HubSpot, Zoho, Salesforce, AgencyZoom, EZLynx, and others. Do not build a separate CRM today, but do not hard-wire the database schema exclusively to GHL.

Design the schema so we can add and own our own data later. For V1, do not duplicate and store GHL data unless it is required for functionality, reporting, analytics,AI recommendations, auditing, or features we are building on top of it.
Build the integration layer platform-agnostic, but keep GHL as the first supported integration.

12:58 AM
Perfect. This is the right architectural directive. Let me design this properly.


Created 6 files, ran a command, read a file
Created 6 files, ran a command, read a file
Six files delivered. Here is the summary of what was built and why.

What Changed From the Previous Schema
The ContactRef Decision
The previous schema had a full leads table that duplicated GHL contact data. This schema replaces it with ContactRef — a thin ownership record.

GHL owns: name, email, phone, company, tags, pipeline position.
Cain AIOS owns: producer assignment, AI score, attention flags, qualification data from Cain Front, links to Tasks and Renewals.

When you build your own CRM layer later, ContactRef becomes the foundation you extend. Nothing gets replaced.

The ExternalRef Contract
Every external ID — GHL contact ID, HubSpot deal ID, Salesforce lead ID — lives in one table. Zero GHL-specific columns exist on any domain table. Adding HubSpot tomorrow is a new enum value, a new IntegrationConnection row, and new ExternalRef rows. No migrations on core tables.

Deferred vs Commented
Tables that are not needed yet are handled in two ways. WebhookEvent and PipelineConfig are in the schema files but clearly marked — add when the feature is live. ApiUsage is commented out inside 05_audit.prisma — uncomment when rate limits need active management. Nothing is forgotten, nothing is premature.

One Question Before Phase 3
The IntegrationConnection table supports both agency-level and location-level GHL tokens. To build the GHL auth flow correctly in Phase 3, I need to know:

Are your 5 producers each operating in their own GHL sub-account (Location), or do they all share one GHL sub-account with contact ownership tracked inside it?

This determines whether you need 1 or 5 IntegrationConnection rows for GHL, and how the ExternalRef.locationRef field gets populated during contact sync.


Architecture decisions
Document · MD 

01 core
PRISMA 

02 integration
PRISMA 

03 operational
PRISMA 

04 agents
PRISMA 

05 audit
PRISMA 
Currently we are building for sub account only. Regarding agency account we can add that later. But I think logic will be same. But we will be able to access more ghl data based on the tokens etc.

1:06 AM
Perfect. That's a clean and correct assumption. Let me confirm the architectural implication so it's documented before Phase 3.

What This Means for the Schema
V1 scope: One GHL sub-account (Location). One IntegrationConnection row with a Location-level token.

IntegrationConnection {
  provider: GHL
  locationId: <cain_location_id>
  externalIds: { "locationId": "<ghl_location_id>" }
  accessToken: <encrypted location token>
}
When agency-level is added later: You add a second IntegrationConnection row for the same agency with locationId: null and externalIds: { "companyId": "..." }. The logic in your integration service checks which token to use based on what the API call requires. No schema change needed — the table already supports both patterns.

The Access Difference (Important for Phase 3 Planning)
What You Need	Token Required
Contacts, opportunities, appointments, conversations	Location token
Create/manage sub-accounts	Agency (Company) token
Billing, snapshot management	Agency token
White-label config	Agency token
For everything you are building in V1 — producer dashboard, lead management, renewals, appointments — the Location token covers 100% of it. Agency token is a future unlock, not a blocker.

One Thing to Lock Before Phase 3
Your IntegrationConnection currently stores one Location token per row. GHL Location tokens via OAuth can expire and need refresh. Your Phase 3 integration foundation needs to decide:

Are you using GHL Private Integration tokens (long-lived, no refresh needed) or OAuth 2.0 (short-lived, requires refresh flow)?

Private Integration = simpler to start, no refresh logic, but not suitable if you ever go multi-agency or marketplace.
OAuth 2.0 = more setup now, correct long-term for SaaS and white-label.

Given your white-label and multi-agency direction, OAuth 2.0 is the right call — but state your decision and I will design the Phase 3 integration foundation around it correctly.

Why do we need locations in our database? I don't think so we need it not all crms like hubspot or salesforce or ghl going to have locations?

1:08 AM
Correct challenge. Let me think through this properly.

You Are Right — With One Nuance
The Location model was added because GHL uses it. That is exactly the kind of GHL-specific thinking that should not leak into the core schema.

HubSpot has no locations. Salesforce has no locations. Zoho has no locations. AgencyZoom has no locations.

What Location Was Actually Solving
Before removing it, identify what it was genuinely doing:

Purpose	Still Needed?	Better Solution
Multi-tenant isolation below Agency	Yes	This is just Agency itself in most cases
GHL sub-account mapping	Yes	ExternalRef handles this
Scoping users, tasks, renewals to an operational unit	Maybe	Depends on your actual business structure
Future multi-office / multi-team support	Maybe	Can be added later if needed
The Real Question
Does your business model have a concept below Agency that is not CRM-specific?

Two scenarios:

Scenario A — One agency, one team, one operation

Agency (Sandsgroup)
  └── Users (5 producers + staff)
  └── Tasks, Renewals, ContactRefs
No Location needed. Everything hangs off Agency directly.

Scenario B — One agency, multiple offices or teams

Agency (Sandsgroup)
  └── Team / Office (Chicago)
  └── Team / Office (Dallas)
Then you need something below Agency — but that is a business unit, not a Location. Name it correctly.

My Recommendation
Remove Location from the schema entirely for V1.

Replace every locationId foreign key with agencyId. The GHL sub-account ID gets handled the same way everything else does — via ExternalRef.

If you need a sub-agency grouping later for multi-office or multi-team, add a Team or BusinessUnit model at that point with a name that reflects your actual business concept, not a CRM concept.

What Changes in the Schema
Before                          After
──────────────────────────────────────────────
ContactRef.locationId     →     ContactRef.agencyId
Task.locationId           →     Task.agencyId
Renewal.locationId        →     Renewal.agencyId
AgentRun.locationId       →     AgentRun.agencyId
IntegrationConnection     →     locationId column removed
  .locationId (nullable)        agency-level only for V1
AuditLog.locationId       →     removed
User.locationId           →     removed
IntegrationConnection.externalIds already handles the GHL locationId mapping:

json
{ "locationId": "ghl_xyz" }
Do you want me to produce the revised schema with Location removed and everything scoped directly to Agency? That will be the clean V1 foundation before Phase 3 starts.

I think we can add in future even if needed. Like user role can connect his own ghl sub account under agency account. Or agency user can add new users and assign locations to them. what do you think?

1:09 AM
That is actually a strong use case. Let me think through it clearly.

The Case For Keeping Location
You just described a real product feature, not a CRM concept:

Agency (Sandsgroup)
  └── Location (Chicago Office)
        └── Producer A — connected to GHL sub-account X
  └── Location (Dallas Office)
        └── Producer B — connected to GHL sub-account Y
Or even simpler for V1:

Agency (Sandsgroup)
  └── Location (Main)
        └── All 5 producers
        └── One GHL sub-account
This is a multi-tenancy feature disguised as a CRM concept. The fact that GHL also calls things "locations" is coincidental.

What Validates Keeping It
User connects their own GHL sub-account — this only makes sense if there is a container below Agency to attach it to. That container is Location.

Agency Admin assigns users to locations — this is RBAC at the location level. A producer in Chicago should not see Dallas leads. That boundary needs a model.

Future SaaS expansion — when you onboard a new agency, they may have multiple offices, teams, or franchises. Location is the correct abstraction.

The One Change to Make
Rename it mentally. Location in Cain AIOS means operational unit under an agency — not a GHL location. The fact that it maps to a GHL sub-account is handled by ExternalRef, not by the model name.

The model stays. The GHL coupling does not.

Cain AIOS Location  ──→  ExternalRef(provider: GHL, entity: "location")
                   ──→  ExternalRef(provider: HUBSPOT, entity: "portal")
                   ──→  ExternalRef(provider: SALESFORCE, entity: "org")
What This Means Practically
Scenario	How It Works
V1 — one agency, one location, one GHL sub-account	One Location row, one IntegrationConnection, simple
Producer connects own GHL sub-account	New IntegrationConnection scoped to their Location
Agency adds Dallas office	New Location row, new IntegrationConnection for that GHL sub-account
HubSpot added later	New IntegrationConnection on same Location, ExternalRef maps portal ID
User assigned to location	User.locationId set by Agency Admin
Verdict
Keep Location. It is a valid Cain AIOS concept. Just ensure the codebase never refers to it as "GHL Location" — it is an operational unit that can connect to any provider.

The schema as delivered in 01_core.prisma and 02_integration.prisma already handles this correctly. IntegrationConnection has locationId nullable for V1 where everything is at agency level, and populated when a specific location gets its own CRM connection.

Ready to move to Phase 3 GHL Integration Foundation whenever you are.

lets change location name to something else.

1:18 AM
Good call. What should it represent in your business language?

A few options based on what you described:

Name	Best If
Workspace	It is an operational container — neutral, SaaS-friendly
Branch	Your agencies have physical offices or regional teams
Team	It is more about people grouping than geography
Account	Each unit is a billable or manageable client account
Division	Larger enterprise structure with departments
Unit	Generic, flexible, no implied structure
Given your context — insurance agency, producers, multi-office SaaS direction, white-label — Workspace fits best. It is:

Not CRM-specific
Understood immediately in a SaaS product
Works for "Agency Admin creates a Workspace and assigns producers to it"
Works for "Producer connects their GHL sub-account to their Workspace"
Scales cleanly to white-label clients
But this is your platform name — what feels right to you?

whats the difference between external ref and contact ref?

2:05 AM
Good question. They solve completely different problems.

ExternalRef
Purpose: ID mapping between Cain AIOS and an external system.

It answers one question: "What is this Cain AIOS record called in GHL?"

ExternalRef {
  provider:   GHL
  entity:     "contact"
  localId:    "cain_clx123"      ← Cain AIOS ID
  externalId: "ghl_contact_abc"  ← GHL's ID
}
It holds no business data. It is purely a lookup table. Every entity type uses it — contacts, appointments, pipelines, conversations. It is infrastructure, not business logic.

ContactRef
Purpose: Cain AIOS's ownership and intelligence record for a contact.

It answers: "What does Cain AIOS know and own about this person?"

ContactRef {
  id:              "cain_clx123"
  assignedToId:    "producer_jane"    ← who owns this contact
  aiScore:         87                 ← Cain-generated
  needsAttention:  true               ← Cain-generated
  qualificationData: { ... }          ← captured by Cain Front
  cainStatus:      "RENEWAL_DUE"      ← Cain-specific status
}
It holds no contact details. No name, no email, no phone. Those live in GHL and are fetched via API.

How They Work Together
ContactRef.id  ──→  ExternalRef  ──→  GHL Contact ID  ──→  GHL API
(Cain owns)         (ID bridge)        (GHL owns)           (fetch details)
When a producer opens a contact in the dashboard:

Load ContactRef — get assignment, AI score, tasks, renewals
Look up ExternalRef — get the GHL contact ID
Call GHL API with that ID — get name, email, phone, conversations
One Line Summary
ExternalRef — knows where the record lives externally. ContactRef — knows what Cain AIOS thinks and owns about that record.

What are renewals?

2:51 AM
Renewals are specific to the insurance industry.

What a Renewal Is
In insurance, a policy does not last forever. Every policy has an expiration date — typically annual. When that date approaches, the client needs to renew their policy for another term.

Client (John Smith)
  └── Auto Policy — expires December 1, 2026
  └── Home Policy — expires March 15, 2027
A producer's job is to contact John before each expiration date, re-quote if needed, and retain him as a client. That process is called a renewal.

Why It Is a First-Class Cain AIOS Entity
No CRM has a native renewal concept that matches what an insurance agency actually needs. GHL, HubSpot, Salesforce — none of them understand:

Policy numbers
Carriers
Lines of business (Auto, Home, Life, Commercial)
Renewal dates driving producer workflow
Retention scoring
So Cain AIOS owns this entirely. It is not synced from GHL. It lives natively in your database.

What It Drives in the Dashboard
The Renewal table is what powers:

Producer Dashboard
  └── My Renewals        ← all renewals assigned to this producer
  └── Needs Attention    ← renewals expiring soon with no contact made
  └── AI Recommendations ← retention score, suggested action
A renewal with renewalDate 30 days out and no recent activity is exactly the kind of thing Cain Core flags and surfaces to the producer automatically.

In Short
Renewals are the core revenue retention mechanism of an insurance agency. They are why your producers log in every day.

The are needed for now.

2:51 AM
Confirmed. Renewals stay as a first-class Cain AIOS entity.

To summarise what is locked for the Phase 2 schema before we move forward:

Schema Decisions Locked
Decision	Status
Location renamed to Workspace	Pending your name confirmation
ContactRef — thin ownership layer, no contact details	Locked
ExternalRef — ID bridge to all external providers	Locked
Renewals — first-class Cain AIOS entity	Locked
Tasks — Cain AIOS native, not synced from GHL	Locked
IntegrationConnection — provider-agnostic, GHL first	Locked
No full contacts/leads table in V1	Locked
WebhookEvent — add in Phase 3 when webhooks are live	Locked
ApiUsage — deferred, add when rate limits need management	Locked
V1 scope — sub-account only, agency-level token later	Locked
GHL OAuth 2.0 — not Private Integration tokens	Pending your confirmation
Two Open Items Before Schema is Final
1. Location rename — is Workspace the right name or do you want something else?

2. OAuth vs Private Integration token — for GHL auth in Phase 3, are you going with OAuth 2.0 or GHL Private Integration tokens to start?

Once these two are confirmed I can produce the final clean revised schema and we move to Phase 3.

renewals , tasks are not needed for now

2:51 AM
Got it. Removing both.

Updated locked decisions:

Schema — What Cain AIOS Owns in V1
Table	In V1
Agency	Yes
Workspace (renamed Location)	Yes — pending name confirmation
User + UserPermission	Yes
Settings	Yes
Billing	Yes
IntegrationConnection	Yes
ExternalRef	Yes
IntegrationSyncLog	Yes
ContactRef	Yes
AgentDefinition	Yes
AgentRun	Yes
AgentCostSummary	Yes
AuditLog	Yes
Renewals	Deferred
Tasks	Deferred
WebhookEvent	Deferred — Phase 3
PipelineConfig	Deferred — Phase 3
ApiUsage	Deferred
This is a clean, lean foundation. Nothing speculative, nothing premature.

Still two open items:

1. What do you want to call Workspace?

2. GHL auth — OAuth 2.0 or Private Integration tokens for V1?

ContactRef doesn't have fields like name or email etc, only custom fields in json but when creating reporting how do we filter these records? And their should not be global custom fields settings?

3:01 AM
Excellent catch. Two real problems identified.

Problem 1 — Filtering Without Indexed Fields
You are right. If producer wants to see:

All contacts where carrier = "State Farm"
All contacts where line of business = "Auto"
All contacts where state = "Texas"
And all of that lives in qualificationData Json — you cannot index it, cannot filter efficiently, cannot build reliable reports on it.

Problem 2 — No Custom Field Definitions
Right now custom fields are a free-form Json blob. That means:

No validation on what gets stored
No consistency across records
No way to know what fields exist
No way to build filter UI in the dashboard
Producer A stores { "carrier": "State Farm" }, Producer B stores { "Carrier": "statefarm" } — same data, unqueryable together
The Solution — Two Parts
Part 1 — Promote Frequently Filtered Fields
Fields you will always need to filter, report, or sort on should be real columns on ContactRef, not buried in Json.

The key is identifying which fields are universal across all agencies versus agency-specific.

Universal fields that belong as real columns:

firstName     String
lastName      String
email         String?
phone         String?
state         String?   // for geographic filtering
timezone      String?
source        String    // CAIN_FRONT, MANUAL, IMPORT
These are safe because every agency regardless of industry will use them.

Part 2 — Custom Field Definitions Table
Instead of a free Json blob, agencies define their fields first. Then contacts store values against those definitions.

AgencyCustomFieldDef {
  id
  agencyId
  entity      // "contact", "renewal" — reusable across entities later
  label       // "Carrier"
  key         // "carrier" — slugified, used as Json key
  fieldType   // TEXT, NUMBER, DATE, SELECT, BOOLEAN
  options     // ["State Farm", "Allstate"] — for SELECT type
  isRequired  Boolean
  isFilterable Boolean  // tells dashboard to expose this as a filter
  order       Int       // display order
}
Then ContactRef.customFields Json becomes structured and validated at the application layer before storage:

json
{
  "carrier": "State Farm",
  "line_of_business": "Auto",
  "policy_number": "SF-123456"
}
Now you can:

Validate against the definition before saving
Build filter UI dynamically from definitions
Know exactly what fields exist and their types
Add PostgreSQL GIN index on customFields for Json querying
What the Reporting Query Looks Like
With this approach filtering works two ways:

On promoted columns — fast, indexed, simple:

sql
SELECT * FROM contact_refs
WHERE agency_id = 'x'
AND state = 'Texas'
On custom fields — using GIN index on Json:

sql
SELECT * FROM contact_refs
WHERE agency_id = 'x'
AND custom_fields->>'carrier' = 'State Farm'
Combined:

sql
WHERE state = 'Texas'
AND custom_fields->>'carrier' = 'State Farm'
AND custom_fields->>'line_of_business' = 'Auto'
Revised ContactRef Structure
ContactRef {
  // Promoted — always columns, always indexed
  firstName
  lastName
  email
  phone
  state
  source

  // Cain AIOS intelligence — always columns
  assignedToId
  cainStatus
  aiScore
  needsAttention
  aiRecommendation

  // Agency-defined — structured Json, validated against CustomFieldDef
  customFields Json
}
One Question Before Finalising
Who defines custom fields — Agency Admin only, or can individual producers add their own?

This determines whether AgencyCustomFieldDef scopes to agencyId only, or also needs a createdById and visibility setting.

how contactRef and externalRef are connected with each other?

3:42 AM
Good question. They are not directly connected via a foreign key. They connect by convention through localId.

How the Connection Works
ContactRef.id  ←──────────────────── ExternalRef.localId
                    (same value)
ExternalRef has no foreign key pointing to ContactRef. Instead it has:

entity:   "contact"
localId:  "clx123"   ← this is ContactRef.id
So to find the GHL ID for a contact:

ts
const externalRef = await prisma.externalRef.findUnique({
  where: {
    provider_entity_localId: {
      provider: 'GHL',
      entity:   'contact',
      localId:  contactRef.id
    }
  }
})

// externalRef.externalId = GHL contact ID
Why No Direct Foreign Key
Because ExternalRef is designed to map any Cain AIOS entity — not just contacts.

ExternalRef { entity: "contact",      localId: contactRef.id    }
ExternalRef { entity: "appointment",  localId: appointmentId    }
ExternalRef { entity: "pipeline",     localId: pipelineId       }
ExternalRef { entity: "conversation", localId: conversationId   }
If it had a direct contactRefId foreign key, you would need a separate ref table for every entity type. One table handles everything.

The Full Picture
ContactRef                ExternalRef                    GHL API
──────────────            ───────────────────────        ────────────
id: "clx123"    ────→     entity:     "contact"   ────→  fetch contact
firstName: ?              localId:    "clx123"            by externalId
aiScore: 87               provider:   GHL
assignedTo: Jane          externalId: "ghl_abc"
Cain AIOS owns the left side. GHL owns the right side. ExternalRef is the bridge.

I don't think so we need externalRef, PipelineConfig or ContactRef until we start building our own crm we need a table to store ghl data but only if required by agents to perform some actions. So maybe we can use external ref for that?

3:51 AM
Correct thinking. Let me break this down clearly.

What You Are Actually Saying
For V1 Cain AIOS is not a CRM. It is an intelligence and operator layer sitting on top of GHL. It does not need to mirror GHL data. It needs to:

Know which GHL account is connected
Run agents that call GHL API when needed
Store agent outputs and recommendations
Track what agents did for audit purposes
That is it.

What This Means for the Three Tables
ExternalRef — Keep, but simpler purpose
You are right that it is not needed for CRM mirroring. But it is still useful for one specific case:

When an agent acts on a GHL record, Cain AIOS needs to remember what it did to it.

Agent runs → creates a GHL opportunity → stores that GHL opportunity ID
Agent runs again → finds the same opportunity → updates it instead of creating duplicate
Without some form of ID storage, agents would create duplicate records in GHL on every run. So ExternalRef stays but its purpose changes from "CRM sync" to "agent action memory."

ContactRef — Remove for V1
You are right. Without a CRM layer there is no reason to maintain a shadow contact record. Agents fetch contact data from GHL API directly when they need it. Nothing to store locally until you build your own CRM.

PipelineConfig — Remove for V1
Same reasoning. Pipeline structure lives in GHL. Agents query it via API. No local config needed until webhook routing requires it in Phase 3.

Revised V1 Schema — What Actually Stays
Core
  Agency
  Workspace
  User + UserPermission
  AgencySetting + WorkspaceSetting
  AgencyBilling

Integration
  IntegrationConnection    ← GHL auth and credentials
  IntegrationSyncLog       ← audit of sync operations

Agent Framework
  AgentDefinition          ← 35-agent registry
  AgentRun                 ← every execution tracked
  AgentCostSummary         ← daily cost rollup

Agent Action Memory
  ExternalRef              ← only what agents touched in GHL

Audit
  AuditLog
What Gets Deferred
ContactRef       → when building own CRM
PipelineConfig   → when webhook routing needs it
WebhookEvent     → Phase 3
Tasks            → confirmed deferred
Renewals         → confirmed deferred
ApiUsage         → when rate limits need management
One Clarifying Question
For ExternalRef as agent action memory — do agents need to remember only contacts they acted on, or potentially any GHL entity (opportunities, appointments, conversations)?

This determines whether ExternalRef stays generic with an entity field, or becomes a simpler AgentActionRef table scoped specifically to agent operations.

We don't have AgentActionRef table?

3:52 AM
Correct — it does not exist yet. I was suggesting it as a potential replacement for ExternalRef with a narrower, clearer purpose.

The Choice
Option A — Keep ExternalRef as is

Generic. Maps any Cain AIOS concept to any external provider. Works for agent action memory too.

ExternalRef {
  provider:   GHL
  entity:     "contact"
  localId:    agentRun.id    ← the run that touched this record
  externalId: "ghl_contact_abc"
}
Flexible but slightly overengineered for V1 if the only use case is agent memory.

Option B — Replace with AgentActionRef

Simpler. Scoped specifically to what agents did in external systems.

AgentActionRef {
  agentRunId:  "run_xyz"
  provider:    GHL
  entity:      "contact"
  externalId:  "ghl_contact_abc"
  action:      "CREATED" | "UPDATED" | "READ"
}
Clearer intent. Every row answers: "Agent run X touched GHL record Y."

My Recommendation
Option B — AgentActionRef for V1.

Reasons:

You have no CRM layer yet so ExternalRef has no other job
Agent action tracking is a real V1 requirement
Clearer name tells any developer exactly what the table is for
When you build your own CRM later, add ExternalRef back properly
Shall I go with AgentActionRef and produce the final clean V1 schema with all confirmed decisions applied?


generator client { provider = "prisma-client-js" output = "../generated/client" } datasource db { provider = "postgresql" } // ============================================================================= // 01_CORE.PRISMA — Tenant Hierarchy, RBAC, Auth // ===================================

pasted

Based on this schema record its documentation md file and architecture decision md file

4:11 AM
Claude's response was interrupted.

generator client { provider = "prisma-client-js" output = "../generated/client" } datasource db { provider = "postgresql" } // ============================================================================= // 01_CORE.PRISMA — Tenant Hierarchy, RBAC, Auth // ===================================

pasted

Based on this schema record its documentation md file and architecture decision md file

4:12 AM
I'll create two documents based on your finalized schema: a reference documentation file and an architecture decision record.


Created 2 files, read a file
Created 2 files, read a file
Both documents are ready, written to match the schema you pasted.

SCHEMA_DOCUMENTATION.md is the developer reference. It walks every model field by field across the four sections (Core, Integration, Agents, Audit), lists all constraints and indexes, has a full enum reference table, and includes common query patterns for the things developers will reach for first — resolving a record to its GHL ID via ExternalRef, finding the active connection for a workspace, and pulling the retry queue.

ARCHITECTURE_DECISIONS.md captures the reasoning from our whole conversation as a decision record. It documents the eleven key decisions including the Location-to-Workspace rename, why there's no local contacts table in V1, ExternalRef's narrowed purpose as agent action memory, and the deferral of ContactRef, PipelineConfig, Tasks, and Renewals. It also carries forward the two open items into Phase 3.

Two things worth flagging, since the documents reflect the schema exactly as written rather than silently correcting it:

The schema as pasted still has ExternalRef and WebhookEvent defined with entity comments referencing "lead" and "task", and ApiUsage is now uncommented and active (it was previously commented out). I documented all three as present and active. If your intent was to keep ApiUsage deferred, it's currently a live table in this version — worth a quick confirm.

The other open item is the one genuinely unresolved decision from our thread: GHL auth — OAuth 2.0 or Private Integration tokens? I recommended OAuth 2.0 given your white-label and multi-agency direction. Lock that and Phase 3 can be built around it cleanly.


Schema documentation
Document · MD 

Architecture decisions
Document · MD 





Claude is AI and can make mistakes. Please double-check responses.


raw
Schema documentation · MD
# Cain AIOS — Database Schema Documentation
 
Phase 2 Foundation. Stack: PostgreSQL via Supabase, ORM: Prisma.
 
This document describes the schema as built. It is a reference for developers working against the database. For the reasoning behind each decision, see ARCHITECTURE_DECISIONS.md.
 
---
 
## Overview
 
The schema is organized into four logical sections within a single Prisma file.
 
```
01 Core           Tenant hierarchy, RBAC, settings, billing
02 Integration    Platform-agnostic connection layer, external ID mapping
03 Agents         Agent registry, execution records, cost rollups
04 Audit          Immutable audit trail, API usage tracking
```
 
The tenant hierarchy is two levels: Agency contains Workspaces, Workspaces contain Users. Everything else hangs off one of these three.
 
```
Agency
  └── Workspace
        └── User
```
 
---
 
## Section 1 — Core
 
### Agency
 
Top of the tenant tree. One Agency equals one business operating on Cain AIOS. White-label agencies carry their own domain and branding fields.
 
| Field | Type | Notes |
|---|---|---|
| id | String | cuid primary key |
| name | String | Display name |
| slug | String | Unique URL-safe identifier |
| plan | BillingPlan | Defaults to STARTER |
| isWhiteLabel | Boolean | Enables custom domain and branding |
| whiteLabelDomain | String? | Custom domain when white-labeled |
| logoUrl | String? | Branding asset |
| primaryColor | String? | Branding color |
| isActive | Boolean | Soft activation flag |
| trialEndsAt | DateTime? | Trial expiry |
 
Relations: workspaces, users, billing, settings, auditLogs, integrations.
 
### Workspace
 
Operational unit under an Agency. Maps to a GHL sub-account today, and to a HubSpot Portal, Zoho Org, or Salesforce Org in the future. In a single-agency setup this can be one-to-one with Agency. A Workspace is the container a CRM connection attaches to and the boundary that scopes user visibility.
 
| Field | Type | Notes |
|---|---|---|
| id | String | cuid primary key |
| agencyId | String | Parent agency |
| name | String | Display name |
| slug | String | URL-safe identifier, unique within agency |
| timezone | String | Defaults to UTC |
| isActive | Boolean | Soft activation flag |
 
Constraint: slug is unique per agency via `@@unique([agencyId, slug])`.
 
Relations: agency, users, settings, integrations, agentRuns, auditLogs.
 
### User
 
Platform user, scoped by role. Workspace is optional: agency-level users such as Agency Admin and Super Admin sit above any single workspace, so their `workspaceId` is null.
 
| Field | Type | Notes |
|---|---|---|
| id | String | cuid primary key |
| agencyId | String | Parent agency |
| workspaceId | String? | Null means agency-wide user |
| email | String | Unique across the platform |
| firstName | String | |
| lastName | String | |
| avatarUrl | String? | |
| role | UserRole | Default policy for access |
| status | UserStatus | Defaults to PENDING_INVITE |
| lastLoginAt | DateTime? | |
 
Relations: agency, workspace, permissions, agentRuns (as trigger), auditLogs.
 
### UserPermission
 
Fine-grained permission overrides layered on top of role defaults. Role sets the default policy, UserPermission is the explicit exception.
 
| Field | Type | Notes |
|---|---|---|
| userId | String | Owner of the override |
| resource | String | e.g. "leads", "reports", "agent_runs" |
| action | String | e.g. "read", "write", "delete", "export" |
| granted | Boolean | Defaults to true |
 
Constraint: one row per user-resource-action via `@@unique([userId, resource, action])`.
 
### AgencySetting and WorkspaceSetting
 
Namespaced key-value config stores. Value is Json so any shape can be stored without a migration. `isSecret` marks values that the application layer encrypts before storage.
 
| Field | Type | Notes |
|---|---|---|
| agencyId / workspaceId | String | Owner |
| namespace | String | e.g. "ai", "notifications", "billing", "branding" |
| key | String | Setting key |
| value | Json | Setting value |
| isSecret | Boolean | Encrypted at app layer when true |
 
Constraint: unique per owner-namespace-key.
 
### AgencyBilling
 
Agency-level billing. Charging happens per agency, not per workspace. Stripe-ready, with seat and feature limits enforced here.
 
| Field | Type | Notes |
|---|---|---|
| agencyId | String | Unique, one billing record per agency |
| plan | BillingPlan | |
| stripeCustomerId | String? | Unique |
| stripeSubscriptionId | String? | Unique |
| currentPeriodStart / End | DateTime? | |
| cancelAtPeriodEnd | Boolean | |
| trialEndsAt | DateTime? | |
| seats | Int | Defaults to 5 |
| maxWorkspaces | Int | Defaults to 1 |
| maxAgents | Int | Defaults to 5 |
 
---
 
## Section 2 — Integration
 
This is the entire surface between Cain AIOS and every external CRM or platform. No core table hard-wires to GHL field names or IDs. All external identity lives here.
 
### IntegrationConnection
 
One row per provider per workspace. Holds auth credentials and provider-specific config. `workspaceId` is nullable because some providers authenticate at the agency level and some per sub-account.
 
| Field | Type | Notes |
|---|---|---|
| agencyId | String | Parent agency |
| workspaceId | String? | Null means agency-level connection |
| provider | IntegrationProvider | GHL, HUBSPOT, ZOHO, etc. |
| status | IntegrationStatus | Defaults to PENDING_AUTH |
| displayName | String? | Human label |
| accessToken | String? | Encrypted at app layer |
| refreshToken | String? | Encrypted at app layer |
| tokenExpiresAt | DateTime? | |
| authScopes | String[] | Granted scopes |
| externalIds | Json? | Provider identity, shape varies by provider |
| metadata | Json? | Plan info, limits, feature flags |
| dailyRequestCount | Int | Rate limit tracking |
| dailyRequestReset | DateTime? | |
| lastSyncAt / lastErrorAt | DateTime? | Health tracking |
| lastErrorMessage | String? | |
| connectedAt | DateTime? | |
 
externalIds shape by provider:
- GHL: `{ "companyId": "...", "workspaceId": "..." }`
- HubSpot: `{ "portalId": "..." }`
- Salesforce: `{ "orgId": "...", "instanceUrl": "..." }`
Constraint: one connection per agency-workspace-provider via `@@unique([agencyId, workspaceId, provider])`.
 
Relations: agency, workspace, syncLogs, webhookEvents, apiUsage.
 
### ExternalRef
 
The portability contract. Maps any Cain AIOS record to its counterpart in any external provider, primarily for agentic references. Lives as a separate table rather than columns on domain tables so the same record can map to multiple providers at once, and so migration from one provider to another never touches core tables.
 
| Field | Type | Notes |
|---|---|---|
| provider | IntegrationProvider | |
| entity | String | "lead", "appointment", "pipeline", "conversation", "task" |
| localId | String | Cain AIOS record cuid |
| externalId | String | Provider native ID |
| workspaceRef | String? | Provider scoping ID. GHL workspaceId, HubSpot portalId |
| metadata | Json? | Extra provider fields |
| lastSyncedAt | DateTime? | |
 
Constraints:
- `@@unique([provider, entity, localId])` — a local record maps to one external ID per provider
- `@@unique([provider, entity, externalId])` — an external ID maps to one local record per provider
### WebhookEvent
 
Raw inbound events from any provider. Append-only, never mutated after creation. Stored raw so processing logic can change and events can be replayed against updated handlers.
 
| Field | Type | Notes |
|---|---|---|
| connectionId | String? | Source integration |
| provider | IntegrationProvider | |
| eventType | String | e.g. "contact.created" |
| workspaceRef | String? | Routes to correct tenant |
| status | WebhookEventStatus | Defaults to RECEIVED |
| rawPayload | Json | Never modified |
| processedAt | DateTime? | |
| processingMs | Int? | |
| error | String? | |
| retryCount | Int | |
| nextRetryAt | DateTime? | |
| providerEventId | String? | Idempotency key |
| receivedAt | DateTime | |
 
Indexes: `[provider, eventType]`, `[workspaceRef]`, `[status, nextRetryAt]` for retry queue queries.
 
### IntegrationSyncLog
 
Audit trail of every pull or push operation. Answers what synced, when, how many records, and what failed.
 
| Field | Type | Notes |
|---|---|---|
| connectionId | String | |
| provider | IntegrationProvider | |
| entity | String | "contacts", "opportunities", "appointments" |
| direction | SyncDirection | PULL, PUSH, BOTH |
| recordsTotal / Created / Updated / Skipped / Failed | Int | Counts |
| errorDetails | Json? | |
| triggeredBy | String? | "scheduler", "webhook", "manual", or userId |
| startedAt / completedAt | DateTime | |
| durationMs | Int? | |
 
---
 
## Section 3 — Agents
 
Every agent in the 35-agent registry runs through this framework. No agent bypasses logging, cost tracking, or the audit trail.
 
### AgentDefinition
 
The registry entry and config for each agent.
 
| Field | Type | Notes |
|---|---|---|
| name | String | Unique, e.g. "routing-agent" |
| displayName | String | |
| description | String? | |
| version | String | Defaults to 1.0.0 |
| isActive | Boolean | Off by default, explicitly enabled |
| isPilot | Boolean | Limited rollout flag |
| primaryModel | String | e.g. "gpt-4o" |
| fallbackModel | String? | Used on primary failure or rate limit |
| maxTokens | Int | Defaults to 1000 |
| temperature | Float | Defaults to 0.3 |
| systemPrompt | String? | |
| maxCostPerRunUsd | Decimal? | Hard limit before execution |
| maxDailyBudgetUsd | Decimal? | Hard daily limit |
| maxRetries | Int | Defaults to 3 |
| retryDelayMs | Int | Defaults to 1000 |
| requiresApproval | Boolean | |
| allowedRoles | UserRole[] | Access control |
| environment | String | "dev", "staging", "production" |
| inputSchema / outputSchema | Json? | JSON Schema validation |
| tags | String[] | |
| metadata | Json? | |
 
Relations: runs.
 
### AgentRun
 
Immutable execution record. Never deleted, never mutated after completion. One row per execution. Chains tracked via parentRunId.
 
| Field | Type | Notes |
|---|---|---|
| agentId | String | |
| workspaceId | String? | Tenant context |
| triggeredById | String? | Null means system or scheduled |
| status | AgentRunStatus | Defaults to QUEUED |
| input / output | Json? | Sanitized, PII stripped before storage |
| error | String? | |
| modelUsed | String? | |
| inputTokens / outputTokens / totalTokens | Int? | |
| costUsd | Decimal? | |
| startedAt / completedAt | DateTime? | |
| durationMs | Int? | |
| retryCount | Int | |
| parentRunId | String? | Spawning run for chains |
| traceId | String? | Shared across a chain |
 
Indexes: `[agentId, status]`, `[workspaceId, createdAt]`, `[traceId]`.
 
### AgentCostSummary
 
Daily rollup per agent per workspace. Powers the Operator Dashboard cost monitoring without scanning agent_runs. Populated by a nightly job or incrementally after each run.
 
| Field | Type | Notes |
|---|---|---|
| agentId | String | |
| workspaceId | String? | |
| date | Date | |
| totalRuns / successRuns / failedRuns | Int | |
| totalTokens | Int | |
| totalCostUsd | Decimal | |
 
Constraint: `@@unique([agentId, workspaceId, date])`.
 
---
 
## Section 4 — Audit
 
### AuditLog
 
One row per auditable event. Append-only, never mutated. Covers both user and system actions.
 
| Field | Type | Notes |
|---|---|---|
| agencyId | String? | |
| workspaceId | String? | |
| userId | String? | Null means system action |
| action | AuditAction | |
| entity | String | Affected table name |
| entityId | String? | Affected record ID |
| before / after | Json? | State snapshots |
| ipAddress | String? | |
| userAgent | String? | |
| metadata | Json? | |
 
Indexes: `[agencyId, createdAt]`, `[entity, entityId]`, `[userId, createdAt]`.
 
### ApiUsage
 
Per connection, per day, per endpoint usage tracking. Enables rate limit enforcement and cost attribution. Present in the schema but only needed in active operation once rate limits become a real concern.
 
| Field | Type | Notes |
|---|---|---|
| connectionId | String | |
| provider | IntegrationProvider | |
| date | Date | |
| endpoint | String? | e.g. "/contacts/search" |
| requestCount / errorCount / rateLimitHits | Int | |
| avgResponseMs | Int? | |
 
Constraint: `@@unique([connectionId, date, endpoint])`.
 
---
 
## Enums Reference
 
| Enum | Values |
|---|---|
| UserRole | SUPER_ADMIN, SYSTEM_OPERATOR, AGENCY_ADMIN, PRODUCER, STAFF, SUPPORT_OPS, READ_ONLY |
| UserStatus | ACTIVE, INACTIVE, SUSPENDED, PENDING_INVITE |
| BillingPlan | STARTER, GROWTH, PROFESSIONAL, ENTERPRISE, WHITE_LABEL |
| IntegrationProvider | GHL, HUBSPOT, ZOHO, SALESFORCE, PIPEDRIVE, AGENCYZOOM, EZLYNX, CUSTOM |
| IntegrationStatus | CONNECTED, DISCONNECTED, ERROR, PENDING_AUTH, RATE_LIMITED, SUSPENDED |
| SyncDirection | PULL, PUSH, BOTH |
| WebhookEventStatus | RECEIVED, PROCESSING, PROCESSED, IGNORED, FAILED, RETRYING |
| AgentRunStatus | QUEUED, RUNNING, COMPLETED, FAILED, RETRYING, CANCELLED, AWAITING_APPROVAL |
| AuditAction | LOGIN, LOGOUT, PASSWORD_CHANGE, INVITE_SENT, INVITE_ACCEPTED, CREATE, UPDATE, DELETE, EXPORT, IMPORT, BULK_UPDATE, PERMISSION_CHANGE, ROLE_CHANGE, INTEGRATION_CONNECT, INTEGRATION_DISCONNECT, INTEGRATION_AUTH_REFRESH, INTEGRATION_SYNC, AGENT_RUN_TRIGGERED, AGENT_RUN_APPROVED, AGENT_RUN_CANCELLED, AGENT_ENABLED, AGENT_DISABLED, CONFIG_CHANGE, SETTING_CHANGE, PLAN_CHANGE, BILLING_UPDATE |
 
---
 
## Common Query Patterns
 
Resolve a Cain AIOS record to its GHL ID for an agent action:
 
```ts
const ref = await prisma.externalRef.findUnique({
  where: {
    provider_entity_localId: {
      provider: 'GHL',
      entity: 'contact',
      localId: someLocalId
    }
  }
})
// ref.externalId is the GHL contact ID
```
 
Find the active GHL connection for a workspace:
 
```ts
const connection = await prisma.integrationConnection.findUnique({
  where: {
    agencyId_workspaceId_provider: {
      agencyId,
      workspaceId,
      provider: 'GHL'
    }
  }
})
```
 
Pull events waiting for retry:
 
```ts
const due = await prisma.webhookEvent.findMany({
  where: { status: 'RETRYING', nextRetryAt: { lte: new Date() } }
})
```
 
