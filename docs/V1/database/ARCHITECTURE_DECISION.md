# Cain AIOS — Architecture Decision Record

Phase 2, Database Foundation. This document captures the decisions made and the reasoning behind them. The schema itself is in the Prisma file; the field-level reference is in SCHEMA_DOCUMENTATION.md.

---

## Platform Position

Cain AIOS is an operational intelligence and operator layer that sits on top of an external CRM. In V1 it is not a CRM itself. It connects to GoHighLevel, runs agents that act against the GHL API, and stores its own platform-native data: tenants, users, agent activity, and audit history.

GHL is the first supported integration and is treated as first-class. The schema is built so that HubSpot, Zoho, Salesforce, AgencyZoom, EZLynx, and others can be added later without restructuring core tables.

---

## Guiding Principle

The question applied to every table was: does Cain AIOS need to own this, or can the CRM own it?

If GHL already owns an entity and Cain AIOS only needs to read or act on it, the data is not duplicated. Agents fetch it from the GHL API and, where they need to remember a record they acted on, store the mapping in ExternalRef.

If Cain AIOS needs to own, enrich, score, or build features on an entity, it gets a native table.

---

## Decisions

### 1. Tenant hierarchy is Agency then Workspace then User

Two tenant levels. Agency is the top of the tree and the billing boundary. Workspace is the operational unit beneath it and the boundary that scopes user visibility and CRM connections.

In V1 a single agency may have a single workspace mapped one-to-one. The structure is retained because it supports real near-term features: a user connecting their own GHL sub-account, and an agency admin creating new units and assigning users to them.

### 2. "Location" was renamed to "Workspace"

The original model was called Location because GHL calls its sub-accounts locations. That is a CRM-specific concept leaking into the core schema. HubSpot, Salesforce, and Zoho have no locations.

The model represents a Cain AIOS operational unit that can connect to any provider. It was renamed to Workspace, a provider-neutral term. Its mapping to a GHL sub-account is handled by ExternalRef and IntegrationConnection, never by the model name.

### 3. No local contacts or leads table in V1

Earlier drafts included a ContactRef table as a thin ownership layer over GHL contacts, and before that a full Lead table. Both were removed for V1.

Reasoning: without a CRM layer there is no reason to maintain a shadow contact record. Agents fetch contact data from the GHL API directly when they need it. There is nothing to store locally until Cain AIOS builds its own CRM. When that happens, a contacts table is added then, and ExternalRef already provides the bridge.

This also removed the open questions about promoting filterable fields to columns and defining custom-field schemas. Those are CRM concerns and are deferred along with the CRM layer.

### 4. ExternalRef is kept, with a narrowed purpose

ExternalRef was originally framed as a CRM sync and portability layer. Without local CRM data to sync, that framing no longer applies in V1.

Its retained purpose is agent action memory. When an agent acts on a GHL record, Cain AIOS needs to remember the external ID so the next run updates the same record instead of creating a duplicate. ExternalRef stores that mapping generically, keyed by provider, entity, and local ID.

It stays generic with an `entity` field rather than being narrowed to a dedicated agent-action table, so it can serve the future CRM layer without another migration. The uniqueness constraints in both directions prevent duplicate or ambiguous mappings.

### 5. PipelineConfig was removed for V1

Pipeline structure lives in GHL. Agents query it via the API. No local pipeline config is needed until webhook routing by stage requires it, which belongs to Phase 3.

### 6. Tasks and Renewals were deferred

Both were considered and then deferred for V1.

Renewals are an insurance-specific concept that no target CRM models natively, so when built they will be a first-class Cain AIOS entity. Tasks would be Cain-native producer workflow rather than synced from GHL. Neither is required for the V1 operator-and-agent foundation, so both are out of scope until the product needs them.

### 7. The integration layer is provider-agnostic

IntegrationConnection holds one row per provider per workspace. Provider identity lives in a Json `externalIds` field because each provider has a different identity shape: GHL uses company and location IDs, HubSpot uses a portal ID, Salesforce uses an org ID and instance URL. Json means adding a provider needs no migration.

Auth tokens are stored encrypted at the application layer, never as plaintext. The workspaceId is nullable so the same table supports both agency-level and sub-account-level authentication.

### 8. V1 connects at the sub-account level only

The product connects to a single GHL sub-account in V1. Agency-level connection is deferred. The logic is expected to be the same, with agency tokens unlocking broader GHL data access. The schema already supports this: agency-level is simply an IntegrationConnection row with a null workspaceId and a company ID in externalIds. No schema change is required to add it later.

### 9. WebhookEvent stores raw payloads, append-only

Inbound webhook events are stored raw and never mutated. Processing logic changes over time; the raw payload does not. Storing raw allows replaying events against updated handlers and gives a full record of what each provider actually sent. The retry-queue index supports efficient reprocessing. This table becomes active in Phase 3 when webhooks go live.

### 10. The agent framework is mandatory for every agent

Every agent in the 35-agent registry runs through AgentDefinition and AgentRun. No agent bypasses logging, cost tracking, or audit. AgentDefinition carries LLM assignment with a fallback model, hard cost ceilings per run and per day, retry config, approval requirements, allowed roles, and a deployment environment. AgentRun is an immutable execution record with full cost, token, timing, and chain-tracking data. AgentCostSummary provides a daily rollup so dashboards do not scan the full run table.

### 11. Audit is immutable and broad

AuditLog is append-only and covers user actions, data changes, permission changes, integration events, agent activity, config changes, and billing changes. Before and after state snapshots are stored as Json. This satisfies the security requirement for audit logging across the platform.

---

## Multi-Provider Expansion Pattern

Adding a new provider such as HubSpot requires no migration on core tables:

1. The provider value already exists in the IntegrationProvider enum.
2. Create an IntegrationConnection row with the provider credentials.
3. Build the provider API client in the integration service layer.
4. Map external IDs via ExternalRef as agents act on records.
5. Add a webhook handler that writes raw events to WebhookEvent.

---

## GHL Notes for the Integration Layer

GHL V1 API reached end-of-support on December 31, 2025. Build against V2 OAuth only.

Auth model: an agency (company) token grants company-level access; a location token grants sub-account access and is required for most contact and opportunity operations. Both are stored as IntegrationConnection rows with the appropriate workspaceId.

Rate limits to enforce via dailyRequestCount and, when active, ApiUsage: 100 requests per 10 seconds and 200,000 requests per day, per location.

---

## Open Items Carried Into Phase 3

These were raised during design and remain to be confirmed before or during Phase 3.

- GHL auth method: OAuth 2.0 versus Private Integration tokens. OAuth 2.0 is the recommended choice given the white-label and multi-agency direction, since Private Integration tokens do not suit a marketplace or SaaS model. A decision should be recorded before the integration foundation is built.
- Custom field definitions and filterable reporting fields: deferred along with the CRM layer. Revisit when a local contacts table is introduced.

---

## What Ships in V1

Active tables:

Core: Agency, Workspace, User, UserPermission, AgencySetting, WorkspaceSetting, AgencyBilling.

Integration: IntegrationConnection, ExternalRef, IntegrationSyncLog.

Agents: AgentDefinition, AgentRun, AgentCostSummary.

Audit: AuditLog.

Present in the schema, activated when their phase or condition arrives:

WebhookEvent and ApiUsage are defined now. WebhookEvent becomes active in Phase 3 when webhooks go live. ApiUsage becomes active when rate limits need operational management.

Deferred until a later product need:

ContactRef and a full contacts table, PipelineConfig, Tasks, and Renewals.